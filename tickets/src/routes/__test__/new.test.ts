import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it('has a route handler listening to /api/tickets for post request', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404)

})

it('can only be accessed id used is signed in', async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401)
})

it('returns a status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(404)
})

it('returns an error if an invalid title is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 323
    });

  expect(response.status).toEqual(400)

  const response1 = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 323
    });

  expect(response1.status).toEqual(400)

})

it('returns an error if an invalid price is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Test',
      price: -10
    });

  expect(response.status).toEqual(400)

  const response1 = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'demo'
    });

  expect(response1.status).toEqual(400)
})

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Test',
      price: 10
    })
    .expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
})

it('publishes an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Test',
      price: 10
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})