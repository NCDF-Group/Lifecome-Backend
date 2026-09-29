"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./enums"), exports);
_export_star(require("./identity.schema"), exports);
_export_star(require("./patient.schema"), exports);
_export_star(require("./payer.schema"), exports);
_export_star(require("./catalogue.schema"), exports);
_export_star(require("./provider.schema"), exports);
_export_star(require("./eligibility.schema"), exports);
_export_star(require("./booking.schema"), exports);
_export_star(require("./payment.schema"), exports);
_export_star(require("./consultation.schema"), exports);
_export_star(require("./clinical.schema"), exports);
_export_star(require("./care-coordination.schema"), exports);
_export_star(require("./messaging.schema"), exports);
_export_star(require("./consent.schema"), exports);
_export_star(require("./audit.schema"), exports);
_export_star(require("./staff.schema"), exports);
_export_star(require("./notification.schema"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.js.map