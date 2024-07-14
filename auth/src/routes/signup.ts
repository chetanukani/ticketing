import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { validationRequest, BadRequestError } from '@cuticketsservices/common'

import { User } from '../models/user'

const router = express.Router()

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 to 20 characters')
],
  validationRequest,
  async (req: Request, res: Response) => {

    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new BadRequestError('Email in use')
    }

    const user = User.build({ email, password })
    await user.save()

    const userJwt = jwt.sign({
      id: user._id,
      email: user.email
    }, process.env.JWT_KEY!)

    req.session = {
      jwt: userJwt
    }

    res.status(201).json(user)
  })

export { router as signUpRouter }