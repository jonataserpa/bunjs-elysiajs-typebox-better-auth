/**
 * DTOs para operações relacionadas a Users
 */

export interface CreateUserDTO {
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'finance' | 'customer' | 'support' | 'viewer';
  preferences?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    customSettings?: Record<string, any>;
  };
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'finance' | 'customer' | 'support' | 'viewer';
  preferences?: {
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    customSettings?: Record<string, any>;
  };
}

export interface UserResponseDTO {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'finance' | 'customer' | 'support' | 'viewer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone?: string;
    customSettings?: Record<string, any>;
  };
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UserListDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'finance' | 'customer' | 'support' | 'viewer';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  tenantId: string;
}

export interface LoginResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
  changedBy: string;
}

export interface UpdatePasswordDTO {
  userId: string;
  newPassword: string;
  updatedBy: string;
}

export interface ActivateUserDTO {
  userId: string;
  activatedBy: string;
}

export interface DeactivateUserDTO {
  userId: string;
  deactivatedBy: string;
  reason?: string;
}

export interface SuspendUserDTO {
  userId: string;
  suspendedBy: string;
  reason: string;
  suspendedUntil?: string;
}

export interface DeleteUserDTO {
  userId: string;
  deletedBy: string;
  reason?: string;
}

export interface VerifyEmailDTO {
  userId: string;
  verificationToken: string;
}

export interface ResendVerificationDTO {
  userId: string;
  requestedBy: string;
}
