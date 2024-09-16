import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function PasswordMatches(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordMatches',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(
          value: any,
          _args: ValidationArguments,
        ): boolean | Promise<boolean> {
          return (_args.object as any)[_args.constraints[0]] === value;
        },
        defaultMessage(args: ValidationArguments) {
          return `{type: ['password'], error: 'Both passwords don't match'}`;
        },
      },
    });
  };
}
