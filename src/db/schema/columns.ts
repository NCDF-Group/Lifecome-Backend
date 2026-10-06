import { customType } from 'drizzle-orm/pg-core';

/** Postgres `bytea` as a Node `Buffer` - used for small images stored in the database. */
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});
