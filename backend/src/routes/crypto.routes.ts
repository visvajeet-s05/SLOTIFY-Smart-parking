import { Router } from "express"
import { auth } from "../middleware/auth"
import { createCryptoPayment } from "../services/crypto.service"

const router = Router()
router.post("/pay", auth, createCryptoPayment)
export default router