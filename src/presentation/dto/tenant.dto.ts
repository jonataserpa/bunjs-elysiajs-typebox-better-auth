import { t } from 'elysia';
import { TenantStatus } from '@/domain/enums/TenantStatus';

/**
 * DTOs para operações de tenant
 */

// DTO para criação de tenant
export const CreateTenantDTO = t.Object({
  name: t.String({ minLength: 1, maxLength: 100, description: 'Nome do tenant' }),
  slug: t.String({ 
    minLength: 3, 
    maxLength: 50, 
    pattern: '^[a-z0-9-]+$',
    description: 'Slug do tenant (apenas letras minúsculas, números e hífens)' 
  }),
  email: t.String({ format: 'email', description: 'Email do tenant' }),
  settings: t.Object({
    timezone: t.String({ default: 'America/Sao_Paulo', description: 'Fuso horário' }),
    currency: t.String({ default: 'BRL', description: 'Moeda padrão' }),
    language: t.String({ default: 'pt-BR', description: 'Idioma padrão' }),
    paymentMethods: t.Array(t.String(), { description: 'Métodos de pagamento disponíveis' }),
    webhookUrl: t.Optional(t.String({ format: 'uri', description: 'URL do webhook' })),
    apiKeys: t.Optional(t.Record(t.String(), t.String(), { description: 'Chaves de API dos provedores' }))
  })
});

// DTO para atualização de tenant
export const UpdateTenantDTO = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  email: t.Optional(t.String({ format: 'email' })),
  status: t.Optional(t.Enum(TenantStatus)),
  settings: t.Optional(t.Object({
    timezone: t.Optional(t.String()),
    currency: t.Optional(t.String()),
    language: t.Optional(t.String()),
    paymentMethods: t.Optional(t.Array(t.String())),
    webhookUrl: t.Optional(t.String({ format: 'uri' })),
    apiKeys: t.Optional(t.Record(t.String(), t.String()))
  }))
});

// DTO para configurações de tenant
export const TenantSettingsDTO = t.Object({
  timezone: t.String({ description: 'Fuso horário' }),
  currency: t.String({ description: 'Moeda padrão' }),
  language: t.String({ description: 'Idioma padrão' }),
  paymentMethods: t.Array(t.String(), { description: 'Métodos de pagamento' }),
  webhookUrl: t.Optional(t.String({ description: 'URL do webhook' })),
  apiKeys: t.Optional(t.Record(t.String(), t.String(), { description: 'Chaves de API' }))
});

// DTO de resposta para tenant
export const TenantResponseDTO = t.Object({
  id: t.String({ description: 'ID do tenant' }),
  name: t.String({ description: 'Nome do tenant' }),
  slug: t.String({ description: 'Slug do tenant' }),
  email: t.String({ description: 'Email do tenant' }),
  status: t.Enum(TenantStatus, { description: 'Status do tenant' }),
  settings: TenantSettingsDTO,
  createdAt: t.String({ format: 'date-time', description: 'Data de criação' }),
  updatedAt: t.String({ format: 'date-time', description: 'Data de atualização' }),
  isActive: t.Boolean({ description: 'Se o tenant está ativo' })
});

// DTO para listagem de tenants
export const TenantListQueryDTO = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  sort: t.Optional(t.String({ default: 'createdAt' })),
  order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'desc' })),
  status: t.Optional(t.Enum(TenantStatus, { description: 'Filtro por status' })),
  search: t.Optional(t.String({ description: 'Busca por nome, slug ou email' }))
});

// DTO para estatísticas de tenant
export const TenantStatsQueryDTO = t.Object({
  startDate: t.Optional(t.String({ format: 'date' })),
  endDate: t.Optional(t.String({ format: 'date' })),
  includePaymentStats: t.Optional(t.Boolean({ default: true }))
});

// DTO de resposta para estatísticas de tenant
export const TenantStatsResponseDTO = t.Object({
  totalUsers: t.Number({ description: 'Total de usuários' }),
  totalPayments: t.Optional(t.Number({ description: 'Total de pagamentos' })),
  totalAmount: t.Optional(t.Number({ description: 'Valor total processado' })),
  activeUsers: t.Number({ description: 'Usuários ativos' }),
  paymentStats: t.Optional(t.Object({
    pending: t.Number(),
    completed: t.Number(),
    failed: t.Number(),
    cancelled: t.Number()
  })),
  createdAt: t.String({ format: 'date-time', description: 'Data de criação do tenant' }),
  lastActivity: t.Optional(t.String({ format: 'date-time', description: 'Última atividade' }))
});

// DTO para validação de slug de tenant
export const ValidateTenantSlugDTO = t.Object({
  slug: t.String({ 
    minLength: 3, 
    maxLength: 50, 
    pattern: '^[a-z0-9-]+$',
    description: 'Slug a ser validado' 
  }),
  excludeId: t.Optional(t.String({ description: 'ID do tenant a ser excluído da validação' }))
});

// DTO para resposta de validação de slug
export const TenantSlugValidationResponseDTO = t.Object({
  available: t.Boolean({ description: 'Se o slug está disponível' }),
  suggestions: t.Optional(t.Array(t.String(), { description: 'Sugestões de slugs alternativos' }))
});

// DTO para configuração de webhook de tenant
export const TenantWebhookConfigDTO = t.Object({
  url: t.String({ format: 'uri', description: 'URL do webhook' }),
  events: t.Array(t.String(), { description: 'Eventos a serem enviados' }),
  secret: t.Optional(t.String({ description: 'Segredo para assinatura' })),
  timeout: t.Optional(t.Number({ minimum: 1000, maximum: 30000, default: 10000 })),
  retries: t.Optional(t.Number({ minimum: 0, maximum: 5, default: 3 }))
});

// DTO para teste de webhook de tenant
export const TenantWebhookTestDTO = t.Object({
  url: t.String({ format: 'uri', description: 'URL do webhook para teste' }),
  secret: t.Optional(t.String({ description: 'Segredo para assinatura' }))
});

// DTO para resposta de teste de webhook
export const TenantWebhookTestResponseDTO = t.Object({
  success: t.Boolean({ description: 'Se o teste foi bem-sucedido' }),
  responseTime: t.Optional(t.Number({ description: 'Tempo de resposta em ms' })),
  statusCode: t.Optional(t.Number({ description: 'Código de status HTTP' })),
  error: t.Optional(t.String({ description: 'Mensagem de erro se houver' }))
});

// DTO para configuração de API keys de tenant
export const TenantApiKeysDTO = t.Object({
  stripe: t.Optional(t.Object({
    publishableKey: t.String({ description: 'Chave pública do Stripe' }),
    secretKey: t.String({ description: 'Chave secreta do Stripe' }),
    webhookSecret: t.Optional(t.String({ description: 'Segredo do webhook do Stripe' }))
  })),
  pagarme: t.Optional(t.Object({
    apiKey: t.String({ description: 'Chave da API do Pagar.me' }),
    webhookSecret: t.Optional(t.String({ description: 'Segredo do webhook do Pagar.me' }))
  }))
});

// DTO para resposta de configuração de API keys
export const TenantApiKeysResponseDTO = t.Object({
  configured: t.Record(t.String(), t.Boolean(), { description: 'Provedores configurados' }),
  lastUpdated: t.Optional(t.String({ format: 'date-time', description: 'Última atualização' }))
});

// DTO para operações de tenant (ativar/desativar/suspender)
export const TenantOperationDTO = t.Object({
  operation: t.Union([
    t.Literal('activate'),
    t.Literal('deactivate'),
    t.Literal('suspend')
  ], { description: 'Operação a ser executada' }),
  reason: t.Optional(t.String({ maxLength: 255, description: 'Motivo da operação' }))
});

// DTO para resposta de operação de tenant
export const TenantOperationResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  message: t.String({ description: 'Mensagem de confirmação' }),
  previousStatus: t.Enum(TenantStatus, { description: 'Status anterior' }),
  newStatus: t.Enum(TenantStatus, { description: 'Novo status' }),
  timestamp: t.String({ format: 'date-time' })
});

// DTO para filtros de busca
export const TenantFiltersDTO = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  status: t.Optional(t.String()),
});

// DTO para resposta de lista de tenants
export const TenantListResponseDTO = t.Object({
  success: t.Boolean(),
  data: t.Array(TenantResponseDTO),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
  timestamp: t.String(),
});

// DTO para resposta de um tenant
export const TenantResponseResponseDTO = t.Object({
  success: t.Boolean(),
  data: t.Union([TenantResponseDTO, t.Null()]),
  timestamp: t.String(),
});

// DTO para listagem de tenants (array de TenantResponseDTO)
export const TenantListDTO = t.Array(TenantResponseDTO);

// Tipos TypeScript para uso interno
export type TenantDTO = {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: string;
  settings: Record<string, any> | null;
  apiKeys: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
