import { Response } from "express";

import { HttpErrorCode } from "../errors/httpErrors";

declare global {
  namespace Express {
    export interface Response {
      ok(payload: any, meta?: any): Response;
      created(payload: any): Response;
      noContent(): Response;
      error(
        statusCode: number,
        message: string,
        errorCode: HttpErrorCode
      ): Response;
    }
    export interface Request {
      user?: { id: number; email: string };
    }
  }
}
