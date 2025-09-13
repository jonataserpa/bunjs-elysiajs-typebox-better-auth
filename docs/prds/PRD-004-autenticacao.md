# PRD-004: Sistema de Autenticação e Autorização

## 1. Visão Geral

### 1.1 Objetivo
Implementar um sistema robusto de autenticação e autorização baseado em Better Auth, seguindo Clean Architecture e DDD, com suporte nativo a multi-tenancy e controle granular de permissões.

### 1.2 Escopo
- Autenticação JWT com Better Auth
- Sistema de autorização baseado em roles
- Suporte a multi-tenancy
- Middleware de autenticação
- Gestão de usuários e permissões
- Integração com Clean Architecture

### 1.3 Critérios de Sucesso
- Autenticação segura sem dependência de serviços externos
- Controle granular de permissões por tenant
- Performance otimizada para validação de tokens
- Integração perfeita com multi-tenancy
- Cobertura de testes completa com TDD

## 2. Requisitos Funcionais

### 2.1 Autenticação
- **RF-001**: Login com email e senha
- **RF-002**: Geração de JWT com informações do usuário e tenant
- **RF-003**: Validação de JWT em todas as requisições protegidas
- **RF-004**: Refresh token para renovação automática
- **RF-005**: Logout com invalidação de token
- **RF-006**: Registro de novos usuários

### 2.2 Autorização
- **RF-007**: Sistema de roles (admin, customer, finance, support)
- **RF-008**: Permissões granulares por recurso
- **RF-009**: Validação de acesso por tenant
- **RF-010**: Middleware de autorização
- **RF-011**: Controle de acesso a endpoints específicos

### 2.3 Multi-tenancy
- **RF-012**: JWT contém tenant_id
- **RF-013**: Validação de tenant_id em todas as operações
- **RF-014**: Isolamento de usuários por tenant
- **RF-015**: Configuração de permissões por tenant

### 2.4 Gestão de Usuários
- **RF-016**: CRUD de usuários por tenant
- **RF-017**: Atribuição de roles a usuários
- **RF-018**: Reset de senha
- **RF-019**: Ativação/desativação de usuários
- **RF-020**: Auditoria de ações de usuários

## 3. Requisitos Não Funcionais

### 3.1 Segurança
- **RNF-001**: JWT assinado com chave secreta forte
- **RNF-002**: Expiração de tokens em 24 horas
- **RNF-003**: Rate limiting para tentativas de login
- **RNF-004**: Proteção contra ataques de força bruta
- **RNF-005**: Logs de auditoria para todas as ações

### 3.2 Performance
- **RNF-006**: Validação de JWT < 10ms
- **RNF-007**: Cache de permissões por usuário
- **RNF-008**: Suporte a 10.000+ usuários simultâneos
- **RNF-009**: Refresh token sem impacto na performance

### 3.3 Confiabilidade
- **RNF-010**: Disponibilidade de 99.9%
- **RNF-011**: Fallback para autenticação local
- **RNF-012**: Recuperação automática de falhas
- **RNF-013**: Backup de configurações de auth

## 4. Arquitetura Proposta

### 4.1 Clean Architecture - Camada de Domínio
```typescript
// Domain Entity - User
export class User {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private readonly _tenantId: TenantId,
    private readonly _role: UserRole,
    private readonly _permissions: Permission[],
    private readonly _isActive: boolean
  ) {}

  static create(data: CreateUserData): User {
    return new User(
      UserId.generate(),
      new Email(data.email),
      new TenantId(data.tenantId),
      UserRole.fromString(data.role),
      data.permissions.map(p => Permission.fromString(p)),
      true
    )
  }

  canAccess(resource: string, action: string): boolean {
    return this._permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    )
  }

  belongsToTenant(tenantId: TenantId): boolean {
    return this._tenantId.equals(tenantId)
  }
}

// Value Objects
export class Email {
  constructor(private readonly _value: string) {
    if (!this.isValid(_value)) {
      throw new InvalidEmailError(_value)
    }
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  get value(): string {
    return this._value
  }
}

export class UserRole {
  private constructor(private readonly _value: string) {}

  static fromString(role: string): UserRole {
    const validRoles = ['admin', 'customer', 'finance', 'support']
    if (!validRoles.includes(role)) {
      throw new InvalidRoleError(role)
    }
    return new UserRole(role)
  }

  get value(): string {
    return this._value
  }
}
```

### 4.2 Application Layer - Use Cases
```typescript
// Use Case - Login
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly authService: AuthServiceInterface,
    private readonly passwordService: PasswordServiceInterface
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // 1. Validar entrada
    const email = new Email(request.email)
    const password = new Password(request.password)

    // 2. Buscar usuário
    const user = await this.userRepository.findByEmailAndTenant(
      email.value, 
      new TenantId(request.tenantId)
    )

    if (!user) {
      throw new InvalidCredentialsError()
    }

    // 3. Validar senha
    const isValidPassword = await this.passwordService.verify(
      password.value, 
      user.hashedPassword
    )

    if (!isValidPassword) {
      throw new InvalidCredentialsError()
    }

    // 4. Gerar JWT
    const token = await this.authService.generateToken({
      userId: user.id.value,
      email: user.email.value,
      tenantId: user.tenantId.value,
      role: user.role.value,
      permissions: user.permissions.map(p => p.toString())
    })

    return new LoginResponse(token, user.role.value)
  }
}

// Use Case - Authorize
export class AuthorizeUseCase {
  constructor(
    private readonly authService: AuthServiceInterface,
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(request: AuthorizeRequest): Promise<AuthorizeResponse> {
    // 1. Validar JWT
    const payload = await this.authService.validateToken(request.token)
    
    // 2. Buscar usuário
    const user = await this.userRepository.findById(
      new UserId(payload.userId)
    )

    if (!user || !user.isActive) {
      throw new UnauthorizedError()
    }

    // 3. Validar tenant
    if (!user.belongsToTenant(new TenantId(request.tenantId))) {
      throw new ForbiddenError('User does not belong to this tenant')
    }

    // 4. Validar permissões
    const hasPermission = user.canAccess(request.resource, request.action)
    
    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions')
    }

    return new AuthorizeResponse(user)
  }
}
```

### 4.3 Infrastructure Layer - Better Auth Integration
```typescript
// Better Auth Service
export class BetterAuthService implements AuthServiceInterface {
  private betterAuth: BetterAuth

  constructor() {
    this.betterAuth = new BetterAuth({
      database: {
        provider: 'postgresql',
        url: process.env.DATABASE_URL
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false
      },
      jwt: {
        secretKey: process.env.JWT_SECRET,
        expiresIn: '24h'
      },
      plugins: [
        // Plugin customizado para multi-tenancy
        {
          id: 'multi-tenant',
          create: () => ({
            hooks: {
              beforeSignIn: async (user, context) => {
                // Adicionar tenant_id ao contexto
                context.tenantId = user.tenantId
                return user
              }
            }
          })
        }
      ]
    })
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    return await this.betterAuth.createToken({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    })
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.betterAuth.verifyToken(token)
      return payload as TokenPayload
    } catch (error) {
      throw new InvalidTokenError()
    }
  }
}
```

### 4.4 Presentation Layer - Middleware
```typescript
// Auth Middleware
export const authMiddleware = () => {
  return new Elysia()
    .guard({
      beforeHandle: async ({ headers, set, jwt }) => {
        const authHeader = headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          set.status = 401
          return { error: 'Missing or invalid authorization header' }
        }

        const token = authHeader.substring(7)
        
        try {
          const payload = await authService.validateToken(token)
          
          // Injetar dados do usuário no contexto
          jwt.userId = payload.userId
          jwt.email = payload.email
          jwt.tenantId = payload.tenantId
          jwt.role = payload.role
          jwt.permissions = payload.permissions
          
        } catch (error) {
          set.status = 401
          return { error: 'Invalid token' }
        }
      }
    })
}

// Authorization Middleware
export const requirePermission = (resource: string, action: string) => {
  return new Elysia()
    .guard({
      beforeHandle: async ({ jwt, set }) => {
        const userPermissions = jwt.permissions || []
        const hasPermission = userPermissions.some((p: any) => 
          p.resource === resource && p.actions.includes(action)
        )

        if (!hasPermission) {
          set.status = 403
          return { error: 'Insufficient permissions' }
        }
      }
    })
}

// Tenant Middleware
export const requireTenant = (tenantId: string) => {
  return new Elysia()
    .guard({
      beforeHandle: async ({ jwt, set }) => {
        if (jwt.tenantId !== tenantId) {
          set.status = 403
          return { error: 'Access denied for this tenant' }
        }
      }
    })
}
```

## 5. Controllers HTTP

### 5.1 Auth Controller
```typescript
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  async login(request: LoginRequest): Promise<LoginResponse> {
    return await this.loginUseCase.execute(request)
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return await this.registerUseCase.execute(request)
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return await this.refreshTokenUseCase.execute(request)
  }

  async logout(request: LogoutRequest): Promise<void> {
    // Implementar invalidação de token
  }
}
```

### 5.2 Routes
```typescript
// Auth Routes
export const authRoutes = new Elysia()
  .post('/auth/login', async ({ body }) => {
    const controller = container.resolve<AuthController>('AuthController')
    return await controller.login(body)
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      tenantId: t.String()
    })
  })
  
  .post('/auth/register', async ({ body }) => {
    const controller = container.resolve<AuthController>('AuthController')
    return await controller.register(body)
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      tenantId: t.String(),
      role: t.String()
    })
  })

// Protected Routes
export const protectedRoutes = new Elysia()
  .use(authMiddleware())
  .get('/profile', async ({ jwt }) => {
    return {
      userId: jwt.userId,
      email: jwt.email,
      tenantId: jwt.tenantId,
      role: jwt.role
    }
  })
  .use(requirePermission('payments', 'read'))
  .get('/payments', async ({ jwt }) => {
    // Listar pagamentos do usuário/tenant
  })
```

## 6. Testes TDD

### 6.1 Testes Unitários - Domain
```typescript
// User Entity Tests
describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = User.create({
      email: 'test@example.com',
      tenantId: 'tenant-123',
      role: 'customer',
      permissions: ['payments:read', 'payments:create']
    })

    expect(user.email.value).toBe('test@example.com')
    expect(user.role.value).toBe('customer')
  })

  it('should validate email format', () => {
    expect(() => {
      new Email('invalid-email')
    }).toThrow(InvalidEmailError)
  })

  it('should check permissions correctly', () => {
    const user = User.create({
      email: 'test@example.com',
      tenantId: 'tenant-123',
      role: 'customer',
      permissions: ['payments:read']
    })

    expect(user.canAccess('payments', 'read')).toBe(true)
    expect(user.canAccess('payments', 'delete')).toBe(false)
  })
})
```

### 6.2 Testes de Integração
```typescript
// Login Use Case Tests
describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>
  let mockAuthService: jest.Mocked<AuthServiceInterface>

  beforeEach(() => {
    mockUserRepository = {
      findByEmailAndTenant: jest.fn(),
      findById: jest.fn(),
      save: jest.fn()
    }

    mockAuthService = {
      generateToken: jest.fn(),
      validateToken: jest.fn()
    }

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockAuthService,
      new PasswordService()
    )
  })

  it('should login successfully with valid credentials', async () => {
    // Arrange
    const user = User.create({
      email: 'test@example.com',
      tenantId: 'tenant-123',
      role: 'customer',
      permissions: []
    })

    mockUserRepository.findByEmailAndTenant.mockResolvedValue(user)
    mockAuthService.generateToken.mockResolvedValue('jwt-token')

    // Act
    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
      tenantId: 'tenant-123'
    })

    // Assert
    expect(result.token).toBe('jwt-token')
    expect(mockAuthService.generateToken).toHaveBeenCalledWith({
      userId: user.id.value,
      email: user.email.value,
      tenantId: user.tenantId.value,
      role: user.role.value,
      permissions: []
    })
  })
})
```

## 7. Critérios de Aceitação

### 7.1 Autenticação
- [ ] Login com email e senha funciona corretamente
- [ ] JWT é gerado com informações corretas
- [ ] Validação de JWT funciona em todas as requisições
- [ ] Refresh token funciona corretamente
- [ ] Logout invalida o token

### 7.2 Autorização
- [ ] Sistema de roles funciona corretamente
- [ ] Permissões granulares são validadas
- [ ] Middleware de autorização funciona
- [ ] Controle de acesso por tenant funciona

### 7.3 Segurança
- [ ] JWT é assinado com chave forte
- [ ] Tokens expiram em 24 horas
- [ ] Rate limiting funciona para login
- [ ] Logs de auditoria são gerados

### 7.4 Performance
- [ ] Validação de JWT < 10ms
- [ ] Cache de permissões funciona
- [ ] Sistema suporta 10.000+ usuários simultâneos

## 8. Riscos e Mitigações

### 8.1 Riscos de Segurança
- **Risco**: Vazamento de JWT
  - **Mitigação**: Tokens com expiração curta e HTTPS obrigatório
- **Risco**: Ataques de força bruta
  - **Mitigação**: Rate limiting e lockout de conta

### 8.2 Riscos Técnicos
- **Risco**: Performance degradada com muitos usuários
  - **Mitigação**: Cache de permissões e otimização de queries

## 9. Cronograma

### Fase 1: Domain Layer (1 semana)
- Implementação das entidades e value objects
- Testes unitários com TDD
- Domain services e eventos

### Fase 2: Application Layer (1 semana)
- Use cases de autenticação
- Interfaces e mappers
- Testes de integração

### Fase 3: Infrastructure Layer (1 semana)
- Integração com Better Auth
- Implementação de repositories
- Testes de infraestrutura

### Fase 4: Presentation Layer (1 semana)
- Controllers e middleware
- Routes e validação
- Testes E2E

## 10. Métricas de Sucesso

### 10.1 Métricas Operacionais
- Taxa de sucesso de login: > 99%
- Tempo de validação de JWT: < 10ms
- Disponibilidade do sistema: > 99.9%
- Zero vazamentos de credenciais

### 10.2 Métricas de Qualidade
- Cobertura de testes: > 95%
- Tempo de resolução de incidentes: < 1 hora
- Satisfação dos desenvolvedores: > 8/10
- Zero falhas de segurança

## 11. Próximos Passos

1. **Implementação das entidades de domínio com TDD**
2. **Criação dos value objects e domain services**
3. **Desenvolvimento dos use cases de autenticação**
4. **Integração com Better Auth**
5. **Implementação dos middlewares de autenticação e autorização**
6. **Criação dos controllers HTTP**
7. **Configuração das rotas protegidas**
8. **Implementação dos testes E2E**
9. **Configuração de logs de auditoria**
10. **Documentação e treinamento da equipe**
