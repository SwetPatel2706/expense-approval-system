export type AuthRole = "EMPLOYEE" | "MANAGER" | "ADMIN";

export type AuthContext = {
  userId: string;
  companyId: string;
  role: AuthRole;
};

declare global {
  namespace Express {
    interface Request {
      auth: AuthContext;
    }
  }
}

export {};
