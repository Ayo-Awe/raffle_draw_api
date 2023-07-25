import { Request, Response } from "express";
import {
  createRaffleDrawValidator,
  createTeamValidator,
  updateBankAccountValidator,
  updateTeamMemberValidator,
  updateTeamValidator,
  verifyTeamValidator,
} from "../validators/team.validator";
import {
  BadRequest,
  Conflict,
  Forbidden,
  ResourceNotFound,
  ServerError,
} from "../../../errors/httpErrors";
import paystackService from "../../../services/paystack.service";
import { withTransaction } from "../../../utils/repostioryHelpers";
import teamRepository from "../../../repositories/team.repository";
import raffleDrawRepository from "../../../repositories/raffleDraw.repository";

class TeamController {
  async createTeam(req: Request, res: Response) {
    const { id, email } = req.user!;

    const { data, error } = createTeamValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const team = await withTransaction(async (tx) => {
      const teamRepo = teamRepository.withTransaction(tx);

      // Create a new team and add user as admin
      const payload = { ...data, teamEmail: email, creatorId: id };
      const team = await teamRepo.create(payload);
      await teamRepo.createTeamMember({
        role: "admin",
        teamId: team.id,
        userId: id,
      });

      return team;
    });

    res.ok({ team });
  }

  async getTeamById(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const isTeamMember = await teamRepository.getTeamMemberById(teamId, id);

    if (!isTeamMember) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const team = await teamRepository.getById(teamId);

    res.ok({ team });
  }

  async verifyTeam(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const { data, error } = verifyTeamValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const team = await teamRepository.getById(teamId);
    const teamMember = await teamRepository.getTeamMemberById(teamId, id);

    if (!teamMember || !team) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (team.isVerified) {
      throw new Conflict(
        `The team you're trying to verify has already been verified.`,
        "TEAM_ALREADY_VERIFIED"
      );
    }

    if (teamMember.role !== "admin") {
      throw new Forbidden(
        `You don't have sufficient permission to access this resource`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    const bankInfo = await paystackService.resolveBank(
      data.accountNumber,
      data.bankCode
    );

    if (!bankInfo) {
      throw new BadRequest(
        "Account Verification failed, invalid bank code or account number",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const subaccount = await paystackService.createSubaccount({
      ...data,
      teamId,
    });

    if (!subaccount) {
      throw new ServerError(
        "An unexpected error occured.",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    await teamRepository.update(teamId, {
      subaccountCode: subaccount.subaccount_code,
      bankAccountNumber: data.accountNumber,
      bankCode: data.bankCode,
      isVerified: true,
    });

    res.noContent();
  }

  async updateTeamBankAccount(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const { data, error } = updateBankAccountValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const team = await teamRepository.getById(teamId);
    const teamMember = await teamRepository.getTeamMemberById(teamId, id);

    if (!teamMember || !team) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (teamMember.role !== "admin") {
      throw new Forbidden(
        `You don't have sufficient permission to access this resource`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    if (!team.isVerified) {
      throw new Forbidden(
        `Please verify your team before attempting to update your team bank account.`,
        "TEAM_NOT_VERIFIED"
      );
    }

    // No updates
    if (
      team.bankAccountNumber === data.accountNumber &&
      team.bankCode === data.bankCode
    ) {
      return res.noContent();
    }

    const bankInfo = await paystackService.resolveBank(
      data.accountNumber,
      data.bankCode
    );

    if (!bankInfo) {
      throw new BadRequest(
        "Account Verification failed, invalid bank code or account number",
        "INVALID_REQUEST_PARAMETERS"
      );
    }

    const subaccount = await paystackService.updateSubaccount(
      team.subaccountCode!,
      data
    );

    if (!subaccount) {
      throw new ServerError(
        "An unexpected error occured.",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    await teamRepository.update(teamId, {
      subaccountCode: subaccount.subaccount_code,
      bankAccountNumber: data.accountNumber,
      bankCode: data.bankCode,
    });

    res.noContent();
  }

  async getTeamMembers(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const members = await teamRepository.getTeamMembers(teamId);
    const isTeamMember = members.find((member) => member.id === id);

    if (!isTeamMember) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({ members });
  }

  async createRaffleDraw(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const { data, error } = createRaffleDrawValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const team = await teamRepository.getById(teamId);
    const teamMember = await teamRepository.getTeamMemberById(teamId, id);

    if (!teamMember || !team) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (teamMember.role !== "admin") {
      throw new Forbidden(
        `You don't have sufficient permission to access this resource`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    if (!team.isVerified) {
      throw new Forbidden(
        "You need to verify your team before trying to create a raffle draw",
        "TEAM_NOT_VERIFIED"
      );
    }

    const existingRaffleDraw = await raffleDrawRepository.getByIdOrSlug(
      data.slug
    );

    if (existingRaffleDraw) {
      throw new Conflict(
        `The slug '${data.slug}' is taken.`,
        "SLUG_UNAVAILABLE"
      );
    }

    const raffleDraw = await raffleDrawRepository.create({
      ...data,
      teamId: teamId,
      creatorId: id,
    });

    res.ok({ raffleDraw });
  }

  async getTeamRaffleDraws(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const isTeamMember = await teamRepository.getTeamMemberById(teamId, id);
    if (!isTeamMember) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const raffleDraws = await raffleDrawRepository.getByTeamId(teamId);

    res.ok({ raffleDraws });
  }

  async updateTeamMember(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);
    const memberId = parseInt(req.params.memberId);

    const { data, error } = updateTeamMemberValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const teamAdmin = await teamRepository.getTeamMemberById(teamId, id);
    if (!teamAdmin) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (teamAdmin.role !== "admin") {
      throw new Forbidden(
        `You don't have sufficient permission to access this resource`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    if (teamAdmin.id === memberId) {
      throw new Forbidden(
        `You are not allowed to modify your team membership.`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    const member = await teamRepository.updateTeamMemberById(
      teamId,
      memberId,
      data
    );

    if (!member) {
      throw new ResourceNotFound(
        `Team member with id '${memberId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({ member });
  }

  async removeTeamMember(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);
    const memberId = parseInt(req.params.memberId);

    const teamAdmin = await teamRepository.getTeamMemberById(teamId, id);
    if (!teamAdmin) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (teamAdmin.role !== "admin") {
      throw new Forbidden(
        `You don't have sufficient permission to access this resource`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    if (teamAdmin.id === memberId) {
      throw new Forbidden(
        `You are not allowed to modify your team membership.`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    const deletedMember = await teamRepository.deleteTeamMemberById(
      teamId,
      memberId
    );

    if (!deletedMember) {
      throw new ResourceNotFound(
        `Team member with id '${memberId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.noContent();
  }

  async updateTeam(req: Request, res: Response) {
    const { id } = req.user!;
    const teamId = parseInt(req.params.teamId);

    const { data, error } = updateTeamValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const teamAdmin = await teamRepository.getTeamMemberById(teamId, id);
    if (!teamAdmin) {
      throw new ResourceNotFound(
        `Team with id '${teamId}' not found`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (teamAdmin.role !== "admin") {
      throw new Forbidden(
        `You don't have sufficient permission to access this resource`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    const team = await teamRepository.update(teamId, data);

    res.ok({ team });
  }
}

export default new TeamController();
