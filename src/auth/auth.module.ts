import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '../mailer/email.module';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET_KEY'),
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, ConfigService],
})
export class AuthModule {}
