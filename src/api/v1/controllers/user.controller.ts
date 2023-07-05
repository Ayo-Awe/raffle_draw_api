import { Request, Response } from "express";
import userRepository from "../../../repositories/user.repository";

class UserController {
  async getLoggedInUser(req: Request, res: Response) {
    const { id } = req.user!;

    const user = await userRepository.getById(id);

    res.ok({ user });
  }

  async getUserTeams(req: Request, res: Response) {
    const { id } = req.user!;

    const teams = await userRepository.getUserTeams(id);

    res.ok({ teams });
  }
}

export default new UserController();
