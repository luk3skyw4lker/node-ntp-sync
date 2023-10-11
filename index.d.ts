export interface NTPPacket {
  leapIndicator: number;
  version: number;
  mode: number;
  stratum: number;
  pollInterval: number;
  precision: number;
  referenceIdentifier: Buffer;
  referenceTimestamp: number;
  originateTimestamp: number;
  receiveTimestamp: number;
  transmitTimestamp: number;
  rootDelay: Buffer;
  rootDispersion: Buffer;
  destinationTimestamp: number;
  time: Date;
  d: number;
  t: number;
}

export interface NTPOptions {
  timeout: number;
}

declare class Client {
  constructor(server?: string, port?: number, options?: NTPOptions);
  syncTime(): Promise<NTPPacket>;
}

export interface ServerOptions {
  onInvalidPacket?: (message: string, error: any) => any;
}

declare class Server {
  constructor(options?: ServerOptions);
  handle(handler: Function): void;
  listen(port?: number, callback?: Function): Server;
}
