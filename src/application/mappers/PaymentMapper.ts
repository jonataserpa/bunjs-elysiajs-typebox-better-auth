import { Payment } from '../../domain/entities/Payment';
import { PaymentStatus } from '../../domain/enums/PaymentStatus';
import { PaymentProvider } from '../../domain/enums/PaymentProvider';
import type { 
  CreatePaymentDTO, 
  UpdatePaymentDTO, 
  PaymentResponseDTO, 
  PaymentListDTO,
  PaymentStatsDTO 
} from '../dtos/PaymentDTOs';

/**
 * Mapper para conversão entre entidades de domínio e DTOs de aplicação
 */
export class PaymentMapper {
  /**
   * Converte DTO de criação para entidade de domínio
   */
  static fromCreateDTO(dto: CreatePaymentDTO, id: string, providerPaymentId: string): Payment {
    return Payment.create(
      id,
      dto.tenantId,
      dto.userId || null,
      dto.amount,
      dto.currency,
      dto.provider as PaymentProvider,
      providerPaymentId,
      dto.description,
      dto.metadata,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined
    );
  }

  /**
   * Converte entidade de domínio para DTO de resposta
   */
  static toResponseDTO(payment: Payment): PaymentResponseDTO {
    return {
      id: payment.id.getValue(),
      tenantId: payment.tenantId.getValue(),
      userId: payment.userId?.getValue(),
      amount: payment.amount.toReais(),
      currency: payment.currency.getValue(),
      status: payment.status,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      providerData: payment.providerData,
      description: payment.description.getValue(),
      metadata: payment.metadata,
      paidAt: payment.paidAt?.toISOString(),
      expiresAt: payment.expiresAt?.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      deletedAt: payment.deletedAt?.toISOString()
    };
  }

  /**
   * Converte entidade de domínio para DTO de lista
   */
  static toListDTO(payment: Payment): PaymentListDTO {
    return {
      id: payment.id.getValue(),
      tenantId: payment.tenantId.getValue(),
      userId: payment.userId?.getValue(),
      amount: payment.amount.toReais(),
      currency: payment.currency.getValue(),
      status: payment.status,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      description: payment.description.getValue(),
      paidAt: payment.paidAt?.toISOString(),
      expiresAt: payment.expiresAt?.toISOString(),
      createdAt: payment.createdAt.toISOString()
    };
  }

  /**
   * Aplica atualizações de DTO na entidade
   */
  static applyUpdateDTO(payment: Payment, dto: UpdatePaymentDTO): void {
    if (dto.description) {
      // Note: Description não pode ser alterada diretamente na entidade
      // Esta seria uma operação de negócio específica
    }

    if (dto.metadata) {
      payment.updateMetadata(dto.metadata);
    }

    if (dto.expiresAt) {
      const newExpiresAt = new Date(dto.expiresAt);
      payment.extendExpiration(newExpiresAt);
    }
  }

  /**
   * Converte dados de persistência para entidade de domínio
   */
  static fromPersistence(data: any): Payment {
    return Payment.fromPersistence(
      data.id,
      data.tenantId,
      data.userId,
      data.amount,
      data.currency,
      data.status,
      data.provider,
      data.providerPaymentId,
      data.providerData,
      data.description,
      data.metadata,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.paidAt ? new Date(data.paidAt) : undefined,
      data.expiresAt ? new Date(data.expiresAt) : undefined,
      data.deletedAt ? new Date(data.deletedAt) : undefined
    );
  }

  /**
   * Converte entidade de domínio para dados de persistência
   */
  static toPersistence(payment: Payment): any {
    return payment.toPersistence();
  }

  /**
   * Converte array de entidades para array de DTOs de lista
   */
  static toListDTOs(payments: Payment[]): PaymentListDTO[] {
    return payments.map(payment => this.toListDTO(payment));
  }

  /**
   * Converte array de entidades para array de DTOs de resposta
   */
  static toResponseDTOs(payments: Payment[]): PaymentResponseDTO[] {
    return payments.map(payment => this.toResponseDTO(payment));
  }

  /**
   * Converte estatísticas para DTO
   */
  static toStatsDTO(stats: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalRevenue: number;
    averagePaymentValue: number;
    successRate: number;
  }): PaymentStatsDTO {
    return {
      totalPayments: stats.totalPayments,
      successfulPayments: stats.successfulPayments,
      failedPayments: stats.failedPayments,
      pendingPayments: stats.pendingPayments,
      totalRevenue: stats.totalRevenue,
      averagePaymentValue: stats.averagePaymentValue,
      successRate: stats.successRate
    };
  }

  /**
   * Filtra dados sensíveis do pagamento para resposta pública
   */
  static toPublicDTO(payment: Payment): Partial<PaymentResponseDTO> {
    return {
      id: payment.id.getValue(),
      amount: payment.amount.toReais(),
      currency: payment.currency.getValue(),
      status: payment.status,
      provider: payment.provider,
      description: payment.description.getValue(),
      paidAt: payment.paidAt?.toISOString(),
      expiresAt: payment.expiresAt?.toISOString(),
      createdAt: payment.createdAt.toISOString()
    };
  }

  /**
   * Converte filtros de DTO para parâmetros de consulta
   */
  static fromFilterDTO(filter: any): {
    tenantId?: string;
    userId?: string;
    status?: PaymentStatus;
    provider?: PaymentProvider;
    currency?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } {
    return {
      tenantId: filter.tenantId,
      userId: filter.userId,
      status: filter.status as PaymentStatus,
      provider: filter.provider as PaymentProvider,
      currency: filter.currency,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
      minAmount: filter.minAmount,
      maxAmount: filter.maxAmount,
      limit: filter.limit,
      offset: filter.offset,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder
    };
  }
}
