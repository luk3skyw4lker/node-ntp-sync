const udp = require("dgram");
const EventEmitter = require("events");
const Packet = require("./packet");

class Server extends EventEmitter {
	constructor() {
		super();

		this.socket = udp.createSocket("udp4");
		this.socket.on("message", this.parse.bind(this));

		return this;
	}

	handle(handler) {
		this.on("request", handler);
	}

	send(rinfo, message, callback) {
		if (message instanceof Packet) {
			message.mode = Packet.MODES.SERVER; // mark mode as server
			message = message.toBuffer();
		}

		this.socket.send(message, rinfo.port, rinfo.server, callback);
		return this;
	}

	listen(port, address) {
		this.socket.bind(port || 4567, address);

		return this;
	}

	address() {
		return this.socket.address();
	}

	parse(message, rinfo) {
		const packet = Packet.parse(message);
		packet.receiveTimestamp = Date.now();

		this.emit("request", packet, this.send.bind(this, rinfo));
		return;
	}
}

module.exports = Server;
