import express from "express";

import controller from "../controllers/raffleDraw.controller";
import { requireAuth } from "../../middlewares/authMiddleware";

const raffleDrawRouter = express.Router();

raffleDrawRouter.get("/:idOrSlug", controller.getRaffleDraw);
raffleDrawRouter.post("/:idOrSlug/payments", controller.initiateTicketPurchase);
raffleDrawRouter.get(
  "/:slug/availability",
  requireAuth,
  controller.checkSlugAvailability
);
raffleDrawRouter.get(
  "/:idOrSlug/contestants",
  requireAuth,
  controller.getContestants
);
raffleDrawRouter.get(
  "/:idOrSlug/contestants.csv",
  requireAuth,
  controller.exportContestants
);
raffleDrawRouter.get(
  "/:idOrSlug/transactions",
  requireAuth,
  controller.getTransactions
);
raffleDrawRouter.get("/:idOrSlug/tickets", requireAuth, controller.getTickets);

export default raffleDrawRouter;
