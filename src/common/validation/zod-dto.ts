import { z } from 'zod';

/**
 * In-house replacement for `nestjs-zod`'s `createZodDto`: at the time this was written, the
 * published `nestjs-zod` (5.x) only supports NestJS 10/11, and this project is on NestJS 12.
 * Rather than pin the whole framework back for one small integration package, this reproduces
 * the handful of lines it actually needs — a DTO class carrying its own Zod schema, which
 * `ZodValidationPipe` (in this same directory) recognises and validates against.
 *
 * Also gives Swagger real per-field schemas without the `@nestjs/swagger` CLI plugin (which
 * doesn't work with this project's SWC builder): `_OPENAPI_METADATA_FACTORY` is the exact static
 * method name `@nestjs/swagger` looks for on a class at document-generation time (see
 * `ModelPropertiesAccessor.applyMetadataFactory` in its source) — normally emitted by that
 * plugin, written by hand here instead. Its body converts the same Zod schema already used for
 * runtime validation into an OpenAPI schema via Zod's own `z.toJSONSchema`, so the two can never
 * drift apart.
 */
export interface ZodDtoClass<T> {
  new (partial?: Partial<T>): T;
  isZodDto: true;
  schema: z.ZodType<T>;
}

/**
 * Converts an object schema's top-level fields into the `{ [property]: ApiPropertyOptions }`
 * shape `_OPENAPI_METADATA_FACTORY` must return. Non-object schemas (none exist among this
 * codebase's DTOs today) fall back to an empty map — Swagger then shows an opaque object for
 * that DTO instead of failing to build the document.
 */
function schemaToApiProperties(schema: z.ZodType): Record<string, Record<string, unknown>> {
  let jsonSchema: Record<string, unknown>;
  try {
    jsonSchema = z.toJSONSchema(schema, { target: 'openapi-3.0' });
  } catch {
    return {};
  }

  const properties = jsonSchema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return {};

  const required = new Set((jsonSchema.required as string[] | undefined) ?? []);

  return Object.fromEntries(
    Object.entries(properties).map(([key, propertySchema]) => [
      key,
      { ...propertySchema, required: required.has(key) },
    ]),
  );
}

export function createZodDto<T extends z.ZodType>(schema: T): ZodDtoClass<z.infer<T>> {
  class AugmentedZodDto {
    static readonly isZodDto = true as const;
    static readonly schema = schema;

    static _OPENAPI_METADATA_FACTORY(): Record<string, Record<string, unknown>> {
      return schemaToApiProperties(schema);
    }

    constructor(partial: Partial<z.infer<T>> = {}) {
      Object.assign(this, partial);
    }
  }

  return AugmentedZodDto as unknown as ZodDtoClass<z.infer<T>>;
}

export function isZodDto(metatype: unknown): metatype is ZodDtoClass<unknown> {
  return typeof metatype === 'function' && 'isZodDto' in metatype && metatype.isZodDto === true;
}
