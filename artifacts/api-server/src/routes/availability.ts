import { Router, type IRouter } from "express";
import { GetAvailabilityResponse } from "@workspace/api-zod";
import { getAvailability } from "../lib/availability";

const router: IRouter = Router();

router.get("/availability", (_req, res) => {
  res.json(GetAvailabilityResponse.parse({ days: getAvailability() }));
});

export default router;
