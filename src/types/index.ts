import { z } from "zod";

import { HttpErrorCode } from "../errors/httpErrors";
import { envSchema } from "../env";

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

  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
