import {
  LoggerError,
  Transport,
  type TLogEntry,
  type TTransportBaseConstructorOptions,
} from "@caravan-logger/logger";
import { client, v2 } from "@datadog/datadog-api-client";
import { CouldNotWriteToDatadogError, DatadogError } from "./error";
import { ApiException } from "@datadog/datadog-api-client/dist/packages/datadog-api-client-common";

type TOnErrorHookParameters = {
  readonly error: DatadogError;
  readonly log: TLogEntry;
};

// https://docs.datadoghq.com/api/latest/logs/
type TDatadogTransportOptions = {
  readonly apiKey: string;
  readonly ddsite:
    | "datadoghq.com"
    | "us3.datadoghq.com"
    | "us5.datadoghq.com"
    | "datadoghq.eu"
    | "ddog-gov.com"
    | "ap1.datadoghq.com";
  readonly ddtags: Array<string>;
  readonly ddsource: string;
  readonly hostname: string;
  readonly service: string;
  readonly hooks?: {
    readonly onError?: ({
      error,
      log,
    }: TOnErrorHookParameters) => Promise<void>;
  };
};

class DatadogTransport extends Transport<TDatadogTransportOptions> {
  private readonly _datadogConfiguration: client.Configuration;
  private readonly _datadogApi: v2.LogsApi;

  constructor(
    options: TTransportBaseConstructorOptions<TDatadogTransportOptions>
  ) {
    super(options);

    this._datadogConfiguration = client.createConfiguration({
      authMethods: {
        apiKeyAuth: options.options.apiKey,
      },
    });
    this._datadogConfiguration.setServerVariables({
      site: `${options.options.ddsite}`,
    });
    this._datadogApi = new v2.LogsApi(this._datadogConfiguration);
  }

  async handle({
    level,
    message,
    data,
    hostname,
    processId,
    time,
  }: TLogEntry): Promise<void> {
    const params: v2.LogsApiSubmitLogRequest = {
      body: [
        {
          ddsource: this.options.ddsource,
          ddtags: this.options.ddtags.join(","),
          message,
          hostname: this.options.hostname,
          service: this.options.service,
          additionalProperties: {
            processId,
            level: level.toUpperCase(),
            ...data,
          },
        },
      ],
      contentEncoding: "gzip",
    };

    try {
      await this._datadogApi.submitLog(params, this._datadogConfiguration);
    } catch (error) {
      this.options.hooks?.onError?.({
        error: new CouldNotWriteToDatadogError({
          statusCode: (error as ApiException<unknown>).code,
        }),
        log: {
          level,
          message,
          data,
          hostname,
          processId,
          time,
        },
      });
    }
  }
}

export { DatadogTransport };
