import { Request, Response } from "express";
import db from "../../../db";
import { eq } from "drizzle-orm";
import { teamMembers, teams, users } from "../../../db/schema";

class UserController {
  async getLoggedInUser(req: Request, res: Response) {
    const { id } = req.user!;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { clerkId: false },
    });

    res.ok({ user });
  }

  async getUserTeams(req: Request, res: Response) {
    const { id } = req.user!;

    const userTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, id));

    res.ok({ teams: userTeams });
  }
}

export default new UserController();
