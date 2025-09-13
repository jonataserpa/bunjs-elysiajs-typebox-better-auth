// Imports removidos - não utilizados
import type { 
  CreatePaymentDTO, 
  UpdatePaymentDTO, 
  PaymentResponseDTO, 
  PaymentListDTO,
  PaymentStatsDTO,
  PaymentFilterDTO,
  AuthorizePaymentDTO,
  CapturePaymentDTO,
  FailPaymentDTO,
  CancelPaymentDTO,
  RefundPaymentDTO,
  ExtendPaymentExpirationDTO
} from '../dtos/PaymentDTOs';
import { PaymentMapper } from '../mappers/PaymentMapper';
import { PaymentValidator } from '../validators/PaymentValidator';
import type { TenantRepository } from '../interfaces/repositories/TenantRepository';
import type { PaymentRepository } from '../interfaces/repositories/PaymentRepository';
import { ValidationResult } from '../validators/ValidationResult';
import { CreatePaymentUseCase } from '../use-cases/payment/CreatePaymentUseCase';
import { ProcessPaymentUseCase } from '../use-cases/payment/ProcessPaymentUseCase';

/**
 * Application Service para operações de Payment
 */
export class PaymentApplicationService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Cria um novo pagamento
   */
  async createPayment(dto: CreatePaymentDTO, createdBy: string): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const createPaymentUseCase = new CreatePaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return createPaymentUseCase.execute(dto, createdBy);
  }

  /**
   * Cria um pagamento com captura automática
   */
  async createPaymentWithAutoCapture(dto: CreatePaymentDTO, createdBy: string): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const createPaymentUseCase = new CreatePaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return createPaymentUseCase.executeWithAutoCapture(dto, createdBy);
  }

  /**
   * Busca pagamento por ID
   */
  async getPaymentById(paymentId: string): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar ID
      const validation = PaymentValidator.validateId(paymentId);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar pagamento
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('id', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Retornar DTO
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Lista pagamentos com filtros
   */
  async listPayments(filter: PaymentFilterDTO): Promise<{
    success: boolean;
    data?: PaymentListDTO[];
    errors?: ValidationResult;
  }> {
    try {
      // Converter filtros
      const queryParams = PaymentMapper.fromFilterDTO(filter);

      // Buscar pagamentos
      const payments = await this.paymentRepository.findWithFilters(queryParams);

      // Retornar DTOs
      const responseDTOs = PaymentMapper.toListDTOs(payments);
      return { success: true, data: responseDTOs };

    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Atualiza um pagamento
   */
  async updatePayment(paymentId: string, dto: UpdatePaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = PaymentValidator.validateUpdate(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar pagamento
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('id', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Aplicar atualizações
      PaymentMapper.applyUpdateDTO(payment, dto);

      // Salvar alterações
      await this.paymentRepository.save(payment);

      // Retornar DTO atualizado
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Autoriza um pagamento
   */
  async authorizePayment(dto: AuthorizePaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const processPaymentUseCase = new ProcessPaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return processPaymentUseCase.authorizePayment(dto);
  }

  /**
   * Captura um pagamento
   */
  async capturePayment(dto: CapturePaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const processPaymentUseCase = new ProcessPaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return processPaymentUseCase.capturePayment(dto);
  }

  /**
   * Falha um pagamento
   */
  async failPayment(dto: FailPaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const processPaymentUseCase = new ProcessPaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return processPaymentUseCase.failPayment(dto);
  }

  /**
   * Cancela um pagamento
   */
  async cancelPayment(dto: CancelPaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const processPaymentUseCase = new ProcessPaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return processPaymentUseCase.cancelPayment(dto);
  }

  /**
   * Reembolsa um pagamento
   */
  async refundPayment(dto: RefundPaymentDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    const processPaymentUseCase = new ProcessPaymentUseCase(
      this.tenantRepository,
      this.paymentRepository
    );

    return processPaymentUseCase.refundPayment(dto);
  }

  /**
   * Estende a expiração de um pagamento
   */
  async extendPaymentExpiration(dto: ExtendPaymentExpirationDTO): Promise<{
    success: boolean;
    data?: PaymentResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = PaymentValidator.validateExtendExpiration(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar pagamento
      const payment = await this.paymentRepository.findById(dto.paymentId);
      if (!payment) {
        const validationResult = new ValidationResult();
        validationResult.addError('paymentId', 'Pagamento não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Estender expiração
      const newExpiresAt = new Date(dto.newExpiresAt);
      payment.extendExpiration(newExpiresAt);

      // Salvar alterações
      await this.paymentRepository.save(payment);

      // Retornar DTO atualizado
      const responseDTO = PaymentMapper.toResponseDTO(payment);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao estender expiração do pagamento:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  async getPaymentStats(tenantId?: string): Promise<{
    success: boolean;
    data?: PaymentStatsDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Buscar pagamentos
      const payments = tenantId 
        ? await this.paymentRepository.findByTenantId(tenantId)
        : await this.paymentRepository.findAll();

      // Calcular estatísticas
      const totalPayments = payments.length;
      const successfulPayments = payments.filter(p => p.isCaptured).length;
      const failedPayments = payments.filter(p => p.isFailed).length;
      const pendingPayments = payments.filter(p => p.isPending).length;
      
      const totalRevenue = payments
        .filter(p => p.isCaptured)
        .reduce((sum, p) => sum + p.amount.toReais(), 0);

      const averagePaymentValue = totalPayments > 0 ? totalRevenue / totalPayments : 0;
      const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

      // Retornar DTO de estatísticas
      const statsDTO = PaymentMapper.toStatsDTO({
        totalPayments,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalRevenue,
        averagePaymentValue,
        successRate
      });

      return { success: true, data: statsDTO };

    } catch (error) {
      console.error('Erro ao obter estatísticas de pagamentos:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Busca pagamentos por tenant
   */
  async getPaymentsByTenant(tenantId: string, limit: number = 50, offset: number = 0): Promise<{
    success: boolean;
    data?: PaymentListDTO[];
    errors?: ValidationResult;
  }> {
    try {
      // Validar tenant ID
      if (!tenantId || typeof tenantId !== 'string') {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant ID é obrigatório', 'REQUIRED_FIELD');
        return { success: false, errors: validationResult };
      }

      // Buscar pagamentos
      const payments = await this.paymentRepository.findByTenantId(tenantId, limit, offset);

      // Retornar DTOs
      const responseDTOs = PaymentMapper.toListDTOs(payments);
      return { success: true, data: responseDTOs };

    } catch (error) {
      console.error('Erro ao buscar pagamentos por tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Busca pagamentos por usuário
   */
  async getPaymentsByUser(userId: string, limit: number = 50, offset: number = 0): Promise<{
    success: boolean;
    data?: PaymentListDTO[];
    errors?: ValidationResult;
  }> {
    try {
      // Validar user ID
      if (!userId || typeof userId !== 'string') {
        const validationResult = new ValidationResult();
        validationResult.addError('userId', 'User ID é obrigatório', 'REQUIRED_FIELD');
        return { success: false, errors: validationResult };
      }

      // Buscar pagamentos
      const payments = await this.paymentRepository.findByUserId(userId, limit, offset);

      // Retornar DTOs
      const responseDTOs = PaymentMapper.toListDTOs(payments);
      return { success: true, data: responseDTOs };

    } catch (error) {
      console.error('Erro ao buscar pagamentos por usuário:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }
}
