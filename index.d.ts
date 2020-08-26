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

declare class Server {
	constructor();
	handle(handler: Function): void;
}
