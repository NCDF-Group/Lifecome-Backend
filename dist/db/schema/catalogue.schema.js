"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "clinicalServices", {
    enumerable: true,
    get: function() {
        return clinicalServices;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const clinicalServices = (0, _pgcore.pgTable)('clinical_services', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    code: (0, _pgcore.text)('code').notNull().unique(),
    name: (0, _pgcore.text)('name').notNull(),
    description: (0, _pgcore.text)('description'),
    defaultDurationMinutes: (0, _pgcore.integer)('default_duration_minutes').notNull().default(30),
    basePriceKobo: (0, _pgcore.integer)('base_price_kobo').notNull(),
    isActive: (0, _pgcore.boolean)('is_active').notNull().default(true),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=catalogue.schema.js.map