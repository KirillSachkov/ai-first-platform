import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  type OnApplicationShutdown,
  type OnModuleInit,
} from "@nestjs/common";
import { type Channel, type ChannelModel, connect, type RecoveringChannelModel } from "amqplib";

import { CONFIG, type Config } from "../config/config.js";
import { withTimeout } from "../health/with-timeout.js";

/**
 * Owns the RabbitMQ connection. amqplib recovery reconnects with backoff after every loss,
 * including when the broker is unreachable at startup, so the backend never exits for it.
 */
@Injectable()
export class RabbitMqConnection implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger("RabbitMQ");
  private connection: RecoveringChannelModel | undefined;
  private healthChannel: Channel | undefined;

  constructor(@Inject(CONFIG) private readonly config: Config) {}

  async onModuleInit(): Promise<void> {
    const connection = await connect(this.config.rabbitmqUrl, {
      recovery: {
        waitForConnect: false,
        maxDelay: 5_000,
        setup: async (model: ChannelModel) => {
          const channel = await model.createChannel();
          channel.on("error", (error: Error) =>
            this.logger.warn(`Channel error: ${error.message}`),
          );
          channel.on("close", () => {
            if (this.healthChannel === channel) this.healthChannel = undefined;
          });
          this.healthChannel = channel;
        },
      },
    });
    connection.on("connect", () => this.logger.log("Connected"));
    connection.on("disconnect", (error) => this.logger.warn(`Disconnected: ${error.message}`));
    connection.on("connect-failed", (error) =>
      this.logger.warn(`Connection attempt failed: ${error.message}`),
    );
    connection.on("error", (error) => this.logger.warn(`Connection error: ${error.message}`));
    this.connection = connection;
  }

  /** The open channel used for readiness, or undefined while disconnected. */
  get channel(): Channel | undefined {
    return this.healthChannel;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.connection?.close();
  }
}

@Injectable()
export class RabbitMqHealth {
  constructor(@Inject(RabbitMqConnection) private readonly connection: RabbitMqConnection) {}

  async ping(timeoutMs: number): Promise<void> {
    const channel = this.connection.channel;
    if (channel === undefined) throw new Error("no open channel");
    // A round trip on the open channel; the built-in exchange always exists.
    await withTimeout(channel.checkExchange("amq.topic"), timeoutMs);
  }
}

@Global()
@Module({
  providers: [RabbitMqConnection, RabbitMqHealth],
  exports: [RabbitMqHealth],
})
export class MessagingModule {}
