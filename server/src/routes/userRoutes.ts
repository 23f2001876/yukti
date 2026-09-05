import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { verifyUser, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/me", verifyUser, UserController.getMe);
router.put("/me", verifyUser, UserController.updateMe);
router.get("/", verifyAdmin, UserController.getUsers);

export default router;
