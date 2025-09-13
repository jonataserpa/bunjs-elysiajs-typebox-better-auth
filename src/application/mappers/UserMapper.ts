import { User, UserRole, UserPreferences } from '../../domain/entities/User';
import type { 
  CreateUserDTO, 
  UpdateUserDTO, 
  UserResponseDTO, 
  UserListDTO 
} from '../dtos/UserDTOs';

/**
 * Mapper para conversão entre entidades de domínio e DTOs de aplicação
 */
export class UserMapper {
  /**
   * Converte DTO de criação para entidade de domínio
   */
  static fromCreateDTO(dto: CreateUserDTO, id: string, passwordHash: string): User {
    return User.create(
      id,
      dto.tenantId,
      dto.email,
      passwordHash,
      dto.firstName,
      dto.lastName,
      dto.role as UserRole,
      dto.preferences ? UserPreferences.create(
        dto.preferences.notifications ?? true,
        dto.preferences.theme ?? 'light',
        dto.preferences.language ?? 'pt-BR',
        dto.preferences.timezone,
        dto.preferences.customSettings
      ) : undefined
    );
  }

  /**
   * Converte entidade de domínio para DTO de resposta
   */
  static toResponseDTO(user: User): UserResponseDTO {
    return {
      id: user.id.getValue(),
      tenantId: user.tenantId.getValue(),
      email: user.email.getValue(),
      firstName: user.firstName.getValue(),
      lastName: user.lastName.getValue(),
      role: user.role,
      status: user.status,
      preferences: {
        notifications: user.preferences.notifications,
        theme: user.preferences.theme,
        language: user.preferences.language,
        timezone: user.preferences.timezone,
        customSettings: user.preferences.customSettings
      },
      emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString()
    };
  }

  /**
   * Converte entidade de domínio para DTO de lista
   */
  static toListDTO(user: User): UserListDTO {
    return {
      id: user.id.getValue(),
      email: user.email.getValue(),
      firstName: user.firstName.getValue(),
      lastName: user.lastName.getValue(),
      role: user.role,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString()
    };
  }

  /**
   * Aplica atualizações de DTO na entidade
   */
  static applyUpdateDTO(user: User, dto: UpdateUserDTO): void {
    if (dto.firstName || dto.lastName) {
      user.updatePersonalInfo(
        dto.firstName || user.firstName.getValue(),
        dto.lastName || user.lastName.getValue()
      );
    }

    if (dto.email && dto.email !== user.email.getValue()) {
      user.updateEmail(dto.email);
    }

    if (dto.role && dto.role !== user.role) {
      user.changeRole(dto.role as UserRole);
    }

    if (dto.preferences) {
      const newPreferences = UserPreferences.create(
        dto.preferences.notifications !== undefined ? dto.preferences.notifications : user.preferences.notifications,
        dto.preferences.theme || user.preferences.theme,
        dto.preferences.language || user.preferences.language,
        dto.preferences.timezone !== undefined ? dto.preferences.timezone : user.preferences.timezone,
        dto.preferences.customSettings !== undefined ? dto.preferences.customSettings : user.preferences.customSettings
      );
      user.updatePreferences(newPreferences);
    }
  }

  /**
   * Converte dados de persistência para entidade de domínio
   */
  static fromPersistence(data: any): User {
    return User.fromPersistence(
      data.id,
      data.tenantId,
      data.email,
      data.passwordHash,
      data.firstName,
      data.lastName,
      data.role,
      data.status,
      data.preferences,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.emailVerifiedAt ? new Date(data.emailVerifiedAt) : undefined,
      data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
      data.deletedAt ? new Date(data.deletedAt) : undefined
    );
  }

  /**
   * Converte entidade de domínio para dados de persistência
   */
  static toPersistence(user: User): any {
    return user.toPersistence();
  }

  /**
   * Converte array de entidades para array de DTOs de lista
   */
  static toListDTOs(users: User[]): UserListDTO[] {
    return users.map(user => this.toListDTO(user));
  }

  /**
   * Converte array de entidades para array de DTOs de resposta
   */
  static toResponseDTOs(users: User[]): UserResponseDTO[] {
    return users.map(user => this.toResponseDTO(user));
  }

  /**
   * Filtra dados sensíveis do usuário para resposta pública
   */
  static toPublicDTO(user: User): Partial<UserResponseDTO> {
    return {
      id: user.id.getValue(),
      email: user.email.getValue(),
      firstName: user.firstName.getValue(),
      lastName: user.lastName.getValue(),
      role: user.role,
      status: user.status,
      preferences: {
        notifications: user.preferences.notifications,
        theme: user.preferences.theme,
        language: user.preferences.language,
        timezone: user.preferences.timezone
      },
      emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }
}
