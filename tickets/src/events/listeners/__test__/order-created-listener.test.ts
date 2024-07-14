import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCreatedEvent, OrderStatus } from "@cuticketsservices/common"
import { OrderCreatedListener } from "../order-created-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"

const setUp = async () => {
  //Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  //Cerate and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 90,
    userId: 'fdbvw78t4'
  })

  await ticket.save()

  //Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'dsokcds',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, ticket, msg }
}

it('sets the userId of the ticket', async () => {
  const { listener, data, msg, ticket } = await setUp()

  await listener.onMessage(data, msg)

  const updatedRTicket = await Ticket.findById(ticket.id)

  expect(updatedRTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { listener, data, msg, ticket } = await setUp()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  const { listener, data, msg, ticket } = await setUp()
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(data.id).toEqual(ticketUpdatedData.orderId)
})