import { Tenant, TenantSettings } from '../../domain/entities/Tenant';
import type { 
  CreateTenantDTO, 
  UpdateTenantDTO, 
  TenantResponseDTO, 
  TenantListDTO,
  TenantStatsDTO 
} from '../dtos/TenantDTOs';

/**
 * Mapper para conversão entre entidades de domínio e DTOs de aplicação
 */
export class TenantMapper {
  /**
   * Converte DTO de criação para entidade de domínio
   */
  static fromCreateDTO(dto: CreateTenantDTO, id: string): Tenant {
    const settings = TenantSettings.create(
      dto.settings?.timezone || 'America/Sao_Paulo',
      dto.settings?.currency || 'BRL',
      dto.settings?.language || 'pt-BR',
      dto.settings?.paymentMethods || ['stripe', 'pagarme'],
      dto.settings?.webhookUrl,
      dto.settings?.apiKeys
    );

    return Tenant.create(
      id,
      dto.name,
      dto.slug,
      dto.email,
      settings
    );
  }

  /**
   * Converte entidade de domínio para DTO de resposta
   */
  static toResponseDTO(tenant: Tenant): TenantResponseDTO {
    return {
      id: tenant.id.getValue(),
      name: tenant.name,
      slug: tenant.slug.getValue(),
      email: tenant.email.getValue(),
      status: tenant.status,
      settings: {
        timezone: tenant.settings.timezone,
        currency: tenant.settings.currency,
        language: tenant.settings.language,
        paymentMethods: tenant.settings.paymentMethods,
        webhookUrl: tenant.settings.webhookUrl,
        apiKeys: tenant.settings.apiKeys
      },
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
      deletedAt: tenant.deletedAt?.toISOString()
    };
  }

  /**
   * Converte entidade de domínio para DTO de lista
   */
  static toListDTO(tenant: Tenant): TenantListDTO {
    return {
      id: tenant.id.getValue(),
      name: tenant.name,
      slug: tenant.slug.getValue(),
      email: tenant.email.getValue(),
      status: tenant.status,
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString()
    };
  }

  /**
   * Aplica atualizações de DTO na entidade
   */
  static applyUpdateDTO(tenant: Tenant, dto: UpdateTenantDTO): void {
    if (dto.name || dto.email) {
      tenant.updateBasicInfo(
        dto.name || tenant.name,
        dto.email || tenant.email.getValue()
      );
    }

    if (dto.settings) {
      const newSettings = TenantSettings.create(
        dto.settings.timezone || tenant.settings.timezone,
        dto.settings.currency || tenant.settings.currency,
        dto.settings.language || tenant.settings.language,
        dto.settings.paymentMethods || tenant.settings.paymentMethods,
        dto.settings.webhookUrl !== undefined ? dto.settings.webhookUrl : tenant.settings.webhookUrl,
        dto.settings.apiKeys !== undefined ? dto.settings.apiKeys : tenant.settings.apiKeys
      );
      tenant.updateSettings(newSettings);
    }
  }

  /**
   * Converte dados de persistência para entidade de domínio
   */
  static fromPersistence(data: any): Tenant {
    return Tenant.fromPersistence(
      data.id,
      data.name,
      data.slug,
      data.email,
      data.status,
      data.settings,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.deletedAt ? new Date(data.deletedAt) : undefined
    );
  }

  /**
   * Converte entidade de domínio para dados de persistência
   */
  static toPersistence(tenant: Tenant): any {
    return tenant.toPersistence();
  }

  /**
   * Converte estatísticas para DTO
   */
  static toStatsDTO(
    tenantId: string,
    stats: {
      totalUsers: number;
      activeUsers: number;
      totalPayments: number;
      successfulPayments: number;
      totalRevenue: number;
      averagePaymentValue: number;
    }
  ): TenantStatsDTO {
    return {
      tenantId,
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      totalPayments: stats.totalPayments,
      successfulPayments: stats.successfulPayments,
      totalRevenue: stats.totalRevenue,
      averagePaymentValue: stats.averagePaymentValue
    };
  }

  /**
   * Converte array de entidades para array de DTOs de lista
   */
  static toListDTOs(tenants: Tenant[]): TenantListDTO[] {
    return tenants.map(tenant => this.toListDTO(tenant));
  }

  /**
   * Converte array de entidades para array de DTOs de resposta
   */
  static toResponseDTOs(tenants: Tenant[]): TenantResponseDTO[] {
    return tenants.map(tenant => this.toResponseDTO(tenant));
  }
}
