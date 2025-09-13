import { db } from './connection';
import { tenants, users, payments, transactions, tenantConfigs, webhooks } from './schema';
// eq import removido - não utilizado

// Função para limpar todas as tabelas (cuidado em produção!)
async function clearDatabase(): Promise<void> {
  console.log('🗑️ Limpando dados existentes...');
  
  // Ordem de exclusão respeitando as foreign keys
  await db.delete(webhooks);
  await db.delete(transactions);
  await db.delete(payments);
  await db.delete(tenantConfigs);
  await db.delete(users);
  await db.delete(tenants);
  
  console.log('✅ Dados limpos com sucesso');
}

// Função para criar tenants de exemplo
async function seedTenants(): Promise<string[]> {
  console.log('🏢 Criando tenants...');
  
  const tenantData = [
    {
      name: 'TechCorp Solutions',
      slug: 'techcorp',
      email: 'admin@techcorp.com',
      status: 'active',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        paymentMethods: ['stripe', 'pagarme'],
        webhookUrl: 'https://techcorp.com/webhooks/payment',
        apiKeys: {
          stripe: 'sk_test_techcorp_stripe_key',
          pagarme: 'ak_test_techcorp_pagarme_key'
        }
      }
    },
    {
      name: 'E-commerce Store',
      slug: 'ecommerce-store',
      email: 'admin@ecommerce-store.com',
      status: 'active',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        paymentMethods: ['stripe'],
        webhookUrl: 'https://ecommerce-store.com/webhooks/payment',
        apiKeys: {
          stripe: 'sk_test_ecommerce_stripe_key',
          pagarme: ''
        }
      }
    },
    {
      name: 'StartupXYZ',
      slug: 'startupxyz',
      email: 'admin@startupxyz.com',
      status: 'active',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        paymentMethods: ['pagarme'],
        webhookUrl: 'https://startupxyz.com/webhooks/payment',
        apiKeys: {
          pagarme: 'ak_test_startupxyz_pagarme_key',
          stripe: ''
        }
      }
    },
    {
      name: 'Inactive Company',
      slug: 'inactive-company',
      email: 'admin@inactive-company.com',
      status: 'inactive',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        paymentMethods: ['stripe'],
        webhookUrl: 'https://inactive-company.com/webhooks/payment',
        apiKeys: {
          stripe: 'sk_test_inactive_stripe_key',
          pagarme: ''
        }
      }
    }
  ];

  const insertedTenants = await db.insert(tenants).values(tenantData).returning();
  console.log(`✅ ${insertedTenants.length} tenants criados`);
  
  return insertedTenants.map(t => t.id);
}

// Função para criar usuários de exemplo
async function seedUsers(tenantIds: string[]): Promise<string[]> {
  console.log('👥 Criando usuários...');
  
  const userData = [
    // TechCorp Solutions
    {
      tenantId: tenantIds[0],
      email: 'admin@techcorp.com',
      passwordHash: '$2b$10$rQZ8kQZ8kQZ8kQZ8kQZ8kO', // hash para 'password123'
      firstName: 'João',
      lastName: 'Silva',
      role: 'admin',
      status: 'active',
      preferences: {
        notifications: true,
        theme: 'dark',
        language: 'pt-BR'
      },
      emailVerifiedAt: new Date()
    },
    {
      tenantId: tenantIds[0],
      email: 'financeiro@techcorp.com',
      passwordHash: '$2b$10$rQZ8kQZ8kQZ8kQZ8kQZ8kO',
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'finance',
      status: 'active',
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'pt-BR'
      },
      emailVerifiedAt: new Date()
    },
    {
      tenantId: tenantIds[0],
      email: 'cliente@techcorp.com',
      passwordHash: '$2b$10$rQZ8kQZ8kQZ8kQZ8kQZ8kO',
      firstName: 'Pedro',
      lastName: 'Oliveira',
      role: 'customer',
      status: 'active',
      preferences: {
        notifications: false,
        theme: 'light',
        language: 'pt-BR'
      }
    },
    // E-commerce Store
    {
      tenantId: tenantIds[1],
      email: 'admin@ecommerce-store.com',
      passwordHash: '$2b$10$rQZ8kQZ8kQZ8kQZ8kQZ8kO',
      firstName: 'Ana',
      lastName: 'Costa',
      role: 'admin',
      status: 'active',
      preferences: {
        notifications: true,
        theme: 'dark',
        language: 'pt-BR'
      },
      emailVerifiedAt: new Date()
    },
    {
      tenantId: tenantIds[1],
      email: 'suporte@ecommerce-store.com',
      passwordHash: '$2b$10$rQZ8kQZ8kQZ8kQZ8kQZ8kO',
      firstName: 'Carlos',
      lastName: 'Ferreira',
      role: 'support',
      status: 'active',
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'pt-BR'
      }
    },
    // StartupXYZ
    {
      tenantId: tenantIds[2],
      email: 'admin@startupxyz.com',
      passwordHash: '$2b$10$rQZ8kQZ8kQZ8kQZ8kQZ8kO',
      firstName: 'Lucas',
      lastName: 'Rodrigues',
      role: 'admin',
      status: 'active',
      preferences: {
        notifications: true,
        theme: 'dark',
        language: 'pt-BR'
      },
      emailVerifiedAt: new Date()
    }
  ];

  const insertedUsers = await db.insert(users).values(userData).returning();
  console.log(`✅ ${insertedUsers.length} usuários criados`);
  
  return insertedUsers.map(u => u.id);
}

// Função para criar pagamentos de exemplo
async function seedPayments(tenantIds: string[], userIds: string[]): Promise<string[]> {
  console.log('💳 Criando pagamentos...');
  
  const paymentData = [
    {
      tenantId: tenantIds[0],
      userId: userIds[0],
      amount: 5000, // R$ 50,00
      currency: 'BRL',
      status: 'captured',
      provider: 'stripe',
      providerPaymentId: 'pi_techcorp_001',
      providerData: {
        stripe_payment_intent_id: 'pi_techcorp_001',
        stripe_charge_id: 'ch_techcorp_001',
        payment_method: 'card'
      },
      description: 'Pagamento de assinatura mensal',
      metadata: {
        plan: 'premium',
        billing_cycle: 'monthly'
      },
      paidAt: new Date()
    },
    {
      tenantId: tenantIds[0],
      userId: userIds[1],
      amount: 10000, // R$ 100,00
      currency: 'BRL',
      status: 'pending',
      provider: 'pagarme',
      providerPaymentId: 'pagarme_techcorp_001',
      providerData: {
        pagarme_transaction_id: 'pagarme_techcorp_001',
        payment_method: 'boleto'
      },
      description: 'Pagamento de setup',
      metadata: {
        service: 'setup',
        urgency: 'high'
      },
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias
    },
    {
      tenantId: tenantIds[1],
      userId: userIds[3],
      amount: 2500, // R$ 25,00
      currency: 'BRL',
      status: 'authorized',
      provider: 'stripe',
      providerPaymentId: 'pi_ecommerce_001',
      providerData: {
        stripe_payment_intent_id: 'pi_ecommerce_001',
        payment_method: 'card'
      },
      description: 'Compra de produto',
      metadata: {
        product_id: 'prod_123',
        quantity: 1,
        category: 'electronics'
      }
    },
    {
      tenantId: tenantIds[1],
      userId: userIds[3],
      amount: 15000, // R$ 150,00
      currency: 'BRL',
      status: 'failed',
      provider: 'stripe',
      providerPaymentId: 'pi_ecommerce_002',
      providerData: {
        stripe_payment_intent_id: 'pi_ecommerce_002',
        payment_method: 'card',
        failure_reason: 'insufficient_funds'
      },
      description: 'Compra de produto - falhou',
      metadata: {
        product_id: 'prod_456',
        quantity: 2,
        category: 'clothing'
      }
    },
    {
      tenantId: tenantIds[2],
      userId: userIds[5],
      amount: 7500, // R$ 75,00
      currency: 'BRL',
      status: 'captured',
      provider: 'pagarme',
      providerPaymentId: 'pagarme_startup_001',
      providerData: {
        pagarme_transaction_id: 'pagarme_startup_001',
        payment_method: 'credit_card'
      },
      description: 'Serviço de consultoria',
      metadata: {
        service_type: 'consulting',
        hours: 5,
        rate: 1500
      },
      paidAt: new Date()
    }
  ];

  const insertedPayments = await db.insert(payments).values(paymentData).returning();
  console.log(`✅ ${insertedPayments.length} pagamentos criados`);
  
  return insertedPayments.map(p => p.id);
}

// Função para criar transações de exemplo
async function seedTransactions(tenantIds: string[], paymentIds: string[]): Promise<void> {
  console.log('🔄 Criando transações...');
  
  const transactionData = [
    {
      paymentId: paymentIds[0],
      tenantId: tenantIds[0],
      type: 'payment',
      amount: 5000,
      status: 'captured',
      providerTransactionId: 'tx_stripe_techcorp_001',
      providerData: {
        stripe_transaction_id: 'tx_stripe_techcorp_001',
        fee: 150,
        net_amount: 4850
      }
    },
    {
      paymentId: paymentIds[1],
      tenantId: tenantIds[0],
      type: 'payment',
      amount: 10000,
      status: 'pending',
      providerTransactionId: 'tx_pagarme_techcorp_001',
      providerData: {
        pagarme_transaction_id: 'tx_pagarme_techcorp_001',
        fee: 300,
        net_amount: 9700
      }
    },
    {
      paymentId: paymentIds[2],
      tenantId: tenantIds[1],
      type: 'payment',
      amount: 2500,
      status: 'authorized',
      providerTransactionId: 'tx_stripe_ecommerce_001',
      providerData: {
        stripe_transaction_id: 'tx_stripe_ecommerce_001',
        fee: 75,
        net_amount: 2425
      }
    },
    {
      paymentId: paymentIds[2],
      tenantId: tenantIds[1],
      type: 'payment',
      amount: 2500,
      status: 'captured',
      providerTransactionId: 'tx_stripe_ecommerce_002',
      providerData: {
        stripe_transaction_id: 'tx_stripe_ecommerce_002',
        fee: 75,
        net_amount: 2425
      }
    },
    {
      paymentId: paymentIds[4],
      tenantId: tenantIds[2],
      type: 'payment',
      amount: 7500,
      status: 'captured',
      providerTransactionId: 'tx_pagarme_startup_001',
      providerData: {
        pagarme_transaction_id: 'tx_pagarme_startup_001',
        fee: 225,
        net_amount: 7275
      }
    }
  ];

  const insertedTransactions = await db.insert(transactions).values(transactionData).returning();
  console.log(`✅ ${insertedTransactions.length} transações criadas`);
}

// Função para criar configurações de tenant
async function seedTenantConfigs(tenantIds: string[]): Promise<void> {
  console.log('⚙️ Criando configurações de tenant...');
  
  const configData = [
    // TechCorp Solutions
    {
      tenantId: tenantIds[0],
      configKey: 'max_payment_amount',
      configValue: '100000',
      configType: 'number'
    },
    {
      tenantId: tenantIds[0],
      configKey: 'auto_capture_enabled',
      configValue: 'true',
      configType: 'boolean'
    },
    {
      tenantId: tenantIds[0],
      configKey: 'webhook_retry_attempts',
      configValue: '3',
      configType: 'number'
    },
    {
      tenantId: tenantIds[0],
      configKey: 'allowed_payment_methods',
      configValue: '["card", "boleto", "pix"]',
      configType: 'json'
    },
    // E-commerce Store
    {
      tenantId: tenantIds[1],
      configKey: 'max_payment_amount',
      configValue: '50000',
      configType: 'number'
    },
    {
      tenantId: tenantIds[1],
      configKey: 'auto_capture_enabled',
      configValue: 'false',
      configType: 'boolean'
    },
    {
      tenantId: tenantIds[1],
      configKey: 'allowed_payment_methods',
      configValue: '["card", "pix"]',
      configType: 'json'
    },
    // StartupXYZ
    {
      tenantId: tenantIds[2],
      configKey: 'max_payment_amount',
      configValue: '25000',
      configType: 'number'
    },
    {
      tenantId: tenantIds[2],
      configKey: 'auto_capture_enabled',
      configValue: 'true',
      configType: 'boolean'
    }
  ];

  const insertedConfigs = await db.insert(tenantConfigs).values(configData).returning();
  console.log(`✅ ${insertedConfigs.length} configurações criadas`);
}

// Função para criar webhooks de exemplo
async function seedWebhooks(tenantIds: string[], paymentIds: string[]): Promise<void> {
  console.log('🔗 Criando webhooks...');
  
  const webhookData = [
    {
      tenantId: tenantIds[0],
      paymentId: paymentIds[0],
      provider: 'stripe',
      eventType: 'payment_intent.succeeded',
      status: 'processed',
      payload: {
        id: 'evt_stripe_001',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_techcorp_001',
            amount: 5000,
            currency: 'brl',
            status: 'succeeded'
          }
        }
      },
      headers: {
        'stripe-signature': 't=1234567890,v1=signature_hash',
        'user-agent': 'Stripe/1.0'
      },
      signature: 'stripe_signature_hash_001',
      processedAt: new Date()
    },
    {
      tenantId: tenantIds[1],
      paymentId: paymentIds[2],
      provider: 'stripe',
      eventType: 'payment_intent.created',
      status: 'pending',
      payload: {
        id: 'evt_stripe_002',
        type: 'payment_intent.created',
        data: {
          object: {
            id: 'pi_ecommerce_001',
            amount: 2500,
            currency: 'brl',
            status: 'requires_payment_method'
          }
        }
      },
      headers: {
        'stripe-signature': 't=1234567891,v1=signature_hash',
        'user-agent': 'Stripe/1.0'
      },
      signature: 'stripe_signature_hash_002'
    },
    {
      tenantId: tenantIds[2],
      paymentId: paymentIds[4],
      provider: 'pagarme',
      eventType: 'transaction.created',
      status: 'processed',
      payload: {
        id: 'evt_pagarme_001',
        type: 'transaction.created',
        transaction: {
          id: 'pagarme_startup_001',
          amount: 7500,
          currency: 'BRL',
          status: 'paid'
        }
      },
      headers: {
        'user-agent': 'Pagar.me/1.0'
      },
      signature: 'pagarme_signature_hash_001',
      processedAt: new Date()
    }
  ];

  const insertedWebhooks = await db.insert(webhooks).values(webhookData).returning();
  console.log(`✅ ${insertedWebhooks.length} webhooks criados`);
}

// Função principal para executar o seed
export async function runSeed(clearFirst = true): Promise<void> {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');
    
    if (clearFirst) {
      await clearDatabase();
      console.log('');
    }
    
    // Criar dados em ordem de dependência
    const tenantIds = await seedTenants();
    console.log('');
    
    const userIds = await seedUsers(tenantIds);
    console.log('');
    
    const paymentIds = await seedPayments(tenantIds, userIds);
    console.log('');
    
    await seedTransactions(tenantIds, paymentIds);
    console.log('');
    
    await seedTenantConfigs(tenantIds);
    console.log('');
    
    await seedWebhooks(tenantIds, paymentIds);
    console.log('');
    
    console.log('🎉 Seed executado com sucesso!');
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`   - ${tenantIds.length} tenants`);
    console.log(`   - ${userIds.length} usuários`);
    console.log(`   - ${paymentIds.length} pagamentos`);
    console.log('   - 5 transações');
    console.log('   - 9 configurações de tenant');
    console.log('   - 3 webhooks');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Função para verificar dados existentes
export async function checkSeedData(): Promise<void> {
  console.log('🔍 Verificando dados no banco...\n');
  
  const tenantCount = await db.select().from(tenants);
  const userCount = await db.select().from(users);
  const paymentCount = await db.select().from(payments);
  const transactionCount = await db.select().from(transactions);
  const configCount = await db.select().from(tenantConfigs);
  const webhookCount = await db.select().from(webhooks);
  
  console.log('📊 Dados encontrados:');
  console.log(`   - ${tenantCount.length} tenants`);
  console.log(`   - ${userCount.length} usuários`);
  console.log(`   - ${paymentCount.length} pagamentos`);
  console.log(`   - ${transactionCount.length} transações`);
  console.log(`   - ${configCount.length} configurações`);
  console.log(`   - ${webhookCount.length} webhooks`);
  
  if (tenantCount.length > 0) {
    console.log('\n🏢 Tenants encontrados:');
    tenantCount.forEach(tenant => {
      console.log(`   - ${tenant.name} (${tenant.slug}) - ${tenant.status}`);
    });
  }
}

// Executar seed se chamado diretamente
if (import.meta.main) {
  runSeed()
    .then(() => {
      console.log('\n✅ Seed concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no seed:', error);
      process.exit(1);
    });
}
