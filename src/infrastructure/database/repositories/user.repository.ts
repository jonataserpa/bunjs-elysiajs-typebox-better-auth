import { eq, and, count, sql, isNull } from 'drizzle-orm';
import { db } from '../connection';
import { users } from '../schema';
import type { UserRepository } from '../../../application/interfaces/repositories/user.repository.interface';
import type { User, NewUser } from '../schema';

export class DrizzleUserRepository implements UserRepository {
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.tenantId, tenantId)));
    return user || null;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  async findByTenantId(tenantId: string, limit = 50, offset = 0): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenantId), isNull(users.deletedAt)))
      .limit(limit)
      .offset(offset);
  }

  async findByTenantIdAndRole(tenantId: string, role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.role, role),
          isNull(users.deletedAt)
        )
      );
  }

  async findByTenantIdAndStatus(tenantId: string, status: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.status, status),
          isNull(users.deletedAt)
        )
      );
  }

  async findActiveByEmail(email: string, tenantId: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.tenantId, tenantId),
          eq(users.status, 'active'),
          isNull(users.deletedAt)
        )
      );
    return user || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    return result[0].count > 0;
  }

  async emailExistsInTenant(email: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(users.email, email),
      eq(users.tenantId, tenantId),
      isNull(users.deletedAt)
    ];
    if (excludeId) {
      conditions.push(sql`${users.id} != ${excludeId}`);
    }
    
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));
    return result[0].count > 0;
  }

  async countByTenantId(tenantId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), isNull(users.deletedAt)));
    return result[0].count;
  }

  async countByTenantIdAndStatus(tenantId: string, status: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.status, status),
          isNull(users.deletedAt)
        )
      );
    return result[0].count;
  }

  async countByTenantIdAndRole(tenantId: string, role: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.role, role),
          isNull(users.deletedAt)
        )
      );
    return result[0].count;
  }
}
