import { ActionEnum, SubjectEnum } from '@prisma/client';
export declare class PermissionEntity {
    id: string;
    action: ActionEnum;
    subject: SubjectEnum;
    roleIds: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
