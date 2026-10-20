import { Router } from "express";
import usersController from "../../controllers/users/user.controller";
import { authenticate } from "../../config/middleware/auth.middleware";
import { uploadSingleImage } from "../../config/middleware/upload.middleware";

const router = Router();

// GET my profile
router.get("/me", authenticate, usersController.getMyProfile);

// UPDATE my profile
router.patch("/me", authenticate, uploadSingleImage, usersController.updateMyProfile);

// GET user profile by id
router.get("/:id/profile", usersController.getUserProfile);

export default router;
