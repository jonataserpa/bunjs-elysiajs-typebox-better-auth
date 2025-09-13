import { eq, and, count, sql, isNull } from 'drizzle-orm';
import { db } from '../connection';
import { tenants } from '../schema';
import type { TenantRepository } from '@/application/interfaces/repositories/tenant.repository.interface';
import type { Tenant, NewTenant } from '@/infrastructure/database/schema';

export class DrizzleTenantRepository implements TenantRepository {
  async create(data: NewTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(data).returning();
    return tenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return tenant || null;
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
    return tenant || null;
  }

  async update(id: string, data: Partial<NewTenant>): Promise<Tenant | null> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .update(tenants)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return result.length > 0;
  }

  async findAll(limit = 50, offset = 0): Promise<Tenant[]> {
    return await db
      .select()
      .from(tenants)
      .where(isNull(tenants.deletedAt))
      .limit(limit)
      .offset(offset);
  }

  async findByStatus(status: string): Promise<Tenant[]> {
    return await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.status, status), isNull(tenants.deletedAt)));
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(eq(tenants.id, id), isNull(tenants.deletedAt)));
    return result[0].count > 0;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(tenants.slug, slug), isNull(tenants.deletedAt)];
    if (excludeId) {
      conditions.push(sql`${tenants.id} != ${excludeId}`);
    }
    
    const result = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(...conditions));
    return result[0].count > 0;
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(tenants.email, email), isNull(tenants.deletedAt)];
    if (excludeId) {
      conditions.push(sql`${tenants.id} != ${excludeId}`);
    }
    
    const result = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(...conditions));
    return result[0].count > 0;
  }

  async count(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(tenants)
      .where(isNull(tenants.deletedAt));
    return result[0].count;
  }

  async countByStatus(status: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(tenants)
      .where(and(eq(tenants.status, status), isNull(tenants.deletedAt)));
    return result[0].count;
  }
}
