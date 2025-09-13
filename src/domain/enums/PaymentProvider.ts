/**
 * Enum para provedores de pagamento
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAGARME = 'pagarme',
  MERCADOPAGO = 'mercadopago'
}

/**
 * Interface para informações de provider
 */
export interface PaymentProviderInfo {
  provider: PaymentProvider;
  name: string;
  displayName: string;
  website: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  features: string[];
}

/**
 * Mapa de informações dos providers
 */
export const PAYMENT_PROVIDER_INFO: Record<PaymentProvider, PaymentProviderInfo> = {
  [PaymentProvider.STRIPE]: {
    provider: PaymentProvider.STRIPE,
    name: 'Stripe',
    displayName: 'Stripe',
    website: 'https://stripe.com',
    supportedCurrencies: ['USD', 'EUR', 'BRL'],
    supportedCountries: ['US', 'BR', 'EU'],
    features: ['cards', 'pix', 'boleto', 'instant_payment']
  },
  [PaymentProvider.PAGARME]: {
    provider: PaymentProvider.PAGARME,
    name: 'Pagar.me',
    displayName: 'Pagar.me',
    website: 'https://pagar.me',
    supportedCurrencies: ['BRL'],
    supportedCountries: ['BR'],
    features: ['cards', 'pix', 'boleto', 'pix_recurring']
  },
  [PaymentProvider.MERCADOPAGO]: {
    provider: PaymentProvider.MERCADOPAGO,
    name: 'Mercado Pago',
    displayName: 'Mercado Pago',
    website: 'https://mercadopago.com.br',
    supportedCurrencies: ['BRL', 'ARS', 'CLP', 'COP', 'MXN', 'PEN', 'UYU'],
    supportedCountries: ['BR', 'AR', 'CL', 'CO', 'MX', 'PE', 'UY'],
    features: ['cards', 'pix', 'boleto', 'qr_code', 'installments']
  }
};

/**
 * Utilitários para providers de pagamento
 */
export class PaymentProviderUtils {
  /**
   * Verifica se um provider suporta uma moeda
   */
  static supportsCurrency(provider: PaymentProvider, currency: string): boolean {
    const providerInfo = PAYMENT_PROVIDER_INFO[provider];
    return providerInfo.supportedCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Verifica se um provider suporta um país
   */
  static supportsCountry(provider: PaymentProvider, country: string): boolean {
    const providerInfo = PAYMENT_PROVIDER_INFO[provider];
    return providerInfo.supportedCountries.includes(country.toUpperCase());
  }

  /**
   * Verifica se um provider tem uma feature específica
   */
  static hasFeature(provider: PaymentProvider, feature: string): boolean {
    const providerInfo = PAYMENT_PROVIDER_INFO[provider];
    return providerInfo.features.includes(feature);
  }

  /**
   * Obtém informações de um provider
   */
  static getProviderInfo(provider: PaymentProvider): PaymentProviderInfo {
    return PAYMENT_PROVIDER_INFO[provider];
  }

  /**
   * Obtém todos os providers disponíveis
   */
  static getAllProviders(): PaymentProvider[] {
    return Object.values(PaymentProvider);
  }

  /**
   * Obtém providers que suportam uma moeda específica
   */
  static getProvidersForCurrency(currency: string): PaymentProvider[] {
    return this.getAllProviders().filter(provider => 
      this.supportsCurrency(provider, currency)
    );
  }

  /**
   * Obtém providers que suportam um país específico
   */
  static getProvidersForCountry(country: string): PaymentProvider[] {
    return this.getAllProviders().filter(provider => 
      this.supportsCountry(provider, country)
    );
  }

  /**
   * Gera ID de pagamento específico do provider
   */
  static generatePaymentId(provider: PaymentProvider): string {
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
