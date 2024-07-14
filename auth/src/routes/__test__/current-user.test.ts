import request from "supertest";
import { app } from "../../app";

it('response with current user details', async () => {
  // const authRes = await request(app)
  //   .post('/api/users/signup')
  //   .send({
  //     email: "test@test.com",
  //     password: "password"
  //   })
  //   .expect(201)

  // const cookie: any = authRes.get('Set-Cookie')
  // console.log(cookie)

  const cookie = await global.signin()

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send({})
    .expect(200)

  console.log(response.body)
})