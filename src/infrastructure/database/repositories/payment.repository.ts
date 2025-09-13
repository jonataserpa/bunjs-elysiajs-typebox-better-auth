import { eq, and, count, sql, gte, lte, sum } from 'drizzle-orm';
import { db } from '../connection';
import { payments } from '../schema';
import type { PaymentRepository } from '@/application/interfaces/repositories/payment.repository.interface';
import type { Payment, NewPayment } from '@/infrastructure/database/schema';

export class DrizzlePaymentRepository implements PaymentRepository {
  async create(data: NewPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async findById(id: string): Promise<Payment | null> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || null;
  }

  async update(id: string, data: Partial<NewPayment>): Promise<Payment | null> {
    const [payment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result.length > 0;
  }

  async findByTenantId(tenantId: string, limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByTenantIdAndStatus(tenantId: string, status: string, limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(and(eq(payments.tenantId, tenantId), eq(payments.status, status)))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByTenantIdAndProvider(tenantId: string, provider: string, limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(and(eq(payments.tenantId, tenantId), eq(payments.provider, provider)))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByUserIdAndStatus(userId: string, status: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.status, status)))
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.providerPaymentId, providerPaymentId));
    return payment || null;
  }

  async findByProviderAndPaymentId(provider: string, providerPaymentId: string): Promise<Payment | null> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.provider, provider),
          eq(payments.providerPaymentId, providerPaymentId)
        )
      );
    return payment || null;
  }

  async findByStatus(status: string, limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.status, status))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByProvider(provider: string, limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.provider, provider))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId?: string): Promise<Payment[]> {
    const conditions = [
      gte(payments.createdAt, startDate),
      lte(payments.createdAt, endDate)
    ];
    
    if (tenantId) {
      conditions.push(eq(payments.tenantId, tenantId));
    }
    
    return await db
      .select()
      .from(payments)
      .where(and(...conditions))
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.id, id));
    return result[0].count > 0;
  }

  async providerPaymentIdExists(providerPaymentId: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.providerPaymentId, providerPaymentId));
    return result[0].count > 0;
  }

  async countByTenantId(tenantId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.tenantId, tenantId));
    return result[0].count;
  }

  async countByTenantIdAndStatus(tenantId: string, status: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(payments)
      .where(and(eq(payments.tenantId, tenantId), eq(payments.status, status)));
    return result[0].count;
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.userId, userId));
    return result[0].count;
  }

  async countByStatus(status: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.status, status));
    return result[0].count;
  }

  async getTotalAmountByTenantId(tenantId: string): Promise<number> {
    const result = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.tenantId, tenantId));
    return Number(result[0].total) || 0;
  }

  async getTotalAmountByTenantIdAndStatus(tenantId: string, status: string): Promise<number> {
    const result = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(eq(payments.tenantId, tenantId), eq(payments.status, status)));
    return Number(result[0].total) || 0;
  }

  async getTotalAmountByDateRange(startDate: Date, endDate: Date, tenantId?: string): Promise<number> {
    const conditions = [
      gte(payments.createdAt, startDate),
      lte(payments.createdAt, endDate)
    ];
    
    if (tenantId) {
      conditions.push(eq(payments.tenantId, tenantId));
    }
    
    const result = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(...conditions));
    return Number(result[0].total) || 0;
  }

  async findAll(limit = 50, offset = 0): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${payments.createdAt} DESC`);
  }

  async countAll(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(payments);
    return result[0].count;
  }
}
