import { Request, Response } from "express";

export function welcomeHandler(req: Request, res: Response) {
  const payload = {
    message: "Welcome to memoreel API",
  };

  res.ok(payload);
}
