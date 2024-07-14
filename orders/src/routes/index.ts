import express, { Request, Response } from "express";
import { requireAuth, validationRequest } from '@cuticketsservices/common'
import { Order } from "../models/order";

const router = express.Router()

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser?.id
  }).populate('ticket')

  res.status(200).json(orders)
})

export { router as indexOrderRouter }