import { Request, Response } from "express";
import userRepository from "../../../repositories/user.repository";
import { BadRequest } from "../../../errors/httpErrors";
import * as jwt from "jsonwebtoken";

class AuthController {
  async mockLogin(req: Request, res: Response) {
    if (!req.body.email || typeof req.body.email !== "string") {
      throw new BadRequest("Missing Email", "MISSING_REQUIRED_FIELD");
    }

    const user = await userRepository.getByEmail(req.body.email);

    if (!user) {
      throw new BadRequest(
        "User with email not found",
        "MISSING_REQUIRED_FIELD"
      );
    }

    const token = jwt.sign(
      {
        clerkUserId: user.clerkId,
      },
      process.env.CLERK_PEM_PUBLIC_KEY
    );

    res.ok({ token });
  }
}

export default new AuthController();
