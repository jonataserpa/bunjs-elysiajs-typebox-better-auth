// Imports removidos - não utilizados
import { TenantDomainService } from '../../domain/services/TenantDomainService';
import type { 
  CreateTenantDTO, 
  UpdateTenantDTO, 
  TenantResponseDTO, 
  TenantListDTO,
  TenantStatsDTO,
  ActivateTenantDTO,
  DeactivateTenantDTO,
  SuspendTenantDTO,
  DeleteTenantDTO
} from '../dtos/TenantDTOs';
import { TenantMapper } from '../mappers/TenantMapper';
import { TenantValidator } from '../validators/TenantValidator';
import type { TenantRepository } from '../interfaces/repositories/TenantRepository';
import type { UserRepository } from '../interfaces/repositories/UserRepository';
import type { PaymentRepository } from '../interfaces/repositories/PaymentRepository';
import { ValidationResult } from '../validators/ValidationResult';
import { CreateTenantUseCase } from '../use-cases/tenant/CreateTenantUseCase';

/**
 * Application Service para operações de Tenant
 */
export class TenantApplicationService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Cria um novo tenant
   */
  async createTenant(dto: CreateTenantDTO, createdBy: string): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    const createTenantUseCase = new CreateTenantUseCase(
      this.tenantRepository
    );

    return createTenantUseCase.execute(dto, createdBy);
  }

  /**
   * Busca tenant por ID
   */
  async getTenantById(tenantId: string): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar ID
      const validation = TenantValidator.validateId(tenantId);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('id', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Retornar DTO
      const responseDTO = TenantMapper.toResponseDTO(tenant);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Lista todos os tenants
   */
  async listTenants(): Promise<{
    success: boolean;
    data?: TenantListDTO[];
    errors?: ValidationResult;
  }> {
    try {
      const tenants = await this.tenantRepository.findAll();
      const responseDTOs = TenantMapper.toListDTOs(tenants);
      
      return { success: true, data: responseDTOs };

    } catch (error) {
      console.error('Erro ao listar tenants:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Atualiza um tenant
   */
  async updateTenant(tenantId: string, dto: UpdateTenantDTO): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = TenantValidator.validateUpdate(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('id', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Aplicar atualizações
      TenantMapper.applyUpdateDTO(tenant, dto);

      // Salvar alterações
      await this.tenantRepository.save(tenant);

      // Retornar DTO atualizado
      const responseDTO = TenantMapper.toResponseDTO(tenant);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Ativa um tenant
   */
  async activateTenant(dto: ActivateTenantDTO): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = TenantValidator.validateStatusChange(dto.tenantId, dto.activatedBy);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(dto.tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Buscar usuários do tenant
      const users = await this.userRepository.findByTenantId(dto.tenantId);

      // Validar se pode ser ativado
      const canActivate = TenantDomainService.canActivateTenant(tenant, users);
      if (!canActivate.canActivate) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', canActivate.reason || 'Não é possível ativar o tenant', 'BUSINESS_RULE_VIOLATION');
        return { success: false, errors: validationResult };
      }

      // Ativar tenant
      tenant.activate();

      // Salvar alterações
      await this.tenantRepository.save(tenant);

      // Retornar DTO atualizado
      const responseDTO = TenantMapper.toResponseDTO(tenant);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao ativar tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Desativa um tenant
   */
  async deactivateTenant(dto: DeactivateTenantDTO): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = TenantValidator.validateStatusChange(dto.tenantId, dto.deactivatedBy);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(dto.tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Contar pagamentos ativos
      const activePayments = await this.paymentRepository.countActiveByTenant(dto.tenantId);

      // Validar se pode ser desativado
      const canDeactivate = TenantDomainService.canDeactivateTenant(tenant, activePayments);
      if (!canDeactivate.canDeactivate) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', canDeactivate.reason || 'Não é possível desativar o tenant', 'BUSINESS_RULE_VIOLATION');
        return { success: false, errors: validationResult };
      }

      // Desativar tenant
      tenant.deactivate();

      // Salvar alterações
      await this.tenantRepository.save(tenant);

      // Retornar DTO atualizado
      const responseDTO = TenantMapper.toResponseDTO(tenant);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao desativar tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Suspende um tenant
   */
  async suspendTenant(dto: SuspendTenantDTO): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = TenantValidator.validateStatusChange(dto.tenantId, dto.suspendedBy);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(dto.tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Suspender tenant
      tenant.suspend();

      // Salvar alterações
      await this.tenantRepository.save(tenant);

      // Retornar DTO atualizado
      const responseDTO = TenantMapper.toResponseDTO(tenant);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao suspender tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Deleta um tenant
   */
  async deleteTenant(dto: DeleteTenantDTO): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar dados
      const validation = TenantValidator.validateStatusChange(dto.tenantId, dto.deletedBy);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(dto.tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('tenantId', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Buscar usuários e pagamentos do tenant
      const users = await this.userRepository.findByTenantId(dto.tenantId);
      const activePayments = await this.paymentRepository.countActiveByTenant(dto.tenantId);

      // Validar se pode ser deletado
      const canDelete = TenantDomainService.canDeleteTenant(tenant, users, activePayments);
      if (!canDelete.canDelete) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', canDelete.reason || 'Não é possível deletar o tenant', 'BUSINESS_RULE_VIOLATION');
        return { success: false, errors: validationResult };
      }

      // Deletar tenant (soft delete)
      tenant.softDelete();

      // Salvar alterações
      await this.tenantRepository.save(tenant);

      // Retornar DTO atualizado
      const responseDTO = TenantMapper.toResponseDTO(tenant);
      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao deletar tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Obtém estatísticas de um tenant
   */
  async getTenantStats(tenantId: string): Promise<{
    success: boolean;
    data?: TenantStatsDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Validar ID
      const validation = TenantValidator.validateId(tenantId);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // Buscar tenant
      const tenant = await this.tenantRepository.findById(tenantId);
      if (!tenant) {
        const validationResult = new ValidationResult();
        validationResult.addError('id', 'Tenant não encontrado', 'NOT_FOUND');
        return { success: false, errors: validationResult };
      }

      // Buscar dados relacionados
      const users = await this.userRepository.findByTenantId(tenantId);
      const payments = await this.paymentRepository.findByTenantId(tenantId);
      const transactions = await this.paymentRepository.findTransactionsByTenantId(tenantId);

      // Calcular estatísticas
      const stats = TenantDomainService.calculateTenantStats(tenant, users, payments, transactions);

      // Retornar DTO de estatísticas
      const statsDTO = TenantMapper.toStatsDTO(tenantId, stats);
      return { success: true, data: statsDTO };

    } catch (error) {
      console.error('Erro ao obter estatísticas do tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }
}
