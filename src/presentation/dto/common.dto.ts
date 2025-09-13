import { t, type TSchema } from 'elysia';

/**
 * DTOs comuns para respostas da API
 */

// Resposta de sucesso genérica
export const SuccessResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  data: t.Any(),
  timestamp: t.String()
});

// Resposta de erro genérica
export const ErrorResponseDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String(),
  details: t.Optional(t.Union([t.String(), t.Array(t.String())])),
  timestamp: t.String()
});

// Resposta paginada genérica
export const PaginatedResponseDTO = <T extends TSchema>(itemSchema: T) => t.Object({
  success: t.Boolean({ default: true }),
  data: t.Array(itemSchema),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
    hasNext: t.Boolean(),
    hasPrev: t.Boolean()
  }),
  timestamp: t.String()
});

// Parâmetros de paginação
export const PaginationQueryDTO = t.Object({
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  sort: t.Optional(t.String({ default: 'createdAt' })),
  order: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'desc' }))
});

// Filtros de data
export const DateFilterDTO = t.Object({
  startDate: t.Optional(t.String({ format: 'date' })),
  endDate: t.Optional(t.String({ format: 'date' })),
  timezone: t.Optional(t.String({ default: 'UTC' }))
});

// Parâmetro de ID
export const IdParamDTO = t.Object({
  id: t.String({ minLength: 1, description: 'ID do recurso' })
});

// Headers comuns
export const CommonHeadersDTO = t.Object({
  'x-tenant-id': t.Optional(t.String({ minLength: 1, description: 'ID do tenant' })),
  'tenant-id': t.Optional(t.String({ minLength: 1, description: 'ID do tenant' })),
  'authorization': t.Optional(t.String({ description: 'Token de autorização Bearer' })),
  'user-agent': t.Optional(t.String({ description: 'User Agent do cliente' })),
  'x-forwarded-for': t.Optional(t.String({ description: 'IP do cliente' }))
});

// Resposta de validação
export const ValidationErrorDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String({ default: 'Dados de entrada inválidos' }),
  details: t.Array(t.Object({
    field: t.String(),
    message: t.String(),
    code: t.Optional(t.String())
  })),
  timestamp: t.String()
});

// Resposta de não encontrado
export const NotFoundResponseDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String({ default: 'Recurso não encontrado' }),
  timestamp: t.String()
});

// Resposta de acesso negado
export const ForbiddenResponseDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String({ default: 'Acesso negado' }),
  timestamp: t.String()
});

// Resposta de não autorizado
export const UnauthorizedResponseDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String({ default: 'Não autorizado' }),
  timestamp: t.String()
});

// Resposta de conflito
export const ConflictResponseDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String({ default: 'Conflito de recursos' }),
  details: t.Optional(t.String()),
  timestamp: t.String()
});

// Resposta de erro interno do servidor
export const InternalServerErrorResponseDTO = t.Object({
  success: t.Boolean({ default: false }),
  error: t.String({ default: 'Erro interno do servidor' }),
  timestamp: t.String(),
  requestId: t.Optional(t.String())
});

// Metadados de resposta
export const ResponseMetadataDTO = t.Object({
  timestamp: t.String(),
  requestId: t.Optional(t.String()),
  version: t.Optional(t.String()),
  environment: t.Optional(t.String())
});

// Filtros genéricos
export const GenericFiltersDTO = t.Object({
  search: t.Optional(t.String({ description: 'Termo de busca' })),
  status: t.Optional(t.String({ description: 'Filtro por status' })),
  category: t.Optional(t.String({ description: 'Filtro por categoria' })),
  tags: t.Optional(t.Array(t.String(), { description: 'Filtro por tags' }))
});

// Ordenação genérica
export const GenericSortDTO = t.Object({
  field: t.String({ description: 'Campo para ordenação' }),
  direction: t.Union([t.Literal('asc'), t.Literal('desc')], { default: 'asc' })
});

// Resposta de criação
export const CreatedResponseDTO = <T extends TSchema>(dataSchema: T) => t.Object({
  success: t.Boolean({ default: true }),
  data: dataSchema,
  message: t.Optional(t.String()),
  timestamp: t.String()
});

// Resposta de atualização
export const UpdatedResponseDTO = <T extends TSchema>(dataSchema: T) => t.Object({
  success: t.Boolean({ default: true }),
  data: dataSchema,
  message: t.Optional(t.String()),
  timestamp: t.String()
});

// Resposta de exclusão
export const DeletedResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  message: t.Optional(t.String()),
  timestamp: t.String()
});

// Resposta de operação em lote
export const BatchResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  data: t.Object({
    processed: t.Number(),
    successful: t.Number(),
    failed: t.Number(),
    errors: t.Optional(t.Array(t.Object({
      item: t.Any(),
      error: t.String()
    })))
  }),
  timestamp: t.String()
});

// Resposta de health check
export const HealthCheckResponseDTO = t.Object({
  success: t.Boolean({ default: true }),
  data: t.Object({
    status: t.String(),
    timestamp: t.String(),
    uptime: t.Number(),
    version: t.Optional(t.String()),
    environment: t.Optional(t.String()),
    services: t.Optional(t.Object({
      database: t.String(),
      redis: t.Optional(t.String()),
      external: t.Optional(t.Object({
        stripe: t.Optional(t.String()),
        pagarme: t.Optional(t.String())
      }))
    }))
  }),
  timestamp: t.String()
});
