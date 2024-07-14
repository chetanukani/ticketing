import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it('returns a 404 if a provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Update demo',
      price: 56
    })
    .expect(404)
})

it('returns a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Update demo',
      price: 56
    })
    .expect(401)
})

it('returns a 401 if user is does not a ticket', async () => {

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'dgddgdfsg',
      price: 30
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Update demo',
      price: 56
    })
    .expect(401)
})

it('returns a 400 if user provides invalid title or price', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 30
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 30
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'update test',
      price: -30
    })
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 30
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'update test',
      price: 60
    })
    .expect(200)

  const ticket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(ticket.body.title).toEqual('update test')
  expect(ticket.body.price).toEqual(60)

})

it('publishes an event', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 30
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'update test',
      price: 60
    })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects the update if ticket is reserved', async () => {
  const cookie = global.signin()
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 30
    });

  const ticket = await Ticket.findById(response.body.id)
  ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
  await ticket?.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'update test',
      price: 60
    })
    .expect(400)
})