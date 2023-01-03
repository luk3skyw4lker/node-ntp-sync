const udp = require('dgram');
const EventEmitter = require('events');
const { NTPPacket, MODES } = require('./packet');

class Server extends EventEmitter {
	constructor() {
		super();

		this.socket = udp.createSocket('udp4');
		this.socket.on('message', this.parse.bind(this));

		return this;
	}

	handle(handler) {
		this.on('request', handler);
	}

	send(rinfo, message, callback) {
		if (message instanceof NTPPacket) {
			const sendPackage = new NTPPacket(MODES.SERVER).bufferize(message);

			console.log('node-ntp-sync::send', {message, rinfo});
			this.socket.send(sendPackage, rinfo.port, rinfo.address, callback);

			return this;
		} else {
			throw new Error('Invalid response packet');
		}
	}

	listen(port, address) {
		this.socket.bind(port || 4567, address);

		return this;
	}

	address() {
		return this.socket.address();
	}

	parse(message, rinfo) {
		const packet = NTPPacket.parse(message);
		const rxTimestamp = Math.floor(Date.now() / 1000);

		packet.originateTimestamp = Math.floor(packet.txTimestamp);
		packet.referenceTimestamp = rxTimestamp - 5;
		packet.rxTimestamp = rxTimestamp;

		this.emit('request', packet, this.send.bind(this, rinfo));

		return;
	}
}

module.exports = Server;
