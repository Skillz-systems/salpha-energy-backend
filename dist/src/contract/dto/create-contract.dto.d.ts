import { IDType } from '@prisma/client';
export declare class IdentificationDto {
    idType: IDType;
    idNumber: string;
    issuingCountry: string;
    issueDate?: string;
    expirationDate?: string;
    fullNameAsOnID: string;
    addressAsOnID?: string;
}
export declare class NextOfKinDto {
    fullName: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    homeAddress: string;
    dateOfBirth?: string;
    nationality?: string;
}
export declare class GuarantorDto {
    fullName: string;
    phoneNumber: string;
    email?: string;
    homeAddress: string;
    identificationDetails?: IdentificationDto;
    dateOfBirth?: string;
    nationality?: string;
}
