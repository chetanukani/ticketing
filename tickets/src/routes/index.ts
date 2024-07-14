import express, { Request, Response } from "express";
import { requireAuth, validationRequest } from '@cuticketsservices/common'

import { Ticket } from "../models/ticket";

const router = express.Router()

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined
  })

  res.status(200).json(tickets)
})

export { router as indexTicketRouter }