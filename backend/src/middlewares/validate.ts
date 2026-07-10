import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HttpError } from "./errorHandler";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(", ");
      return next(new HttpError(400, message));
    }
    req.body = result.data;
    next();
  };
}