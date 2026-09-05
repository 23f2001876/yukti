import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", verifyUser, CustomerController.getCustomers);
router.post("/guest", CustomerController.createGuestSession);
router.get("/:id", CustomerController.getCustomerById);
router.get("/:id/orders", CustomerController.getCustomerOrders);
router.delete("/:id", verifyUser, CustomerController.deleteCustomer);

export default router;
