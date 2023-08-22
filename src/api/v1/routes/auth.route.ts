import express from "express";

import controller from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/login/mock", controller.mockLogin);

export default authRouter;
