import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  Reflect.metadata(PERMISSIONS_KEY, permissions);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => Reflect.metadata(ROLES_KEY, roles);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasPermission = required.some((p) => user?.permissions?.includes(p));
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    const hasRole = required.some((r) => user?.roles?.includes(r));
    if (!hasRole) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
