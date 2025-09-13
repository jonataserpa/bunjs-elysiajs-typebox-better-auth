/**
 * Enum para provedores de pagamento
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAGARME = 'pagarme'
}

/**
 * Interface para informações de provedor
 */
export interface PaymentProviderInfo {
  provider: PaymentProvider;
  name: string;
  description: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  features: string[];
}

/**
 * Mapa de informações dos provedores
 */
export const PAYMENT_PROVIDER_INFO: Record<PaymentProvider, PaymentProviderInfo> = {
  [PaymentProvider.STRIPE]: {
    provider: PaymentProvider.STRIPE,
    name: 'Stripe',
    description: 'Plataforma de pagamentos global',
    supportedCurrencies: ['USD', 'EUR', 'BRL', 'GBP', 'CAD', 'AUD'],
    supportedCountries: ['US', 'BR', 'CA', 'AU', 'GB', 'DE', 'FR'],
    features: [
      'Cartões de crédito/débito',
      'PIX',
      'Boleto bancário',
      'Cartão de débito',
      'Transferência bancária',
      'Webhooks',
      'Fraud prevention',
      '3D Secure'
    ]
  },
  [PaymentProvider.PAGARME]: {
    provider: PaymentProvider.PAGARME,
    name: 'Pagar.me',
    description: 'Plataforma de pagamentos brasileira',
    supportedCurrencies: ['BRL'],
    supportedCountries: ['BR'],
    features: [
      'Cartões de crédito/débito',
      'PIX',
      'Boleto bancário',
      'Cartão de débito',
      'Split de pagamento',
      'Antecipação de recebíveis',
      'Webhooks',
      'Fraud prevention'
    ]
  }
};

/**
 * Utilitários para provedores de pagamento
 */
export class PaymentProviderUtils {
  /**
   * Verifica se um provedor suporta uma moeda
   */
  static supportsCurrency(provider: PaymentProvider, currency: string): boolean {
    const providerInfo = PAYMENT_PROVIDER_INFO[provider];
    return providerInfo.supportedCurrencies.includes(currency);
  }

  /**
   * Verifica se um provedor suporta um país
   */
  static supportsCountry(provider: PaymentProvider, country: string): boolean {
    const providerInfo = PAYMENT_PROVIDER_INFO[provider];
    return providerInfo.supportedCountries.includes(country);
  }

  /**
   * Obtém informações de um provedor
   */
  static getProviderInfo(provider: PaymentProvider): PaymentProviderInfo {
    return PAYMENT_PROVIDER_INFO[provider];
  }

  /**
   * Obtém todos os provedores disponíveis
   */
  static getAllProviders(): PaymentProvider[] {
    return Object.values(PaymentProvider);
  }

  /**
   * Obtém provedores que suportam uma moeda específica
   */
  static getProvidersForCurrency(currency: string): PaymentProvider[] {
    return this.getAllProviders().filter(provider => 
      this.supportsCurrency(provider, currency)
    );
  }

  /**
   * Obtém provedores que suportam um país específico
   */
  static getProvidersForCountry(country: string): PaymentProvider[] {
    return this.getAllProviders().filter(provider => 
      this.supportsCountry(provider, country)
    );
  }
}