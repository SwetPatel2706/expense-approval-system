// server/src/middlewares/validate.ts

import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    schema.parse(req.body); // throws ZodError
    next();
  };
