import {
  TLogEntry,
  Transport,
  TTransportBaseConstructorOptions,
} from "@caravan-logger/logger";
import { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { ColorMap } from "./transforms";
import { TLogLevel } from "@caravan-logger/logger/dist/level";
import {
  CouldNotFetchDiscordError,
  CouldNotWriteToDiscordError,
  DiscordError,
} from "./error";

type TOnErrorHookParameters = {
  readonly error: DiscordError;
  readonly log: TLogEntry;
};

type TDiscordTransportOptions = {
  webhook: {
    id: string;
    token: string;
  };
  overrides?: {
    username?: string;
    avatarUrl?: string;
    title?: string;
    colors?: Partial<Record<TLogLevel, number>>;
  };
  readonly hooks?: {
    readonly onError?: ({
      error,
      log,
    }: TOnErrorHookParameters) => Promise<void>;
  };
};

type TTransformParameters = {
  entry: TLogEntry;
  options: Pick<TDiscordTransportOptions, "overrides">;
};

class DiscordTransport extends Transport<TDiscordTransportOptions> {
  private readonly _url: URL;

  constructor({
    options,
    level,
  }: TTransportBaseConstructorOptions<TDiscordTransportOptions>) {
    super({ options, level });

    this._url = new URL(
      `${options.webhook.id}/${options.webhook.token}`,
      "https://discord.com/api/v10/webhooks/"
    );
  }

  async handle(entry: TLogEntry): Promise<void> {
    const log = this._transform({ entry, options: this.options });

    try {
      const response = await fetch(this._url, {
        method: "POST",
        body: JSON.stringify(log),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        this.options.hooks?.onError?.({
          error: new CouldNotWriteToDiscordError({
            statusCode: response.status,
          }),
          log: entry,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        this.options.hooks?.onError?.({
          error: new CouldNotFetchDiscordError({ error }),
          log: entry,
        });
      }
    }
  }

  private _transform({
    entry,
    options,
  }: TTransformParameters): RESTPostAPIWebhookWithTokenJSONBody {
    return {
      username: options.overrides?.username,
      avatar_url: options.overrides?.avatarUrl,
      embeds: [
        {
          color:
            options.overrides?.colors?.[entry.level] ?? ColorMap[entry.level],
          title: options.overrides?.title ?? "@caravan-logger",
          fields: [
            {
              name: "level",
              value: entry.level,
              inline: true,
            },
            {
              name: "message",
              value: entry.message,
              inline: true,
            },
            {
              name: "time",
              value: entry.time.toISOString(),
            },
            {
              name: "hostname",
              value: entry.hostname,
              inline: true,
            },
            {
              name: "processId",
              value: `${entry.processId}`,
              inline: true,
            },
            {
              name: "data",
              value: JSON.stringify(entry.data),
            },
          ],
        },
      ],
    };
  }
}

export { DiscordTransport };
