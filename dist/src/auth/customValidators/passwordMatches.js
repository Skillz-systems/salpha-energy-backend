"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordMatch = PasswordMatch;
const class_validator_1 = require("class-validator");
function PasswordMatch(property, condition = 'match', validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'PasswordMatch',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property, condition],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [relatedPropertyName, condition] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];
                    if (condition === 'match') {
                        return relatedValue === value;
                    }
                    else if (condition === 'notMatch') {
                        return relatedValue !== value;
                    }
                    return false;
                },
                defaultMessage(args) {
                    const [relatedPropertyName, condition] = args.constraints;
                    if (condition === 'match') {
                        return `The ${relatedPropertyName} and ${args.property} fields must match.`;
                    }
                    else if (condition === 'notMatch') {
                        return `The ${relatedPropertyName} and ${args.property} fields should not be the same.`;
                    }
                    return `Validation failed for ${args.property}.`;
                },
            },
        });
    };
}
//# sourceMappingURL=passwordMatches.js.map