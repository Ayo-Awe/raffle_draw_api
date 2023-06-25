import { NextFunction, Request, Response } from "express";

import { HttpErrorCode } from "../../errors/httpErrors";

export default function (req: Request, res: Response, next: NextFunction) {
  // attach custom response functions
  res.ok = (payload: any, meta?: any) => customOkHelper(payload, res, meta);
  res.created = (payload: any) => customCreatedHelper(payload, res);
  res.noContent = () => customNoContentHelper(res);
  res.error = (statusCode: number, message: string, errorCode: HttpErrorCode) =>
    customErrorHelper(res, statusCode, message, errorCode);

  next();
}

function customOkHelper(payload: any, res: Response, meta?: any) {
  return res.status(200).json({ status: "success", data: payload, meta });
}

function customCreatedHelper(payload: any, res: Response) {
  return res.status(201).json({ data: payload, status: "success" });
}

function customNoContentHelper(res: Response) {
  return res.sendStatus(204);
}

function customErrorHelper(
  res: Response,
  statusCode: number,
  message: string,
  errorCode: string
) {
  return res
    .status(statusCode)
    .json({ code: errorCode, message, status: "error" });
}
