import { Publisher, Subjects, TicketUpdatedEvent } from "@cuticketsservices/common";


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
