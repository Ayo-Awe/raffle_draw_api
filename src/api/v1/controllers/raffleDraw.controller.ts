import { Request, Response } from "express";
import {
  BadRequest,
  Forbidden,
  ResourceNotFound,
  ServerError,
} from "../../../errors/httpErrors";
import raffleDrawRepository from "../../../repositories/raffleDraw.repository";
import { tryParseInt } from "../../../utils/commonHelpers";
import teamRepository from "../../../repositories/team.repository";
import paystackService, {
  InitiatePaymentOptions,
} from "../../../services/paystack.service";
import { purchaseTicketValidator } from "../validators/raffleDraw.validator";
import { createCursor, paginate } from "../../../utils/expressHelpers";
import contestantRepository from "../../../repositories/contestant.repository";
import ticketRepository from "../../../repositories/ticket.repository";
import transactionRepository from "../../../repositories/transaction.repository";
import * as json2csv from "json2csv";

class RaffleDrawController {
  async getRaffleDraw(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw with id or slug '${idOrSlug}' not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({ raffleDraw });
  }

  async initiateTicketPurchase(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);

    const { data, error } = purchaseTicketValidator(req.body);

    if (error) {
      throw new BadRequest(error.message, error.code);
    }

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw with id or slug '${idOrSlug}' not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    if (raffleDraw.closedAt) {
      throw new Forbidden(
        "Raffle draw is closed for ticket purchases.",
        "RAFFLE_DRAW_CLOSED"
      );
    }

    const team = await teamRepository.getById(raffleDraw.teamId)!;

    if (!team) {
      // todo Replace this with proper error logging
      console.log(
        `Team '${raffleDraw.teamId}' not found when querying raffle draw ${raffleDraw.id}.`
      );
      throw new ServerError("An unexpected error occured.", "UNEXPECTED_ERROR");
    }

    const payload: InitiatePaymentOptions = {
      amount: raffleDraw.ticketUnitPrice,
      email: data.email,
      metadata: {
        firstName: data.firstName,
        lastName: data.lastName,
        raffleDrawId: raffleDraw.id,
        quantity: data.quantity,
      },
      subaccount: team.subaccountCode!,
    };

    const paymentLink = await paystackService.initiateTicketPayment(payload);

    if (!paymentLink) {
      throw new ServerError(
        "A error occured while trying to retrieve a payment link from a third-party provider.",
        "THIRD_PARTY_API_FAILURE"
      );
    }

    res.ok({ paymentLink });
  }

  async checkSlugAvailability(req: Request, res: Response) {
    const { slug } = req.params;

    const raffleDraw = await raffleDrawRepository.getBySlug(slug);

    // Slug is not available
    if (raffleDraw) {
      throw new ResourceNotFound(
        `Slug: ${slug} not available.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({ message: `Slug: ${slug} is available.` });
  }

  async getContestants(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);
    const { id } = req.user!;
    const { cursor, perPage } = req.query;

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const teamMember = await teamRepository.getTeamMemberById(
      raffleDraw.teamId,
      id
    );

    if (!teamMember) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const { page, offset, limit } = paginate(cursor, perPage);
    const results = await contestantRepository.getByRaffleDraw(
      raffleDraw.id,
      offset,
      limit + 1
    );

    const contestants = results.slice(0, limit);
    const previous = page === 1 ? null : createCursor(page - 1);
    const next = results.length === limit + 1 ? createCursor(page + 1) : null;

    res.ok({ contestants }, { perPage: limit, previous, next });
  }

  async getTickets(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);
    const { id } = req.user!;
    const { cursor, perPage } = req.query;

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const teamMember = await teamRepository.getTeamMemberById(
      raffleDraw.teamId,
      id
    );

    if (!teamMember) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const { page, offset, limit } = paginate(cursor, perPage);
    const results = await ticketRepository.getByRaffleDraw(
      raffleDraw.id,
      offset,
      limit + 1 // extra records helps to calculate next page
    );

    const tickets = results.slice(0, limit);
    const previous = page === 1 ? null : createCursor(page - 1);
    const next = results.length === limit + 1 ? createCursor(page + 1) : null;

    res.ok({ tickets }, { perPage: limit, previous, next });
  }

  async getTransactions(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);
    const { id } = req.user!;
    const { cursor, perPage } = req.query;

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const teamMember = await teamRepository.getTeamMemberById(
      raffleDraw.teamId,
      id
    );

    if (!teamMember) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const { page, offset, limit } = paginate(cursor, perPage);
    const results = await transactionRepository.getByRaffleDraw(
      raffleDraw.id,
      offset,
      limit + 1 // extra records helps to calculate next page
    );

    const transactions = results.slice(0, limit);
    const previous = page === 1 ? null : createCursor(page - 1);
    const next = results.length === limit + 1 ? createCursor(page + 1) : null;

    res.ok({ transactions }, { perPage: limit, previous, next });
  }

  async exportContestants(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);
    const { id } = req.user!;

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const teamMember = await teamRepository.getTeamMemberById(
      raffleDraw.teamId,
      id
    );

    if (!teamMember) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const contestants = await contestantRepository.getByRaffleDraw(id);
    const csv = json2csv.parse(contestants, { header: true });
    res.attachment("contestants.csv");
    res.send(csv);
  }

  async exportTickets(req: Request, res: Response) {
    const idOrSlug = tryParseInt(req.params.idOrSlug);
    const { id } = req.user!;

    const raffleDraw = await raffleDrawRepository.getByIdOrSlug(idOrSlug);

    if (!raffleDraw) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const teamMember = await teamRepository.getTeamMemberById(
      raffleDraw.teamId,
      id
    );

    if (!teamMember) {
      throw new ResourceNotFound(
        `Raffle draw ${idOrSlug} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    const tickets = await ticketRepository.getByRaffleDraw(raffleDraw.id);
    const csv = json2csv.parse(tickets, { header: true });
    res.attachment("tickets.csv");
    res.send(csv);
  }

  async exportTransactions(req: Request, res: Response) {}
}

export default new RaffleDrawController();
