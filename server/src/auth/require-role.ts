import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import type { AuthRole } from "../auth.types.js";

export function requireRole(role: AuthRole) {
  return function requireRoleMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    if (req.auth.role !== role) {
      throw new AppError(
        "Forbidden",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODE.AUTH_FORBIDDEN
      );
    }

    next();
  };
}

export function requireAnyRole(roles: readonly AuthRole[]) {
  return function requireAnyRoleMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    if (!roles.includes(req.auth.role)) {
      throw new AppError(
        "Forbidden",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODE.AUTH_FORBIDDEN
      );
    }

    next();
  };
}
