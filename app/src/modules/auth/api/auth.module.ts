import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../../infrastructure/auth/jwt.strategy';
import { LoginAdminUseCase } from '../usecases/login-admin.use-case';
import { LogoutAdminUseCase } from '../usecases/logout-admin.use-case';
import { GetCurrentAdminUseCase } from '../usecases/get-current-admin.use-case';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'mpmedia-dev-secret-change-in-prod',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, LoginAdminUseCase, LogoutAdminUseCase, GetCurrentAdminUseCase],
  exports: [JwtModule],
})
export class AuthModule {}
