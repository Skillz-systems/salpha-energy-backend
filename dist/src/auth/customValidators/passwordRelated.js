"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordRelated = PasswordRelated;
const lodash_1 = require("lodash");
const class_validator_1 = require("class-validator");
const string_similarity_1 = require("../../utils/string-similarity");
function PasswordRelated(properties, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'PasswordRelated',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, _args) {
                    const targetObj = _args.object;
                    if (!value) {
                        return true;
                    }
                    return properties.every((prop) => {
                        const propValue = targetObj[prop];
                        if (!propValue || typeof propValue !== 'string') {
                            return true;
                        }
                        const similarity = (0, string_similarity_1.compareTwoStrings)(propValue, value);
                        return similarity < 0.35;
                    });
                },
                defaultMessage(_args) {
                    const targetObj = _args.object;
                    const failedFields = properties
                        .filter((prop) => {
                        const propValue = targetObj[prop];
                        return (propValue &&
                            typeof propValue === 'string' &&
                            (0, string_similarity_1.compareTwoStrings)(propValue, _args.value) >= 0.35);
                    })
                        .map((prop) => (0, lodash_1.startCase)(prop));
                    return `{type: ['password', '${failedFields.join(', ')}'], error: 'Password must not be similar to your ${failedFields.join(', ')}'}`;
                },
            },
        });
    };
}
//# sourceMappingURL=passwordRelated.js.map