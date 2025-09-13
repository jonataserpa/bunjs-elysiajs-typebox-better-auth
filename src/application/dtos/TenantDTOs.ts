/**
 * DTOs para operações relacionadas a Tenants
 */

export interface CreateTenantDTO {
  name: string;
  slug: string;
  email: string;
  settings?: {
    timezone?: string;
    currency?: string;
    language?: string;
    paymentMethods?: string[];
    webhookUrl?: string;
    apiKeys?: Record<string, string>;
  };
}

export interface UpdateTenantDTO {
  name?: string;
  email?: string;
  settings?: {
    timezone?: string;
    currency?: string;
    language?: string;
    paymentMethods?: string[];
    webhookUrl?: string;
    apiKeys?: Record<string, string>;
  };
}

export interface TenantResponseDTO {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    timezone: string;
    currency: string;
    language: string;
    paymentMethods: string[];
    webhookUrl?: string;
    apiKeys?: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TenantListDTO {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface TenantStatsDTO {
  tenantId: string;
  totalUsers: number;
  activeUsers: number;
  totalPayments: number;
  successfulPayments: number;
  totalRevenue: number;
  averagePaymentValue: number;
}

export interface ActivateTenantDTO {
  tenantId: string;
  activatedBy: string;
}

export interface DeactivateTenantDTO {
  tenantId: string;
  deactivatedBy: string;
  reason?: string;
}

export interface SuspendTenantDTO {
  tenantId: string;
  suspendedBy: string;
  reason: string;
}

export interface DeleteTenantDTO {
  tenantId: string;
  deletedBy: string;
  reason?: string;
}
