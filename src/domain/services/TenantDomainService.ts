import { Tenant, TenantSettings } from '../entities/Tenant';
import { User, UserRole } from '../entities/User';

/**
 * Domain Service para regras de negócio relacionadas a tenants
 * Contém lógica que não pertence a uma única entidade
 */
export class TenantDomainService {
  /**
   * Valida se um tenant pode ser criado
   */
  static canCreateTenant(
    name: string,
    slug: string,
    email: string,
    existingTenants: Tenant[]
  ): { canCreate: boolean; reason?: string } {
    // Verificar se o nome não está vazio
    if (!name || name.trim().length < 3) {
      return { canCreate: false, reason: 'Nome deve ter pelo menos 3 caracteres' };
    }

    // Verificar se o slug não está vazio
    if (!slug || slug.trim().length < 3) {
      return { canCreate: false, reason: 'Slug deve ter pelo menos 3 caracteres' };
    }

    // Verificar se o email é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { canCreate: false, reason: 'Email deve ter um formato válido' };
    }

    // Verificar se o slug já existe
    const existingTenant = existingTenants.find(t => 
      t.slug.getValue().toLowerCase() === slug.toLowerCase() && !t.deletedAt
    );
    if (existingTenant) {
      return { canCreate: false, reason: 'Slug já está em uso' };
    }

    // Verificar se o email já existe
    const existingEmail = existingTenants.find(t => 
      t.email.getValue().toLowerCase() === email.toLowerCase() && !t.deletedAt
    );
    if (existingEmail) {
      return { canCreate: false, reason: 'Email já está em uso' };
    }

    return { canCreate: true };
  }

  /**
   * Valida se um tenant pode ser ativado
   */
  static canActivateTenant(
    tenant: Tenant,
    users: User[]
  ): { canActivate: boolean; reason?: string } {
    if (tenant.isActive) {
      return { canActivate: false, reason: 'Tenant já está ativo' };
    }

    if (tenant.deletedAt) {
      return { canActivate: false, reason: 'Não é possível ativar um tenant deletado' };
    }

    // Verificar se há pelo menos um usuário admin ativo
    const activeAdmins = users.filter(u => 
      u.tenantId.getValue() === tenant.id.getValue() &&
      u.role === UserRole.ADMIN &&
      u.isActive
    );

    if (activeAdmins.length === 0) {
      return { 
        canActivate: false, 
        reason: 'Tenant deve ter pelo menos um usuário admin ativo para ser ativado' 
      };
    }

    return { canActivate: true };
  }

  /**
   * Valida se um tenant pode ser desativado
   */
  static canDeactivateTenant(
    tenant: Tenant,
    activePayments: number
  ): { canDeactivate: boolean; reason?: string } {
    if (!tenant.isActive) {
      return { canDeactivate: false, reason: 'Tenant já está inativo' };
    }

    if (tenant.deletedAt) {
      return { canDeactivate: false, reason: 'Tenant já foi deletado' };
    }

    // Verificar se há pagamentos ativos
    if (activePayments > 0) {
      return { 
        canDeactivate: false, 
        reason: `Não é possível desativar tenant com ${activePayments} pagamentos ativos` 
      };
    }

    return { canDeactivate: true };
  }

  /**
   * Valida se um tenant pode ser deletado
   */
  static canDeleteTenant(
    tenant: Tenant,
    users: User[],
    activePayments: number
  ): { canDelete: boolean; reason?: string } {
    if (tenant.deletedAt) {
      return { canDelete: false, reason: 'Tenant já foi deletado' };
    }

    // Verificar se há usuários ativos
    const activeUsers = users.filter(u => 
      u.tenantId.getValue() === tenant.id.getValue() && u.isActive
    );

    if (activeUsers.length > 0) {
      return { 
        canDelete: false, 
        reason: `Não é possível deletar tenant com ${activeUsers.length} usuários ativos` 
      };
    }

    // Verificar se há pagamentos ativos
    if (activePayments > 0) {
      return { 
        canDelete: false, 
        reason: `Não é possível deletar tenant com ${activePayments} pagamentos ativos` 
      };
    }

    return { canDelete: true };
  }

  /**
   * Cria configurações padrão para um novo tenant
   */
  static createDefaultTenantSettings(): TenantSettings {
    return TenantSettings.create(
      'America/Sao_Paulo', // timezone
      'BRL', // currency
      'pt-BR', // language
      ['stripe', 'pagarme'], // paymentMethods
      undefined, // webhookUrl
      {
        maxPaymentAmount: '100000', // R$ 1000,00
        autoCaptureEnabled: 'true',
        webhookRetryAttempts: '3',
        paymentExpirationDays: '7'
      }
    );
  }

  /**
   * Valida configurações de um tenant
   */
  static validateTenantSettings(settings: TenantSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar timezone
    try {
      Intl.DateTimeFormat(undefined, { timeZone: settings.timezone });
    } catch {
      errors.push('Timezone inválido');
    }

    // Validar currency
    const validCurrencies = ['BRL', 'USD', 'EUR'];
    if (!validCurrencies.includes(settings.currency)) {
      errors.push(`Moeda deve ser uma das seguintes: ${validCurrencies.join(', ')}`);
    }

    // Validar language
    const validLanguages = ['pt-BR', 'en-US', 'es-ES'];
    if (!validLanguages.includes(settings.language)) {
      errors.push(`Idioma deve ser um dos seguintes: ${validLanguages.join(', ')}`);
    }

    // Validar paymentMethods
    const validPaymentMethods = ['stripe', 'pagarme', 'mercadopago'];
    for (const method of settings.paymentMethods) {
      if (!validPaymentMethods.includes(method)) {
        errors.push(`Método de pagamento inválido: ${method}`);
      }
    }

    // Validar webhookUrl se fornecida
    if (settings.webhookUrl) {
      try {
        new URL(settings.webhookUrl);
      } catch {
        errors.push('URL do webhook inválida');
      }
    }

    // Validar maxPaymentAmount se fornecido
    if (settings.apiKeys?.maxPaymentAmount) {
      const maxAmount = parseInt(settings.apiKeys.maxPaymentAmount);
      if (isNaN(maxAmount) || maxAmount <= 0) {
        errors.push('Valor máximo de pagamento deve ser um número positivo');
      }
    }

    // Validar autoCaptureEnabled se fornecido
    if (settings.apiKeys?.autoCaptureEnabled) {
      const autoCapture = settings.apiKeys.autoCaptureEnabled;
      if (!['true', 'false'].includes(autoCapture)) {
        errors.push('autoCaptureEnabled deve ser "true" ou "false"');
      }
    }

    // Validar webhookRetryAttempts se fornecido
    if (settings.apiKeys?.webhookRetryAttempts) {
      const retryAttempts = parseInt(settings.apiKeys.webhookRetryAttempts);
      if (isNaN(retryAttempts) || retryAttempts < 0 || retryAttempts > 10) {
        errors.push('Número de tentativas de webhook deve ser entre 0 e 10');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula estatísticas de um tenant
   */
  static calculateTenantStats(
    tenant: Tenant,
    users: User[],
    payments: any[],
    _transactions: any[]
  ): {
    totalUsers: number;
    activeUsers: number;
    totalPayments: number;
    successfulPayments: number;
    totalRevenue: number;
    averagePaymentValue: number;
  } {
    const tenantUsers = users.filter(u => u.tenantId.getValue() === tenant.id.getValue());
    const tenantPayments = payments.filter(p => p.tenantId === tenant.id.getValue());
    // tenantTransactions removido - não utilizado

    const activeUsers = tenantUsers.filter(u => u.isActive).length;
    const successfulPayments = tenantPayments.filter(p => p.status === 'captured').length;
    const totalRevenue = tenantPayments
      .filter(p => p.status === 'captured')
      .reduce((sum, p) => sum + p.amount, 0);

    const averagePaymentValue = tenantPayments.length > 0 
      ? totalRevenue / tenantPayments.length 
      : 0;

    return {
      totalUsers: tenantUsers.length,
      activeUsers,
      totalPayments: tenantPayments.length,
      successfulPayments,
      totalRevenue,
      averagePaymentValue
    };
  }

  /**
   * Determina se um tenant precisa de verificação adicional
   */
  static requiresAdditionalVerification(
    tenant: Tenant,
    totalRevenue: number,
    paymentCount: number
  ): boolean {
    // Verificar se o tenant é novo (menos de 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (tenant.createdAt > thirtyDaysAgo) {
      return true; // Tenant novo sempre precisa de verificação
    }

    // Verificar se há volume alto de transações
    if (paymentCount > 1000) {
      return true;
    }

    // Verificar se há receita alta
    if (totalRevenue > 10000000) { // R$ 100.000,00
      return true;
    }

    return false;
  }

  /**
   * Gera um slug único para um tenant baseado no nome
   */
  static generateUniqueSlug(
    name: string,
    existingTenants: Tenant[]
  ): string {
    // Converter nome para slug
    let slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();

    // Verificar se já existe
    let finalSlug = slug;
    let counter = 1;
    
    while (existingTenants.some(t => t.slug.getValue() === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }
}
