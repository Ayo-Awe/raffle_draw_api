import { InferModel, and, eq } from "drizzle-orm";
import { teamMembers, teams, users } from "../db/schema";
import { BaseRespository } from "./base.repository";

type NewTeamMember = InferModel<typeof teamMembers, "insert">;
type NewTeam = InferModel<typeof teams, "insert">;
type Team = InferModel<typeof teams, "select">;
type UpdateTeam = Partial<Omit<Team, "id" | "creatorId">>;

const selectedTeamColumns = {
  id: teams.id,
  name: teams.name,
  bankAccountNumber: teams.bankAccountNumber,
  bankCode: teams.bankCode,
  teamEmail: teams.teamEmail,
  isVerified: teams.isVerified,
  creatorId: teams.creatorId,
  createdAt: teams.createdAt,
  updatedAt: teams.createdAt,
};

class TeamRepository extends BaseRespository {
  async getById(teamId: number) {
    return this.db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });
  }

  async create(newTeam: NewTeam) {
    const [team] = await this.db
      .insert(teams)
      .values(newTeam)
      .returning(selectedTeamColumns);

    return team;
  }

  async createTeamMember(newTeamMember: NewTeamMember) {
    const [member] = await this.db
      .insert(teamMembers)
      .values(newTeamMember)
      .returning();

    return member;
  }

  async update(teamId: number, data: UpdateTeam) {
    const [team] = await this.db
      .update(teams)
      .set(data)
      .where(eq(teams.id, teamId))
      .returning(selectedTeamColumns);

    return team;
  }

  async getTeamMemberById(teamId: number, userId: number) {
    const [member] = await this.db
      .select({
        id: teamMembers.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: teamMembers.role,
        joined_at: teamMembers.createdAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(
        and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId))
      );

    return member;
  }
}

export default new TeamRepository();
