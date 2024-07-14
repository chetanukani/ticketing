import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error"


export class RequestValidationError extends CustomError {
  statusCode = 400

  // errors: ValidationError[] == private errors in constructor
  constructor(public errors: ValidationError[]) {
    super('Validation error')

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }

  serializeErrors() {
    return this.errors.map(err => {
      if (err.type === 'field') {
        return { message: err.msg, field: err.path };
      }
      return { message: err.msg }
    })
  }
}