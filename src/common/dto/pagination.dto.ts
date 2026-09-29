import { z } from 'zod';

import { createZodDto } from '../validation/zod-dto';

/** Shared by every admin list endpoint — see `docs`'s "Admin console API" note in the README. */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export function paginate<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return { items, total, page, pageSize };
}
