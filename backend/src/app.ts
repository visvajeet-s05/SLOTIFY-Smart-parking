import express from "express"
import cors from "cors"

import bookingRoutes from "./routes/booking.routes"
import paymentRoutes from "./routes/payment.routes"
import cryptoRoutes from "./routes/crypto.routes"
import adminRoutes from "./routes/admin.routes"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/crypto", cryptoRoutes)
app.use("/api/admin", adminRoutes)

export default app