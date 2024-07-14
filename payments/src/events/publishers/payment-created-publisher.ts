import { Subjects, Publisher, PaymentCreatedEvent } from "@cuticketsservices/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}