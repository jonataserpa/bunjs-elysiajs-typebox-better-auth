export const APP_CONSTANTS = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  // API Routes
  API_ROUTES: {
    HEALTH: '/health',
    AUTH: '/auth',
    PAYMENTS: '/payments',
    TENANTS: '/tenants',
    DOCS: '/docs',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // JWT
  JWT: {
    DEFAULT_EXPIRES_IN: '24h',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    AUTHORIZED: 'authorized',
    CAPTURED: 'captured',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    FINANCE: 'finance',
    SUPPORT: 'support',
  },

  // Payment Providers
  PAYMENT_PROVIDERS: {
    STRIPE: 'stripe',
    PAGARME: 'pagarme',
  },
} as const;
