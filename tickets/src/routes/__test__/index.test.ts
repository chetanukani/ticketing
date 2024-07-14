import request from "supertest";
import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: title,
      price: price
    })
}
it('can fetch a list of tickets', async () => {
  await createTicket('Demo', 20)
  await createTicket('Test', 10)
  await createTicket('DemoTest', 40)

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

  expect(response.body.length).toEqual(3)
})