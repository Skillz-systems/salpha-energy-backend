import * as argon from 'argon2';

export async function hashPassword(passwordString: string) {
  return await argon.hash(passwordString);
}
