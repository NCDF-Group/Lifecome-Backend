import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { providers } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import type { CreateProviderDto, ListProvidersAdminQueryDto, ProviderNetworkStatusSchema } from './dto/provider.dto';
import type { z } from 'zod';

export type Provider = typeof providers.$inferSelect;
type ProviderNetworkStatus = z.infer<typeof ProviderNetworkStatusSchema>;

@Injectable()
export class ProviderDirectoryService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(filters: { specialty?: string }): Promise<Provider[]> {
    const conditions = [eq(providers.networkStatus, 'active')];
    if (filters.specialty) conditions.push(eq(providers.specialty, filters.specialty));
    return this.db
      .select()
      .from(providers)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);
  }

  async getById(id: string): Promise<Provider> {
    const [provider] = await this.db.select().from(providers).where(eq(providers.id, id));
    if (!provider) throw new NotFoundAppException('Provider');
    return provider;
  }

  async create(input: CreateProviderDto): Promise<Provider> {
    const [created] = await this.db.insert(providers).values(input).returning();
    return created;
  }

  /** `/admin/providers` — unlike `list()`, includes suspended/pending-review providers. */
  async adminList(query: ListProvidersAdminQueryDto): Promise<PaginatedResult<Provider>> {
    const conditions = [];
    if (query.networkStatus) conditions.push(eq(providers.networkStatus, query.networkStatus));
    if (query.specialty) conditions.push(eq(providers.specialty, query.specialty));
    if (query.search) conditions.push(ilike(providers.displayName, `%${query.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(providers).where(where);
    const items = await this.db
      .select()
      .from(providers)
      .where(where)
      .orderBy(desc(providers.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  async setNetworkStatus(id: string, networkStatus: ProviderNetworkStatus): Promise<Provider> {
    await this.getById(id); // 404s early if missing
    const [updated] = await this.db.update(providers).set({ networkStatus }).where(eq(providers.id, id)).returning();
    return updated;
  }
}
