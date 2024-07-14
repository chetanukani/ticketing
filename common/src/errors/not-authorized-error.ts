import { CustomError } from "./custom-error";

export class NotAuthorizedErrors extends CustomError {
  statusCode = 401;

  constructor() {
    super('Not authorized')

    Object.setPrototypeOf(this, NotAuthorizedErrors.prototype)
  }

  serializeErrors() {
    return [{ message: 'Not authorized' }]
  }

}