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

declare class Client {
	syncTime(): Promise<NTPPacket>;
}

declare class Server {
	handle(handler: Function): void;
}
