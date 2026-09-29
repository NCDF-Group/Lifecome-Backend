"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get availabilitySlots () {
        return availabilitySlots;
    },
    get providerCredentials () {
        return providerCredentials;
    },
    get providers () {
        return providers;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const providers = (0, _pgcore.pgTable)('providers', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    displayName: (0, _pgcore.text)('display_name').notNull(),
    specialty: (0, _pgcore.text)('specialty').notNull(),
    languages: (0, _pgcore.text)('languages').array().notNull().default([]),
    consultationModes: (0, _enums.consultationModeEnum)('consultation_modes').array().notNull().default([
        'video'
    ]),
    networkStatus: (0, _pgcore.text)('network_status').notNull().default('active'),
    // Optional hub/clinic location — null for a video/audio-only provider with no physical base.
    city: (0, _pgcore.text)('city'),
    state: (0, _pgcore.text)('state'),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const providerCredentials = (0, _pgcore.pgTable)('provider_credentials', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    providerId: (0, _pgcore.uuid)('provider_id').notNull().references(()=>providers.id, {
        onDelete: 'cascade'
    }),
    credentialType: (0, _pgcore.text)('credential_type').notNull(),
    licenceNumber: (0, _pgcore.text)('licence_number').notNull(),
    issuingBody: (0, _pgcore.text)('issuing_body').notNull(),
    verifiedAt: (0, _pgcore.timestamp)('verified_at', {
        withTimezone: true
    }),
    expiresAt: (0, _pgcore.timestamp)('expires_at', {
        withTimezone: true
    })
});
const availabilitySlots = (0, _pgcore.pgTable)('availability_slots', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    providerId: (0, _pgcore.uuid)('provider_id').notNull().references(()=>providers.id, {
        onDelete: 'cascade'
    }),
    startsAt: (0, _pgcore.timestamp)('starts_at', {
        withTimezone: true
    }).notNull(),
    durationMinutes: (0, _pgcore.integer)('duration_minutes').notNull().default(30),
    isBooked: (0, _pgcore.boolean)('is_booked').notNull().default(false),
    heldUntil: (0, _pgcore.timestamp)('held_until', {
        withTimezone: true
    })
});

//# sourceMappingURL=provider.schema.js.map