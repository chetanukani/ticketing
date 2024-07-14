import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCancelledEvent, OrderStatus } from "@cuticketsservices/common"
import { OrderCancelledListener } from "../order-cancelled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"

const setUp = async () => {
  //Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  //Cerate and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert',
    price: 90,
    userId: 'fdbvw78t4'
  })

  ticket.set({ orderId })
  await ticket.save()

  //Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, ticket, msg, orderId }
}

it('updates the ticket, publishes an event, and ack the message', async () => {
  const { listener, data, msg, ticket, orderId } = await setUp()

  await listener.onMessage(data, msg)

  const updatedRTicket = await Ticket.findById(ticket.id)
  expect(updatedRTicket!.orderId).not.toBeDefined()
  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})