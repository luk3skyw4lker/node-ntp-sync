const udp = require('dgram');
const EventEmitter = require('events');
const { NTPPacket, MODES } = require('./packet');

function defaultOnInvalidPacket(message, error) {
	console.error('[node-ntp-sync] Invalid packet received', message, error.message)
}

class Server extends EventEmitter {
	constructor(options) {
		super();

		options = options || {}

		this.socket = udp.createSocket('udp4');
		this.socket.on('message', this.parse.bind(this));

		if (options.onInvalidPacket && typeof options.onInvalidPacket == 'function') {
			this._onInvalidPacket = options.onInvalidPacket
		} else {
			this._onInvalidPacket = defaultOnInvalidPacket
		}

		return this;
	}

	handle(handler) {
		this.on('request', handler);
	}

	send(rinfo, message, callback) {
		if (message instanceof NTPPacket) {
			const sendPackage = new NTPPacket(MODES.SERVER).bufferize(message);

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
		try {
			const packet = NTPPacket.parse(message);
			const rxTimestamp = Math.floor(Date.now() / 1000);

			packet.originateTimestamp = Math.floor(packet.txTimestamp);
			packet.referenceTimestamp = rxTimestamp - 5;
			packet.rxTimestamp = rxTimestamp;

			this.emit('request', packet, this.send.bind(this, rinfo));
		} catch (error) {
			this._onInvalidPacket(message, error)
		}

		return;
	}
}

module.exports = Server;
