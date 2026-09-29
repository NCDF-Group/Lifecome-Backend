"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "auditEvents", {
    enumerable: true,
    get: function() {
        return auditEvents;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const auditEvents = (0, _pgcore.pgTable)('audit_events', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    actorType: (0, _pgcore.text)('actor_type').notNull(),
    actorId: (0, _pgcore.text)('actor_id').notNull(),
    action: (0, _enums.auditActionEnum)('action').notNull(),
    resourceType: (0, _pgcore.text)('resource_type').notNull(),
    resourceId: (0, _pgcore.text)('resource_id').notNull(),
    correlationId: (0, _pgcore.text)('correlation_id'),
    metadata: (0, _pgcore.jsonb)('metadata').$type().notNull().default({}),
    previousHash: (0, _pgcore.text)('previous_hash'),
    hash: (0, _pgcore.text)('hash').notNull(),
    occurredAt: (0, _pgcore.timestamp)('occurred_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=audit.schema.js.map