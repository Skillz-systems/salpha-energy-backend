import { startCase } from 'lodash';
import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { compareTwoStrings } from 'src/utils/string-similarity';

/**
 * The PasswordRelated decorator ensures that a
 * user's password is not too similar to other
 * properties, such as their email, first name,
 * last name, etc.:
 * @param properties  An array of property names that will be compared against the password.
 * @param validationOptions  Optional validation options provided by class-validator to customize validation behavior (e.g., custom error messages).
 * @returns
 */

export function PasswordRelated(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordRelated',
      target: object.constructor,
      propertyName: propertyName,
      // constraints: [properties],
      options: validationOptions,
      validator: {
        validate(
          value: any,
          _args: ValidationArguments,
        ): boolean | Promise<boolean> {
          const targetObj = _args.object as any;
          if (value) {
            return properties.every((prop) => {
              const similarity = compareTwoStrings(targetObj[prop], value);
              return similarity < 0.35;
            });
          }
          return true;
        },
        defaultMessage(_args: ValidationArguments) {
          const targetObj = _args.object as any;
          const failedFields = properties
            .filter(
              (prop) => compareTwoStrings(targetObj[prop], _args.value) >= 0.35,
            )
            .map((prop) => startCase(prop));
          return `{type: ['password', '${failedFields.join(', ')}'], error: 'Password must not be similar to your ${failedFields.join(', ')}'}`;
        },
      },
    });
  };
}
