import { Router } from "express";
import userRoutes from "./userRoutes";
import restaurantRoutes from "./restaurantRoutes";
import customerRoutes from "./customerRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

router.use("/users", userRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/customers", customerRoutes);

export default router;
