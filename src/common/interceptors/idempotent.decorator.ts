import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'idempotent';

/**
 * Marks a handler as requiring an `Idempotency-Key` header. Apply to any endpoint with a
 * money-moving or booking side effect (payment intents, authorisation requests, appointment
 * confirmation, notification sends) — see blueprint §7.1 and §13.
 */
export const Idempotent = (): MethodDecorator => SetMetadata(IDEMPOTENT_KEY, true);
