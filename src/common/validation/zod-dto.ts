import type { z } from 'zod';

/**
 * In-house replacement for `nestjs-zod`'s `createZodDto`: at the time this was written, the
 * published `nestjs-zod` (5.x) only supports NestJS 10/11, and this project is on NestJS 12.
 * Rather than pin the whole framework back for one small integration package, this reproduces
 * the handful of lines it actually needs — a DTO class carrying its own Zod schema, which
 * `ZodValidationPipe` (in this same directory) recognises and validates against.
 *
 * Trade-off: unlike `nestjs-zod`, this does **not** patch `@nestjs/swagger` to render real
 * per-field schemas for these DTOs — Swagger will show them as opaque objects until that is
 * added back (see the backend README's "What is intentionally not here yet" section).
 */
export interface ZodDtoClass<T> {
  new (partial?: Partial<T>): T;
  isZodDto: true;
  schema: z.ZodType<T>;
}

export function createZodDto<T extends z.ZodType>(schema: T): ZodDtoClass<z.infer<T>> {
  class AugmentedZodDto {
    static readonly isZodDto = true as const;
    static readonly schema = schema;

    constructor(partial: Partial<z.infer<T>> = {}) {
      Object.assign(this, partial);
    }
  }

  return AugmentedZodDto as unknown as ZodDtoClass<z.infer<T>>;
}

export function isZodDto(metatype: unknown): metatype is ZodDtoClass<unknown> {
  return typeof metatype === 'function' && 'isZodDto' in metatype && metatype.isZodDto === true;
}
