/**
 * The one contract every payer integrates through (blueprint §9.1). A payer is a registry row
 * plus one of these adapters — never a code branch. Adding an HMO means writing config and, if
 * needed, a new adapter implementation; it never means adding an `if (payer.code === '...')`
 * inside a domain service.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

//# sourceMappingURL=payer-adapter.interface.js.map