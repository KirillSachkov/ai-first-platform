/**
 * Envelope of an event that one module publishes for others (ADR-0003). The publishing module
 * declares each event type in its contracts. Events carry identifiers and minimal data, never
 * whole entities, and handlers use occurredAt to ignore effects of later changes.
 */
export type IntegrationEvent<Type extends string, Version extends number, Data> = Readonly<{
  /** Unique message id; subscribers deduplicate redeliveries by it. */
  id: string;
  /** Also the RabbitMQ routing key: `<module>.<event>`. */
  type: Type;
  version: Version;
  /** ISO 8601 moment the change happened in the publishing module. */
  occurredAt: string;
  data: Readonly<Data>;
}>;
