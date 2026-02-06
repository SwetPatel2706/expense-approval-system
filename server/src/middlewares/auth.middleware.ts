import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import { ERROR_CODE } from "../errors/error-codes.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import type { AuthRole } from "../auth.types.js";

const ALLOWED_ROLES: ReadonlySet<AuthRole> = new Set([
  "EMPLOYEE",
  "MANAGER",
  "ADMIN",
]);

function parseRole(raw: string | undefined): AuthRole {
  const role = (raw ?? "EMPLOYEE").trim().toUpperCase() as AuthRole;
  if (!ALLOWED_ROLES.has(role)) {
    throw new AppError(
      "Invalid auth role",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.AUTH_INVALID_TOKEN
    );
  }
  return role;
}

/**
 * Temporary deterministic auth middleware (no JWT, no DB calls).
 *
 * Contract:
 * - Requires `x-user-id` header (non-empty)
 * - Optional `x-user-role` header, defaults to EMPLOYEE
 * - Optional `x-company-id` header, defaults to a fixed company id
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header("x-user-id")?.trim();
  const roleHeader = req.header("x-user-role");
  const companyIdHeader = req.header("x-company-id")?.trim();

  if (!userId) {
    throw new AppError(
      "Missing authentication",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.AUTH_INVALID_TOKEN
    );
  }

  req.auth = {
    userId,
    companyId: companyIdHeader || "company-0001",
    role: parseRole(roleHeader),
  };

  next();
}

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

export function requireAnyRole(roles: AuthRole[]) {
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

