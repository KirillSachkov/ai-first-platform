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
  private healthCheckChannel: Channel | undefined;
  private shuttingDown = false;

  constructor(@Inject(CONFIG) private readonly config: Config) {}

  async onModuleInit(): Promise<void> {
    const connection = await connect(this.config.rabbitmqUrl, {
      recovery: {
        waitForConnect: false,
        maxDelay: 5_000,
        setup: (model: ChannelModel) => this.openHealthCheckChannel(model),
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

  /** The open channel that health checks use, or undefined while disconnected. */
  get channelForHealthCheck(): Channel | undefined {
    return this.healthCheckChannel;
  }

  async onApplicationShutdown(): Promise<void> {
    this.shuttingDown = true;
    await this.connection?.close();
  }

  // Called after every (re)connect. A channel can also close on its own while the connection
  // stays up; reopen it then, since connection recovery would not.
  private async openHealthCheckChannel(model: ChannelModel): Promise<void> {
    const channel = await model.createChannel();
    channel.on("error", (error: Error) => this.logger.warn(`Channel error: ${error.message}`));
    channel.on("close", () => {
      if (this.healthCheckChannel === channel) this.healthCheckChannel = undefined;
      if (this.shuttingDown) return;
      // The pause keeps a broker that keeps closing channels from causing a tight loop. Reopening
      // fails when the whole connection dropped; recovery then reopens the channel in setup.
      setTimeout(() => {
        this.openHealthCheckChannel(model).catch((error: Error) =>
          this.logger.debug(`Channel not reopened: ${error.message}`),
        );
      }, 1_000).unref();
    });
    this.healthCheckChannel = channel;
  }
}

@Injectable()
export class RabbitMqHealth {
  constructor(@Inject(RabbitMqConnection) private readonly connection: RabbitMqConnection) {}

  async ping(timeoutMs: number): Promise<void> {
    const channel = this.connection.channelForHealthCheck;
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
