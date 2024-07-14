import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import request from "supertest"
import { app } from "../app"
import jwt from "jsonwebtoken"

declare global {
  var signin: () => string[];
}

jest.mock('../nats-wrapper')

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'sdfddvdfh'

  mongo = await MongoMemoryServer.create();
  const mongUri = mongo.getUri()

  await mongoose.connect(mongUri)
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
})

global.signin = () => {
  //Build a jwt payload {id,email }

  const payload = {
    id: new mongoose.Types.ObjectId(),
    email: 'test@test.com'
  }

  //Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)

  //Build session Object {jwt: MY_JWT}
  const session = { jwt: token }

  //Turn that session in to JSON
  const sessionJSON = JSON.stringify(session)

  //Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  //return a string that the cookie with the encoded data
  return [`session=${base64}`]
}