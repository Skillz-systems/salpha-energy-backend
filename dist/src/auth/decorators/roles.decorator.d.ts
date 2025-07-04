export declare const ROLES_KEY = "roles";
export declare const PERMISSIONS_KEY = "permissions";
export interface RolesArgs {
    roles?: string[];
    permissions: string[];
}
export declare const RolesAndPermissions: (rolesArgs: RolesArgs) => import("@nestjs/common").CustomDecorator<string>;
