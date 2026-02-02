import { Router } from "express"
import { auth } from "../middleware/auth"
import { createIntent } from "../services/stripe.service"

const router = Router()

router.post("/stripe", auth, createIntent)

export default router