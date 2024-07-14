import { Publisher, OrderCreatedEvent, Subjects } from "@cuticketsservices/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}