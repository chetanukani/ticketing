import { Publisher, Subjects, TicketCreatedEvent } from "@cuticketsservices/common";


export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
