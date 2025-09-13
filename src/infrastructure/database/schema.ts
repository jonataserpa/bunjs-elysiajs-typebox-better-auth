import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ===== TABELA DE TENANTS =====
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    
    // Configurações do tenant
    settings: jsonb('settings').$type<{
      timezone?: string;
      currency?: string;
      language?: string;
      paymentMethods?: string[];
      webhookUrl?: string;
      apiKeys?: Record<string, string>;
    }>(),
    
    // Metadados
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    slugIdx: index('tenants_slug_idx').on(table.slug),
    statusIdx: index('tenants_status_idx').on(table.status),
    emailIdx: index('tenants_email_idx').on(table.email),
  })
);

// ===== TABELA DE USUÁRIOS =====
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    role: varchar('role', { length: 50 }).notNull().default('customer'),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    
    // Configurações do usuário
    preferences: jsonb('preferences').$type<{
      notifications?: boolean;
      theme?: string;
      language?: string;
    }>(),
    
    // Metadados
    lastLoginAt: timestamp('last_login_at'),
    emailVerifiedAt: timestamp('email_verified_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    tenantIdIdx: index('users_tenant_id_idx').on(table.tenantId),
    emailIdx: index('users_email_idx').on(table.email),
    statusIdx: index('users_status_idx').on(table.status),
    roleIdx: index('users_role_idx').on(table.role),
    // Índice composto para consultas por tenant e email
    tenantEmailIdx: index('users_tenant_email_idx').on(table.tenantId, table.email),
  })
);

// ===== TABELA DE CONFIGURAÇÕES DE TENANT =====
export const tenantConfigs = pgTable(
  'tenant_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    configKey: varchar('config_key', { length: 100 }).notNull(),
    configValue: text('config_value'),
    configType: varchar('config_type', { length: 50 }).notNull().default('string'), // string, number, boolean, json
    
    // Metadados
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantKeyIdx: index('tenant_configs_tenant_key_idx').on(table.tenantId, table.configKey),
  })
);

// ===== TABELA DE PAGAMENTOS =====
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    
    // Informações do pagamento
    amount: integer('amount').notNull(), // em centavos
    currency: varchar('currency', { length: 3 }).notNull().default('BRL'),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    
    // Informações do gateway
    provider: varchar('provider', { length: 50 }).notNull(), // stripe, pagarme
    providerPaymentId: varchar('provider_payment_id', { length: 255 }),
    providerData: jsonb('provider_data'),
    
    // Dados do pagamento
    description: text('description'),
    metadata: jsonb('metadata'),
    
    // Metadados
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
    paidAt: timestamp('paid_at'),
  },
  (table) => ({
    tenantIdIdx: index('payments_tenant_id_idx').on(table.tenantId),
    statusIdx: index('payments_status_idx').on(table.status),
    providerIdx: index('payments_provider_idx').on(table.provider),
    providerPaymentIdIdx: index('payments_provider_payment_id_idx').on(table.providerPaymentId),
    createdAtIdx: index('payments_created_at_idx').on(table.createdAt),
  })
);

// ===== TABELA DE TRANSAÇÕES =====
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    
    // Informações da transação
    type: varchar('type', { length: 50 }).notNull(), // payment, refund, chargeback
    amount: integer('amount').notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    
    // Dados do gateway
    providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
    providerData: jsonb('provider_data'),
    
    // Metadados
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    paymentIdIdx: index('transactions_payment_id_idx').on(table.paymentId),
    tenantIdIdx: index('transactions_tenant_id_idx').on(table.tenantId),
    typeIdx: index('transactions_type_idx').on(table.type),
    statusIdx: index('transactions_status_idx').on(table.status),
  })
);

// ===== TABELA DE WEBHOOKS =====
export const webhooks = pgTable(
  'webhooks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
    
    // Informações do webhook
    provider: varchar('provider', { length: 50 }).notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    
    // Dados do webhook
    payload: jsonb('payload').notNull(),
    headers: jsonb('headers'),
    signature: varchar('signature', { length: 500 }),
    
    // Metadados
    createdAt: timestamp('created_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
    retryCount: integer('retry_count').default(0),
    lastRetryAt: timestamp('last_retry_at'),
  },
  (table) => ({
    tenantIdIdx: index('webhooks_tenant_id_idx').on(table.tenantId),
    paymentIdIdx: index('webhooks_payment_id_idx').on(table.paymentId),
    statusIdx: index('webhooks_status_idx').on(table.status),
    providerIdx: index('webhooks_provider_idx').on(table.provider),
  })
);

// ===== SCHEMAS ZOD PARA VALIDAÇÃO =====
export const insertTenantSchema = createInsertSchema(tenants);
export const selectTenantSchema = createSelectSchema(tenants);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);

// ===== TIPOS TYPESCRIPT =====
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TenantConfig = typeof tenantConfigs.$inferSelect;
export type NewTenantConfig = typeof tenantConfigs.$inferInsert;

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
