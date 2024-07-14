import express, { Request, Response } from "express";
import { requireAuth, validationRequest, NotFoundError, NotAuthorizedErrors, BadRequestError } from '@cuticketsservices/common'
import { body } from "express-validator";

import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router()

router.put('/api/tickets/:id', requireAuth, [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0')
], validationRequest, async (req: Request, res: Response) => {

  const { title, price } = req.body

  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    throw new NotFoundError()
  }

  if (ticket.orderId) {
    throw new BadRequestError('Cannot edit a reserved ticket')
  }

  if (ticket.userId !== req.currentUser!.id) {
    throw new NotAuthorizedErrors()
  }

  ticket.set({
    title: title,
    price: price
  })

  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version
  })

  await ticket.save()

  res.status(200).json(ticket)
})

export { router as updateTicketRouter }