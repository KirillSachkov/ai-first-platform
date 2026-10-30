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
import { withTimeout } from "../async/with-timeout.js";

/**
 * Owns the RabbitMQ connection. amqplib recovery reconnects with backoff after every loss,
 * including when the broker is unreachable at startup, so the backend never exits for it.
 */
@Injectable()
export class RabbitMqConnection implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger("RabbitMQ");
  private connection: RecoveringChannelModel | undefined;
  private readinessChannel: Channel | undefined;
  private shuttingDown = false;

  constructor(@Inject(CONFIG) private readonly config: Config) {}

  async onModuleInit(): Promise<void> {
    const connection = await connect(this.config.rabbitmqUrl, {
      recovery: {
        waitForConnect: false,
        maxDelay: 5_000,
        setup: (model: ChannelModel) => this.openReadinessChannel(model),
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

  /** The open channel that readiness probes use, or undefined while disconnected. */
  get channelForReadiness(): Channel | undefined {
    return this.readinessChannel;
  }

  async onApplicationShutdown(): Promise<void> {
    this.shuttingDown = true;
    await this.connection?.close();
  }

  // Called after every (re)connect. A channel can also close on its own while the connection
  // stays up; reopen it then, since connection recovery would not.
  private async openReadinessChannel(model: ChannelModel): Promise<void> {
    const channel = await model.createChannel();
    channel.on("error", (error: Error) => this.logger.warn(`Channel error: ${error.message}`));
    channel.on("close", () => {
      if (this.readinessChannel === channel) this.readinessChannel = undefined;
      if (this.shuttingDown) return;
      this.openReadinessChannel(model).catch((error: Error) =>
        this.logger.warn(`Could not reopen channel: ${error.message}`),
      );
    });
    this.readinessChannel = channel;
  }
}

@Injectable()
export class RabbitMqHealth {
  constructor(@Inject(RabbitMqConnection) private readonly connection: RabbitMqConnection) {}

  async ping(timeoutMs: number): Promise<void> {
    const channel = this.connection.channelForReadiness;
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
