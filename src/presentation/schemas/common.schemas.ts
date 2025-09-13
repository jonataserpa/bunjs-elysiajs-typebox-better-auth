import { Type } from '@sinclair/typebox';

// Schema para resposta de erro padrão
export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  timestamp: Type.String(),
  path: Type.Optional(Type.String()),
});

// Schema para resposta de sucesso padrão
export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String()),
  data: Type.Optional(Type.Any()),
  timestamp: Type.String(),
});

// Schema para paginação
export const PaginationSchema = Type.Object({
  page: Type.Number({ minimum: 1, default: 1 }),
  limit: Type.Number({ minimum: 1, maximum: 100, default: 20 }),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal('asc'), Type.Literal('desc')])
  ),
});

// Schema para resposta paginada
export const PaginatedResponseSchema = Type.Object({
  data: Type.Array(Type.Any()),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  }),
  timestamp: Type.String(),
});

// Schema para ID de recurso
export const ResourceIdSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

// Schema para timestamp
export const TimestampSchema = Type.Object({
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

// Schema para metadados
export const MetadataSchema = Type.Object({
  tenantId: Type.String({ format: 'uuid' }),
  userId: Type.Optional(Type.String({ format: 'uuid' })),
  requestId: Type.Optional(Type.String({ format: 'uuid' })),
});

// Schema para validação de tenant
export const TenantHeaderSchema = Type.Object({
  'x-tenant-id': Type.Optional(Type.String({ format: 'uuid' })),
});

// Schema para autorização
export const AuthorizationSchema = Type.Object({
  authorization: Type.String({ pattern: '^Bearer .+' }),
});
