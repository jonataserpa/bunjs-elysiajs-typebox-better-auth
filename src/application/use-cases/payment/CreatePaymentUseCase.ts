import { PaymentProvider } from '../../../domain/enums/PaymentProvider';
import { PaymentDomainService } from '../../../domain/services/PaymentDomainService';
import type { CreatePaymentDTO, PaymentResponseDTO } from '../../dtos/PaymentDTOs';
import { PaymentMapper } from '../../mappers/PaymentMapper';
import { PaymentValidator } from '../../validators/PaymentValidator';
import type { TenantRepository } from '../../interfaces/repositories/TenantRepository';
import type { PaymentRepository } from '../../interfaces/repositories/PaymentRepository';
import { ValidationResult } from '../../validators/ValidationResult';
import { v4 as uuidv4 } from 'uuid';

/**
 * Use Case para criação de pagamento
 */
export class CreatePaymentUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Executa a criação de um novo pagamento
   */
  async execute(dto: CreatePaymentDTO, _createdBy: string): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = PaymentValidator.validateCreate(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Buscar tenant e validar se existe e está ativo
      const tenant = await this.tenantRepository.findById(dto.tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      if (!tenant.isActive) {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant não está ativo', 'INACTIVE_TENANT');
        return { success: false, errors: validationResult };
      }

      // 3. Gerar IDs únicos
      const paymentId = uuidv4();
      const providerPaymentId = this.generateProviderPaymentId(dto.provider as PaymentProvider);

      // 4. Criar entidade de domínio
      const payment = PaymentMapper.fromCreateDTO(dto, paymentId, providerPaymentId);

      // 5. Validar se o pagamento pode ser processado
      const canProcess = PaymentDomainService.canProcessPayment(payment, tenant.settings);
      if (!canProcess.canProcess) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', canProcess.reason || 'Não é possível processar o pagamento', 'BUSINESS_RULE_VIOLATION');
        return { success: false, errors: validationResult };
      }

      // 6. Calcular data de expiração se não fornecida
      if (!dto.expiresAt) {
        const expirationDate = PaymentDomainService.calculateExpirationDate(
          dto.provider as PaymentProvider,
          tenant.settings
        );
        payment.extendExpiration(expirationDate);
      }

      // 7. Salvar no repositório
      await this.paymentRepository.save(payment);

      // 8. Retornar DTO de resposta
      const responseDTO = PaymentMapper.toResponseDTO(payment);

      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Executa a criação de pagamento com captura automática
   */
  async executeWithAutoCapture(dto: CreatePaymentDTO, _createdBy: string): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const result = await this.execute(dto, _createdBy);
    
    if (!result.success || !result.data) {
      return result;
    }

    try {
      // Buscar o pagamento criado
      const payment = await this.paymentRepository.findById(result.data.id);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', 'Pagamento não encontrado após criação', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Buscar tenant para verificar configurações
      const tenant = await this.tenantRepository.findById(dto.tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Verificar se deve capturar automaticamente
      if (PaymentDomainService.shouldAutoCapture(payment, tenant.settings)) {
        // Autorizar primeiro
        payment.authorize();
        
        // Capturar automaticamente
        payment.capture();
        
        // Salvar alterações
        await this.paymentRepository.save(payment);
        
        // Retornar dados atualizados
        const updatedResponseDTO = PaymentMapper.toResponseDTO(payment);
        return { success: true, data: updatedResponseDTO };
      }

      return result;

    } catch (error) {
      console.error('Erro na captura automática:', error);
      // Retornar resultado original se a captura automática falhar
      return result;
    }
  }

  /**
   * Gera ID de pagamento específico do provider
   */
  private generateProviderPaymentId(provider: PaymentProvider): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    switch (provider) {
      case PaymentProvider.STRIPE:
        return `pi_stripe_${timestamp}_${random}`;
      case PaymentProvider.PAGARME:
        return `pi_pagarme_${timestamp}_${random}`;
      case PaymentProvider.MERCADOPAGO:
        return `pi_mercadopago_${timestamp}_${random}`;
      default:
        return `pi_${provider}_${timestamp}_${random}`;
    }
  }
}
