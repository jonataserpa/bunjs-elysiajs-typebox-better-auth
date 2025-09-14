import { Elysia, t } from 'elysia';
import { logger } from '../../infrastructure/logging/Logger';
import { jwt } from '@elysiajs/jwt';
import { appConfig } from '../../shared/config/app.config';
import {
  SuccessResponseDTO } from '../dto/common.dto';
import { simpleCorsMiddleware, simpleValidationMiddleware, simpleLoggingMiddleware } from '../middleware/simple.middleware';
import { TracingUtil } from '../../shared/utils/tracing.util';

/**
 * DTOs para autenticação
 */
const LoginDTO = t.Object({
  email: t.String({ format: 'email', description: 'Email do usuário' }),
  password: t.String({ minLength: 6, description: 'Senha do usuário' }),
  tenantId: t.String({ minLength: 1, description: 'ID do tenant' })
});

const RegisterDTO = t.Object({
  name: t.String({ minLength: 1, maxLength: 100, description: 'Nome do usuário' }),
  email: t.String({ format: 'email', description: 'Email do usuário' }),
  password: t.String({ minLength: 6, description: 'Senha do usuário' }),
  tenantId: t.String({ minLength: 1, description: 'ID do tenant' })
});

const RefreshTokenDTO = t.Object({
  refreshToken: t.String({ description: 'Refresh token' })
});

const AuthResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  data: t.Object({
    user: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      role: t.String(),
      tenantId: t.String()
    }),
    tokens: t.Object({
      accessToken: t.String(),
      refreshToken: t.String(),
      expiresIn: t.Number()
    })
  }),
  timestamp: t.String()
});

/**
 * Rotas de autenticação
 */
export const authRoutes = new Elysia({ prefix: '/api/v1/auth', name: 'auth-routes' })
  .use(simpleLoggingMiddleware)
  .use(simpleCorsMiddleware)
  .use(simpleValidationMiddleware)
  .use(jwt({
    name: 'jwt',
    secret: appConfig.auth.jwtSecret,
    exp: appConfig.auth.jwtExpiresIn,
  }))
  .derive(async ({ jwt }) => {
    // TODO: Implementar UserRepository e AuthService
    // const userRepository = new DrizzleUserRepository();
    // const authService = new AuthService(userRepository);
    
    return {
      // authService,
      generateTokens: async (user: any) => {
        const payload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId
        };

        const accessToken = await jwt.sign(payload);
        const refreshToken = await jwt.sign({ ...payload, type: 'refresh' });

        return {
          accessToken,
          refreshToken,
          expiresIn: 3600 // 1 hora
        };
      }
    };
  })

  // POST /auth/login - Login
  .post('/login', async ({ body, generateTokens }) => {
    const span = TracingUtil.createHttpSpan(
      'POST /api/v1/auth/login',
      'POST',
      '/api/v1/auth/login',
      {
        'auth.tenant_id': body.tenantId,
        'auth.email': body.email
      }
    );

    try {
      span.addEvent('auth.login.started', {
        email: body.email,
        tenantId: body.tenantId
      });

      // TODO: Implementar validação de credenciais
      // const user = await authService.validateCredentials(body.email, body.password, body.tenantId);
      
      // Simulação temporária
      const user = {
        id: 'temp-user-id',
        name: 'Usuário Temporário',
        email: body.email,
        role: 'user',
        tenantId: body.tenantId
      };

      if (!user) {
        span.setStatus(401, new Error('Credenciais inválidas'));
        span.end();
        
        return {
          success: false,
          data: {
            user: {
              id: '',
              name: '',
              email: '',
              role: '',
              tenantId: ''
            },
            tokens: {
              accessToken: '',
              refreshToken: '',
              expiresIn: 0
            }
          },
          error: 'Credenciais inválidas',
          timestamp: new Date().toISOString()
        };
      }

      span.addEvent('auth.credentials.validated', {
        userId: user.id,
        userRole: user.role
      });

      const tokens = await generateTokens(user);

      span.addEvent('auth.tokens.generated', {
        tokenType: 'access_refresh'
      });

      logger.info('Login realizado com sucesso', 'AuthController', {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId
      });

      span.setStatus(200);
      span.end();

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
          },
          tokens
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      span.setStatus(500, error as Error);
      span.end();
      logger.error('Erro no login', error as Error, 'AuthController');
      throw error;
    }
  }, {
    body: LoginDTO,
    response: AuthResponseDTO,
    detail: {
      tags: ['Auth'],
      summary: 'Login',
      description: 'Realiza login do usuário com email, senha e tenant ID',
    }
  })

  // POST /auth/register - Registro
  .post('/register', async ({ body, generateTokens }) => {
    const span = TracingUtil.createHttpSpan(
      'POST /api/v1/auth/register',
      'POST',
      '/api/v1/auth/register',
      {
        'auth.tenant_id': body.tenantId,
        'auth.email': body.email,
        'user.name': body.name
      }
    );

    try {
      span.addEvent('auth.register.started', {
        email: body.email,
        tenantId: body.tenantId,
        userName: body.name
      });

      // TODO: Implementar criação de usuário
      // const user = await authService.createUser(body);
      
      // Simulação temporária
      const user = {
        id: 'temp-user-id',
        name: body.name,
        email: body.email,
        role: 'user',
        tenantId: body.tenantId
      };

      span.addEvent('auth.user.created', {
        userId: user.id,
        userRole: user.role
      });

      const tokens = await generateTokens(user);

      span.addEvent('auth.tokens.generated', {
        tokenType: 'access_refresh'
      });

      logger.info('Usuário registrado com sucesso', 'AuthController', {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId
      });

      span.setStatus(201);
      span.end();

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
          },
          tokens
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      span.setStatus(500, error as Error);
      span.end();
      logger.error('Erro no registro', error as Error, 'AuthController');
      throw error;
    }
  }, {
    body: RegisterDTO,
    response: AuthResponseDTO,
    detail: {
      tags: ['Auth'],
      summary: 'Registro',
      description: 'Registra um novo usuário no sistema',
    }
  })

  // POST /auth/refresh - Renovar token
  .post('/refresh', async ({ body, jwt, generateTokens }) => {
    const span = TracingUtil.createHttpSpan(
      'POST /api/v1/auth/refresh',
      'POST',
      '/api/v1/auth/refresh'
    );

    try {
      span.addEvent('auth.refresh.started');

      // TODO: Implementar validação de refresh token
      const payload = await jwt.verify(body.refreshToken);
      
      if (!payload || payload.type !== 'refresh') {
        span.setStatus(401, new Error('Refresh token inválido'));
        span.end();
        
        return {
          success: false,
          data: {
            user: {
              id: '',
              name: '',
              email: '',
              role: '',
              tenantId: ''
            },
            tokens: {
              accessToken: '',
              refreshToken: '',
              expiresIn: 0
            }
          },
          error: 'Refresh token inválido',
          timestamp: new Date().toISOString()
        };
      }

      span.addEvent('auth.refresh.token_validated', {
        userId: String(payload.userId),
        userEmail: String(payload.email)
      });

      // TODO: Buscar usuário no banco
      const user = {
        id: String(payload.userId),
        name: 'Usuário',
        email: String(payload.email),
        role: String(payload.role),
        tenantId: String(payload.tenantId)
      };

      const tokens = await generateTokens(user);

      span.addEvent('auth.tokens.refreshed', {
        tokenType: 'access_refresh'
      });

      span.setStatus(200);
      span.end();

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
          },
          tokens
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      span.setStatus(500, error as Error);
      span.end();
      logger.error('Erro ao renovar token', error as Error, 'AuthController');
      throw error;
    }
  }, {
    body: RefreshTokenDTO,
    response: AuthResponseDTO,
    detail: {
      tags: ['Auth'],
      summary: 'Renovar Token',
      description: 'Renova o token de acesso usando o refresh token',
    }
  })

  // POST /auth/logout - Logout
  .post('/logout', async ({ headers }) => {
    const span = TracingUtil.createHttpSpan(
      'POST /api/v1/auth/logout',
      'POST',
      '/api/v1/auth/logout'
    );

    try {
      span.addEvent('auth.logout.started');

      // TODO: Implementar blacklist de tokens
      
      span.addEvent('auth.logout.completed');
      
      logger.info('Logout realizado', 'AuthController', {
        userId: 'unknown'
      });

      span.setStatus(200);
      span.end();

      return {
        success: true,
        data: {
          message: 'Logout realizado com sucesso'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      span.setStatus(500, error as Error);
      span.end();
      logger.error('Erro no logout', error as Error, 'AuthController');
      throw error;
    }
  }, {
    response: SuccessResponseDTO,
    detail: {
      tags: ['Auth'],
      summary: 'Logout',
      description: 'Realiza logout do usuário e invalida o token',
    }
  })

  // GET /auth/me - Informações do usuário atual
  .get('/me', async ({ headers }) => {
    const span = TracingUtil.createHttpSpan(
      'GET /api/v1/auth/me',
      'GET',
      '/api/v1/auth/me'
    );

    try {
      span.addEvent('auth.me.started');

      // TODO: Implementar extração de token e validação de usuário
      
      span.addEvent('auth.me.user_info_retrieved', {
        userId: 'temp-user-id',
        userRole: 'user'
      });

      span.setStatus(200);
      span.end();
      
      return {
        success: true,
        data: {
          id: 'temp-user-id',
          email: 'user@example.com',
          role: 'user',
          tenantId: 'temp-tenant-id'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      span.setStatus(500, error as Error);
      span.end();
      logger.error('Erro ao obter informações do usuário', error as Error, 'AuthController');
      throw error;
    }
  }, {
    response: SuccessResponseDTO,
    detail: {
      tags: ['Auth'],
      summary: 'Informações do Usuário',
      description: 'Retorna as informações do usuário autenticado',
    }
  });
