import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '../mailer/email.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // 15 minutes
        limit: 6,
        blockDuration: 120000, // 2 mins
      },
    ]),
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
  providers: [
    AuthService,
    PrismaService,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {}
