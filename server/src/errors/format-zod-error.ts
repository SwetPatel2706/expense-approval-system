// server/src/errors/format-zod-error.ts

import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
    // return error.errors.map((err) => ({
    return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}
