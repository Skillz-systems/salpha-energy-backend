export const MESSAGES = {
  // Success Messages
  CREATED: 'The Record has been created successfully',
  UPDATED: 'The Record has been updated successfully',
  DELETED: 'The Record has been deleted successfully',

  // Error Messages
  EMAIL_EXISTS: 'Email already exists',
  USERNAME_IN_USE: 'Username already in use',
  USERNAME_INVALID: 'Invalid username',
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  USER_NOT_FOUND: 'User not found',

  /**
   *
   * @param field
   * @returns `Invalid ${field}`
   */
  customInvalidMsg(field: string) {
    return `Invalid ${field}`;
  },
};
