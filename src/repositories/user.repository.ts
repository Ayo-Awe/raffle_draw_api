import { and, eq } from "drizzle-orm";
import { teamMembers, teams, users } from "../db/schema";
import { BaseRespository } from "./base.repository";

class UserRepository extends BaseRespository {
  async getById(userId: number) {
    return this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { clerkId: false },
    });
  }

  async getUserTeams(userId: number) {
    return this.db
      .select({
        id: teams.id,
        name: teams.name,
        role: teamMembers.role,
        bankAccountNumber: teams.bankAccountNumber,
        bankCode: teams.bankCode,
        teamEmail: teams.teamEmail,
        isVerified: teams.isVerified,
        createdAt: teams.createdAt,
        updatedAt: teams.createdAt,
        jointedAt: teamMembers.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .innerJoin(users, eq(teams.creatorId, users.id))
      .where(eq(teamMembers.userId, userId));
  }

  async getUserTeamById(userId: number, teamId: number) {
    const [result] = await this.db
      .select({
        id: teams.id,
        name: teams.name,
        role: teamMembers.role,
        bankAccountNumber: teams.bankAccountNumber,
        bankCode: teams.bankCode,
        teamEmail: teams.teamEmail,
        isVerified: teams.isVerified,
        createdAt: teams.createdAt,
        updatedAt: teams.createdAt,
        jointedAt: teamMembers.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .innerJoin(users, eq(teams.creatorId, users.id))
      .where(and(eq(teamMembers.userId, userId), eq(teams.id, teamId)));

    return result;
  }

  async getByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    // todo: exclude clerkID
  }

  async create() {}
}

export default new UserRepository();
