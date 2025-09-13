import type { PaymentProviderInterface } from '../interfaces/external/PaymentProviderInterface';
import { StripeProvider } from '@/infrastructure/external/stripe/StripeProvider';
import { PagarmeProvider } from '@/infrastructure/external/pagarme/PagarmeProvider';
import { PaymentProvider } from '@/domain/enums/PaymentProvider';
import type { Payment } from '@/domain/entities/Payment';
import type { Tenant } from '@/domain/entities/Tenant';

/**
 * Serviço para gerenciar provedores de pagamento
 * Implementa o Strategy Pattern para seleção dinâmica de providers
 */
export class PaymentProviderService {
  private providers: Map<PaymentProvider, PaymentProviderInterface> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Inicializa os provedores disponíveis
   */
  private initializeProviders(): void {
    // Os providers serão configurados dinamicamente baseado nas credenciais do tenant
  }

  /**
   * Registra um provedor
   */
  registerProvider(provider: PaymentProvider, providerInstance: PaymentProviderInterface): void {
    this.providers.set(provider, providerInstance);
  }

  /**
   * Obtém um provedor específico
   */
  getProvider(provider: PaymentProvider): PaymentProviderInterface | null {
    return this.providers.get(provider) || null;
  }

  /**
   * Cria um provedor baseado nas configurações do tenant
   */
  createProvider(provider: PaymentProvider, tenant: Tenant): PaymentProviderInterface | null {
    const apiKey = tenant.settings.apiKeys?.[provider];
    
    if (!apiKey) {
      throw new Error(`API key não configurada para o provedor ${provider}`);
    }

      const config = {
        apiKey,
        webhookSecret: tenant.settings.apiKeys?.[`${provider}_webhook`],
        environment: (tenant.settings.apiKeys?.[`${provider}_environment`] === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
        timeout: 30000,
        retries: 3,
      };

    switch (provider) {
      case PaymentProvider.STRIPE:
        return new StripeProvider(config);
      
      case PaymentProvider.PAGARME:
        return new PagarmeProvider(config);
      
      default:
        throw new Error(`Provedor ${provider} não suportado`);
    }
  }

  /**
   * Seleciona o melhor provedor para um pagamento
   */
  selectProvider(payment: Payment, tenant: Tenant): PaymentProvider {
    // Lógica de seleção baseada em:
    // 1. Configurações do tenant
    // 2. Tipo de pagamento
    // 3. Moeda
    // 4. Disponibilidade do provedor

    const availableProviders = this.getAvailableProviders(tenant);
    
    if (availableProviders.length === 0) {
      throw new Error('Nenhum provedor de pagamento disponível');
    }

    // Por enquanto, retorna o primeiro disponível
    // TODO: Implementar lógica mais sofisticada
    return availableProviders[0];
  }

  /**
   * Obtém provedores disponíveis para um tenant
   */
  private getAvailableProviders(tenant: Tenant): PaymentProvider[] {
    const providers: PaymentProvider[] = [];
    
    // Verifica se o tenant tem credenciais para cada provedor
    if (tenant.settings.apiKeys?.[PaymentProvider.STRIPE]) {
      providers.push(PaymentProvider.STRIPE);
    }
    
    if (tenant.settings.apiKeys?.[PaymentProvider.PAGARME]) {
      providers.push(PaymentProvider.PAGARME);
    }

    return providers;
  }

  /**
   * Verifica se um provedor está disponível
   */
  isProviderAvailable(provider: PaymentProvider, tenant: Tenant): boolean {
    return !!tenant.settings.apiKeys?.[provider];
  }

  /**
   * Lista todos os provedores disponíveis para um tenant
   */
  getAvailableProvidersForTenant(tenant: Tenant): PaymentProvider[] {
    return this.getAvailableProviders(tenant);
  }

  /**
   * Valida configurações de um provedor
   */
  async validateProviderConfig(provider: PaymentProvider, tenant: Tenant): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const providerInstance = this.createProvider(provider, tenant);
      
      if (!providerInstance) {
        return {
          isValid: false,
          error: 'Falha ao criar instância do provedor',
        };
      }

      // TODO: Implementar validação específica para cada provedor
      // Por exemplo, fazer uma chamada de teste para verificar as credenciais

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}
