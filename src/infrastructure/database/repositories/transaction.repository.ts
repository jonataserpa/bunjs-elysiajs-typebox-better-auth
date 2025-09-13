import { db } from '../connection';
import { transactions, payments } from '../schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import type { Transaction, NewTransaction } from '../schema';

export class DrizzleTransactionRepository {
  async create(transactionData: NewTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction || null;
  }

  async findByTenantId(tenantId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactions.createdAt));
  }

  async findByPaymentId(paymentId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.paymentId, paymentId))
      .orderBy(desc(transactions.createdAt));
  }

  async findByTenantIdAndStatus(tenantId: string, status: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.status, status)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactions.createdAt));
  }

  async findByTenantIdAndType(tenantId: string, type: string, limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.type, type)
      ))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactions.createdAt));
  }

  async countByTenantId(tenantId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.tenantId, tenantId));
    return result[0].count;
  }

  async countByTenantIdAndStatus(tenantId: string, status: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.status, status)
      ));
    return result[0].count;
  }

  async getTotalAmountByTenantId(tenantId: string): Promise<number> {
    const result = await db
      .select({ total: sql<number>`sum(${transactions.amount})` })
      .from(transactions)
      .where(eq(transactions.tenantId, tenantId));
    return result[0].total || 0;
  }

  async update(id: string, updateData: Partial<Transaction>): Promise<Transaction | null> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(eq(transactions.id, id));
    return result.length > 0;
  }

  async findAll(limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactions.createdAt));
  }

  async countAll(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(transactions);
    return result[0].count;
  }

  // Método para buscar transactions com informações do payment
  async findByTenantIdWithPayment(tenantId: string, limit = 50, offset = 0): Promise<any[]> {
    return await db
      .select({
        transaction: transactions,
        payment: payments
      })
      .from(transactions)
      .innerJoin(payments, eq(transactions.paymentId, payments.id))
      .where(eq(transactions.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactions.createdAt));
  }
}
