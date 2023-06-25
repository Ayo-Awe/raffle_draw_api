import { NextFunction, Request, RequestHandler, Response } from "express";

type ConditionalCallback = (req: Request) => boolean;

export function useConditionalMiddleware(
  middleware: RequestHandler,
  callback: ConditionalCallback
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const applyMiddleware = callback(req);
    if (applyMiddleware) {
      return middleware(req, res, next);
    }

    return next();
  };
}
