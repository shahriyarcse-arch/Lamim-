import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AppRequest } from '../common/http';

export const JWT_ISSUER = 'lamim-api';
export const JWT_AUDIENCE = 'lamim-app';

interface AccessClaims {
  sub?: unknown;
  typ?: unknown;
}

/** Bearer access-token guard. Sets `req.userId` on success; 401 on anything else. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AppRequest>();
    const header = req.header('authorization') ?? '';
    const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(header);
    if (!match?.[1]) throw new UnauthorizedException('Missing or malformed access token');
    let claims: AccessClaims;
    try {
      claims = await this.jwt.verifyAsync<AccessClaims & object>(match[1], {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    if (typeof claims.sub !== 'string' || claims.typ !== 'access') {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    req.userId = claims.sub;
    return true;
  }
}
