import { Router } from "express";
import { summarizeMeeting } from "../controllers/meeting.controller.js";

const router = Router();

router.route("/summarize").post(summarizeMeeting);

export default router;
