import { startCase } from 'lodash';
import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { compareTwoStrings } from '../../../utils/string-similarity';

export function PasswordRelated(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordRelated',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(
          value: any,
          _args: ValidationArguments,
        ): boolean | Promise<boolean> {
          if (_args.value) {
            const checkSimilarity = compareTwoStrings(
              (_args.object as any)[_args.constraints[0]],
              _args.value,
            );
            if (checkSimilarity >= 0.35) return false;
            return true;
          }
        },
        defaultMessage(_args: ValidationArguments) {
          const constraint = startCase(_args.constraints[0] ?? ``);
          return `{type: ['password', '${constraint}'], error: 'Password must not be similar to your ${constraint}'}`;
        },
      },
    });
  };
}
