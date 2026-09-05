import { Router } from "express";
import { RestaurantController } from "../controllers/restaurant.controller";
import { MenuItemController } from "../controllers/menuItem.controller";
import { CategoryController } from "../controllers/category.controller";
import { OrderController } from "../controllers/order.controller";
import { BillController } from "../controllers/bill.controller";
import { StaffMemberController } from "../controllers/staffMember.controller";
import { AnalyticsController } from "../controllers/analytics.controller";
import { verifyUser, verifyStaff, verifyOwner, verifyAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", RestaurantController.getRestaurants);
router.get("/:id", RestaurantController.getRestaurantById);
router.post("/", verifyUser, RestaurantController.createRestaurant);
router.put("/:id", verifyOwner, RestaurantController.updateRestaurant);
router.delete("/:id", verifyOwner, RestaurantController.deleteRestaurant);
router.patch("/:id/ban", verifyAdmin, RestaurantController.toggleBan);
router.get("/:id/analytics", verifyStaff, AnalyticsController.getRestaurantAnalytics);

router.get("/:id/menu-items", MenuItemController.getMenuItems);
router.post("/:id/menu-items", verifyStaff, MenuItemController.createMenuItem);
router.patch("/:id/menu-items/:menuItemId", verifyStaff, MenuItemController.updateMenuItem);
router.delete("/:id/menu-items/:menuItemId", verifyOwner, MenuItemController.deleteMenuItem);

router.get("/:id/categories", CategoryController.getCategoriesByRestaurant);
router.post("/:id/categories", verifyStaff, CategoryController.createCategory);
router.put("/:id/categories/:categoryId", verifyStaff, CategoryController.updateCategory);
router.delete("/:id/categories/:categoryId", verifyOwner, CategoryController.deleteCategory);

router.get("/:id/orders", verifyStaff, OrderController.getOrders);
router.get("/:id/orders/:orderId", OrderController.getOrderById);
router.post("/:id/orders", OrderController.createOrder);
router.patch("/:id/orders/:orderId/status", verifyStaff, OrderController.updateOrderStatus);

router.get("/:id/bills", verifyStaff, BillController.getBillsByRestaurant);
router.get("/:id/bills/open", BillController.getOpenBill);
router.get("/:id/bills/:billId", BillController.getBillById);
router.post("/:id/bills", BillController.createBill);
router.patch("/:id/bills/:billId/payment", verifyStaff, BillController.updateBillPayment);
router.delete("/:id/bills/:billId", verifyOwner, BillController.deleteBill);

router.get("/:id/staff", verifyOwner, StaffMemberController.getStaffByRestaurant);
router.get("/:id/staff/:staffId", verifyOwner, StaffMemberController.getStaffById);
router.post("/:id/staff", verifyOwner, StaffMemberController.addStaffMember);
router.patch("/:id/staff/:staffId", verifyOwner, StaffMemberController.updateStaffMember);
router.delete("/:id/staff/:staffId", verifyOwner, StaffMemberController.removeStaffMember);

export default router;
