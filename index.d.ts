import Packet from "./src/packet";

declare class Client {
	syncTime(): Promise<Packet>;
}

declare class Server {
	handle(handler: Function): void;
}
