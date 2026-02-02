import prisma from "../prisma"

export const createBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        slotId: req.body.slotId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        status: "PENDING"
      }
    })

    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking", error })
  }
}