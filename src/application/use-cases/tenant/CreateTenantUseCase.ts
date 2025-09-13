// TenantSettings import removido - não utilizado
import { TenantDomainService } from '../../../domain/services/TenantDomainService';
import type { CreateTenantDTO, TenantResponseDTO } from '../../dtos/TenantDTOs';
import { TenantMapper } from '../../mappers/TenantMapper';
import { TenantValidator } from '../../validators/TenantValidator';
import type { TenantRepository } from '../../../application/interfaces/repositories/TenantRepository';
// UserRepository import removido - não utilizado
import { ValidationResult } from '../../validators/ValidationResult';
import { v4 as uuidv4 } from 'uuid';

/**
 * Use Case para criação de tenant
 */
export class CreateTenantUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    // userRepository removido - não utilizado
  ) {}

  /**
   * Executa a criação de um novo tenant
   */
  async execute(dto: CreateTenantDTO, _createdBy: string): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // 1. Validar dados de entrada
      const validation = TenantValidator.validateCreate(dto);
      if (!validation.isValid) {
        return { success: false, errors: validation };
      }

      // 2. Verificar se já existe tenant com mesmo slug ou email
      const existingTenants = await this.tenantRepository.findAll();
      const canCreate = TenantDomainService.canCreateTenant(
        dto.name,
        dto.slug,
        dto.email,
        existingTenants
      );

      if (!canCreate.canCreate) {
        const validationResult = new ValidationResult();
        validationResult.addError('general', canCreate.reason || 'Não é possível criar o tenant', 'BUSINESS_RULE_VIOLATION');
        return { success: false, errors: validationResult };
      }

      // 3. Gerar ID único
      const tenantId = uuidv4();

      // 4. Criar entidade de domínio
      const tenant = TenantMapper.fromCreateDTO(dto, tenantId);

      // 5. Salvar no repositório
      await this.tenantRepository.save(tenant);

      // 6. Retornar DTO de resposta
      const responseDTO = TenantMapper.toResponseDTO(tenant);

      return { success: true, data: responseDTO };

    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro interno do servidor', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }

  /**
   * Executa a criação de tenant com configurações padrão
   */
  async executeWithDefaults(dto: Omit<CreateTenantDTO, 'settings'>, createdBy: string): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    const dtoWithDefaults: CreateTenantDTO = {
      ...dto,
      settings: TenantDomainService.createDefaultTenantSettings().toPersistence()
    };

    return this.execute(dtoWithDefaults, createdBy);
  }

  /**
   * Executa a criação de tenant com slug automático
   */
  async executeWithAutoSlug(dto: Omit<CreateTenantDTO, 'slug'>, createdBy: string): Promise<{
    success: boolean;
    data?: TenantResponseDTO;
    errors?: ValidationResult;
  }> {
    try {
      // Gerar slug único baseado no nome
      const existingTenants = await this.tenantRepository.findAll();
      const autoSlug = TenantDomainService.generateUniqueSlug(dto.name, existingTenants);

      const dtoWithSlug: CreateTenantDTO = {
        ...dto,
        slug: autoSlug
      };

      return this.execute(dtoWithSlug, createdBy);

    } catch (error) {
      console.error('Erro ao gerar slug automático:', error);
      const validationResult = new ValidationResult();
      validationResult.addError('general', 'Erro ao gerar slug automático', 'INTERNAL_ERROR');
      return { success: false, errors: validationResult };
    }
  }
}
