import { Subjects, Publisher, ExpirationCompleteEvent } from "@cuticketsservices/common";


export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}