import { ValidationOptions } from 'class-validator';
export declare function PasswordMatch(property: string, condition?: 'match' | 'notMatch', validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
