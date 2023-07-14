import { NextFunction, Request, Response } from "express";

import { HttpError } from "../../errors/httpErrors";

export function errorLogger(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpError === false) console.log(err);
  next(err);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isInvalidJSON =
    err instanceof SyntaxError &&
    "body" in err &&
    err.message.toLowerCase().includes("json");

  if (isInvalidJSON) {
    return res.error(400, err.message, "INVALID_JSON_FORMAT");
  }

  if (err instanceof HttpError) {
    return res.error(err.statusCode, err.message, err.errorCode);
  }

  res.error(500, "An unexpected error occured.", "UNEXPECTED_ERROR");
}
