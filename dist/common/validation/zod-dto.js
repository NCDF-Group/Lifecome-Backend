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
    get createZodDto () {
        return createZodDto;
    },
    get isZodDto () {
        return isZodDto;
    }
});
const _zod = require("zod");
/**
 * Converts an object schema's top-level fields into the `{ [property]: ApiPropertyOptions }`
 * shape `_OPENAPI_METADATA_FACTORY` must return. Non-object schemas (none exist among this
 * codebase's DTOs today) fall back to an empty map — Swagger then shows an opaque object for
 * that DTO instead of failing to build the document.
 */ function schemaToApiProperties(schema) {
    let jsonSchema;
    try {
        jsonSchema = _zod.z.toJSONSchema(schema, {
            target: 'openapi-3.0'
        });
    } catch  {
        return {};
    }
    const properties = jsonSchema.properties;
    if (!properties) return {};
    const required = new Set(jsonSchema.required ?? []);
    return Object.fromEntries(Object.entries(properties).map(([key, propertySchema])=>[
            key,
            {
                ...propertySchema,
                required: required.has(key)
            }
        ]));
}
function createZodDto(schema) {
    let AugmentedZodDto = class AugmentedZodDto {
        static _OPENAPI_METADATA_FACTORY() {
            return schemaToApiProperties(schema);
        }
        constructor(partial = {}){
            Object.assign(this, partial);
        }
    };
    AugmentedZodDto.isZodDto = true;
    AugmentedZodDto.schema = schema;
    return AugmentedZodDto;
}
function isZodDto(metatype) {
    return typeof metatype === 'function' && 'isZodDto' in metatype && metatype.isZodDto === true;
}

//# sourceMappingURL=zod-dto.js.map