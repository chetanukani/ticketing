import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCancelledEvent, OrderStatus } from "@cuticketsservices/common"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import { Order } from "../../../models/order"

const setUp = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'dnvgnf',
    status: OrderStatus.Created,
    price: 10
  })

  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'kjdsfg'
    }
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, order }
}

it('updated the status of the order', async () => {
  const { listener, data, msg, order } = await setUp()
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setUp()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()

})