import { NextFunction, Request, RequestHandler, Response } from "express";

type ConditionalCallback = (req: Request) => boolean;

export function conditionalMiddleware(
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

export function paginate(
  cursor: any,
  perPage: any,
  maxPerPage: number = 100,
  defaultPerPage: number = 30
) {
  if (maxPerPage <= 0) {
    throw new Error("Max per page must be greater than 0");
  }

  if (defaultPerPage <= 0) {
    throw new Error("Default per page must be greater than 0");
  }

  let page = parseCursor(cursor) || 1;
  let parsedPerPage = Number(perPage);

  if (isNaN(parsedPerPage) || parsedPerPage <= 0) {
    parsedPerPage = defaultPerPage;
  }

  if (parsedPerPage > maxPerPage) {
    parsedPerPage = maxPerPage;
  }

  const offset = (page - 1) * parsedPerPage;
  const limit = parsedPerPage;

  return { offset, limit, page };
}

export function createCursor(page: number) {
  return btoa(`page:${page}`);
}

export function parseCursor(cursor: string) {
  const decoded = atob(cursor);

  const page = decoded.split(":")[1];

  if (isNaN(parseInt(page))) {
    return null;
  }

  return parseInt(page);
}
