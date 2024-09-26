export const MESSAGES = {
  // Success Messages
  CREATED: 'The Record has been created successfully',
  UPDATED: 'The Record has been updated successfully',
  DELETED: 'The Record has been deleted successfully',
  PWD_RESET_SUCCESS: 'Password Successfully updated',
  PWD_RESET_MAIL_SENT: 'A password reset link has been sent to your mail',
  TOKEN_VALID: 'Token is valid',

  // Error Messages
  EMAIL_EXISTS: 'Email already exists',
  USERNAME_IN_USE: 'Username already in use',
  USERNAME_INVALID: 'Invalid username',
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  NOT_PERMITTED:
    "You don't have sufficient permissions to perform the necessary action",
  ROLE_NOT_FOUND: 'Role not found',
  ROLES_METADATA_INVALID: 'Roles metadata is invalid or missing',
  PERMISSIONS_METADATA_INVALID: 'Permissions metadata is invalid or missing',

  /**
   *
   * @param field
   * @returns `Invalid ${field}`
   */
  customInvalidMsg(field: string) {
    return `Invalid ${field}`;
  },
};
