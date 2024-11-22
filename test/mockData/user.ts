import { AddressType, User, UserStatus } from "@prisma/client";

export const fakeData: User = {
  id: 'user-id',
  firstname: 'John',
  lastname: 'Doe',
  username: 'johndoe',
  password:
    '$argon2id$v=19$m=65536,t=3,p=4$f+0kBa9fD6cExuwn/+Obug$C8I/ylTXWI7EzgrABXiVclIkJsbDu/jCEJ0LuwzqAzY',
  email: 'john.doe@example.com',
  phone: '1234567890',
  addressType: AddressType.HOME,
  longitude: '',
  latitude: '',
  emailVerified: false,
  location: 'Some Location',
  staffId: 'staff-id',
  roleId: 'role-id',
  status: UserStatus.active,
  isBlocked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  lastLogin: new Date(),
};
