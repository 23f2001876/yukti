import { Router } from "express";
import userRoutes from "./userRoutes";
import restaurantRoutes from "./restaurantRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

router.use("/users", userRoutes);
router.use("/restaurants", restaurantRoutes);

export default router;
