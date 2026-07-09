import { Router } from "express";
import { authRouter } from "./auth.routes";
import { livresRouter } from "./livres.routes";
import { bibliothequeRouter } from "./bibliotheque.routes";
import { avisRouter } from "./avis.routes";
import { statsRouter } from "./stats.routes";

export const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/auth", authRouter);
router.use("/livres", livresRouter);
router.use("/bibliotheque", bibliothequeRouter);
router.use("/bibliotheque", avisRouter);
router.use("/stats", statsRouter);