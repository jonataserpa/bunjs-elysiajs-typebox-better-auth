// Infrastructure Layer - Barrel Export
// Este arquivo exporta todas as implementações concretas da camada de infraestrutura

// Database
export * from './database/connection';
export * from './database/schema';
export * from './database/repositories/payment.repository';
export * from './database/repositories/tenant.repository';
export * from './database/repositories/user.repository';

// External Services
// export * from './external/stripe/stripe.gateway';
// export * from './external/stripe/stripe.config';
// export * from './external/pagarme/pagarme.gateway';
// export * from './external/pagarme/pagarme.config';
// export * from './external/notifications/email.gateway';
// export * from './external/notifications/webhook.gateway';

// Authentication
// export * from './auth/better-auth.config';
// export * from './auth/jwt.service';

// Logging
// export * from './logging/logger';
// export * from './logging/audit.logger';
// export * from './logging/metrics.logger';
