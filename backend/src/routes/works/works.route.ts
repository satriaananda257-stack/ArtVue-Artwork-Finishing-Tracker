import { Router } from "express";
import worksController from "../../controllers/works/works.controller";
import { authenticate } from "../../config/middleware/auth.middleware";
import { uploadSingleImage } from "../../config/middleware/upload.middleware";

const router = Router();

// GET semua karya milik user yang login
router.get("/", authenticate, worksController.getMyWorks);

// GET karya berdasarkan ID (pemilik saja)
router.get("/:id", authenticate, worksController.getWorkById);

// CREATE karya baru
router.post("/", authenticate, uploadSingleImage, worksController.createWork);

// UPDATE karya (pemilik saja)
router.patch("/:id", authenticate, uploadSingleImage, worksController.updateWork);

// DELETE karya (pemilik saja)
router.delete("/:id", authenticate, worksController.deleteWork);

export default router;
