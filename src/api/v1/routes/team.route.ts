import express from "express";

import controller from "../controllers/team.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const teamRouter = express.Router();

teamRouter.post("/", requireAuth, controller.createTeam);
teamRouter.get("/:teamId", requireAuth, controller.getTeamById);
teamRouter.patch("/:teamId", requireAuth, controller.updateTeam);
teamRouter.get("/:teamId/members", requireAuth, controller.getTeamMembers);
teamRouter.post("/:teamId/verify", requireAuth, controller.verifyTeam);
teamRouter.put(
  "/:teamId/bank-account",
  requireAuth,
  controller.updateTeamBankAccount
);
teamRouter.put(
  "/:teamId/members/:memberId",
  requireAuth,
  controller.updateTeamMember
);
teamRouter.delete(
  "/:teamId/members/:memberId",
  requireAuth,
  controller.removeTeamMember
);
teamRouter.get(
  "/:teamId/raffle-draws",
  requireAuth,
  controller.getTeamRaffleDraws
);
teamRouter.post(
  "/:teamId/raffle-draws",
  requireAuth,
  controller.createRaffleDraw
);

export default teamRouter;
