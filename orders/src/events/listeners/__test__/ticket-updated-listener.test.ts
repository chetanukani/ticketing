import mongoose from "mongoose"
import { TicketUpdatedEvent } from "@cuticketsservices/common"
import { Message } from "node-nats-streaming"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket"

const setUp = async () => {
  //Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  //Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
  await ticket.save()

  //Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 10,
    userId: 'dkhfr75tgrb'
  }

  //Create a fake a message obj
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  //return all of these stuff
  return { msg, data, ticket, listener }

}

it('Finds, update and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setUp()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { msg, data, listener } = await setUp()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('does not call  ack is the event has skipped the version number', async () => {
  const { msg, data, listener } = await setUp()
  data.version = 10
  try {
    await listener.onMessage(data, msg)
  } catch (error) { }

  expect(msg.ack).not.toHaveBeenCalled()

})