import { NextFunction, Request, Response } from "express";
import { Unauthorized } from "../../../errors/httpErrors";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import * as dotenv from "dotenv";
import db from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
dotenv.config();

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(
        new Unauthorized("Missing Auth header", "MISSING_AUTH_HEADER")
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(new Unauthorized("Malformed token", "MALFORMED_TOKEN"));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      uid: number;
    };

    const user = await db.query.users.findFirst({
      columns: { id: true, email: true },
      where: eq(users.id, payload.uid),
    });

    if (!user) {
      return next(
        new Unauthorized(
          "User with this token no longer exists",
          "INVALID_TOKEN"
        )
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      next(new Unauthorized("Token expired", "EXPIRED_TOKEN"));
    } else if (error instanceof JsonWebTokenError) {
      next(new Unauthorized("Token invalid", "INVALID_TOKEN"));
    } else {
      next(error);
    }
  }
}
