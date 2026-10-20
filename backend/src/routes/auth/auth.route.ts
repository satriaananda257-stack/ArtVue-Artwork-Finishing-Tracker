import { Router } from "express";
import AuthController from "../../controllers/auth/auth.controller";

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/clerk', AuthController.clerkAuth);

export default router;