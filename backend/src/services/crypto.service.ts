export const createCryptoPayment = async (req, res) => {
  try {
    res.json({
      chain: "polygon",
      token: "USDC",
      amount: req.body.amount,
      contract: process.env.CONTRACT_ADDRESS
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to create crypto payment", error })
  }
}