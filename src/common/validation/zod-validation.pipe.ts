import { Injectable, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';

import { isZodDto } from './zod-dto';
import { ZodValidationException } from './zod-validation.exception';

/**
 * Registered globally (see app.module.ts). Only acts on parameters typed with a
 * `createZodDto(...)` class — plain types (`string`, `number`, hand-written classes) pass
 * through untouched, so this coexists with Nest's built-in pipes (`ParseUUIDPipe` etc.).
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const { metatype } = metadata;
    if (!isZodDto(metatype)) {
      return value;
    }

    const result = metatype.schema.safeParse(value);
    if (!result.success) {
      throw new ZodValidationException(result.error);
    }
    return result.data;
  }
}
