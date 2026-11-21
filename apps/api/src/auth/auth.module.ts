import { Body, Controller, HttpCode, Inject, Module, Post, UseGuards } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  type AuthResponse,
  LoginRequestSchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
} from '@lamim/sync-protocol';
import type { z } from 'zod';
import { AuthRateLimitGuard, EmailRateLimitGuard } from '../common/rate-limit';
import { ZodPipe } from '../common/zod.pipe';
import { APP_CONFIG, type AppConfig } from '../config';
import { AuthService } from './auth.service';
import { JWT_AUDIENCE, JWT_ISSUER, JwtAuthGuard } from './jwt.guard';

@Controller('auth')
@UseGuards(AuthRateLimitGuard)
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('register')
  @UseGuards(EmailRateLimitGuard)
  @HttpCode(201)
  register(
    @Body(new ZodPipe(RegisterRequestSchema)) body: z.infer<typeof RegisterRequestSchema>,
  ): Promise<AuthResponse> {
    return this.auth.register(body);
  }

  @Post('login')
  @UseGuards(EmailRateLimitGuard)
  @HttpCode(200)
  login(
    @Body(new ZodPipe(LoginRequestSchema)) body: z.infer<typeof LoginRequestSchema>,
  ): Promise<AuthResponse> {
    return this.auth.login(body);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(
    @Body(new ZodPipe(RefreshRequestSchema)) body: z.infer<typeof RefreshRequestSchema>,
  ): Promise<AuthResponse> {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Body(new ZodPipe(RefreshRequestSchema)) body: z.infer<typeof RefreshRequestSchema>,
  ): Promise<void> {
    await this.auth.logout(body.refreshToken);
  }
}

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.JWT_SECRET,
        signOptions: { algorithm: 'HS256', issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
        verifyOptions: { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
