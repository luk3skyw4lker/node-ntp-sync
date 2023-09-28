const udp = require('dgram');

const { NTPPacket, MODES } = require('./packet');

const NTP_DELTA = 2208988800;

function createPacket() {
	const packet = new NTPPacket(MODES.CLIENT);

	packet.originateTimestamp = Math.floor(Date.now() / 1000);

	return packet.bufferize(packet);
}

function parse(buffer) {
	const message = NTPPacket.parse(buffer);

	message.destinationTimestamp = Math.floor(Date.now() / 1000) + NTP_DELTA;
	message.time = new Date(Math.floor((message.rxTimestamp - NTP_DELTA) * 1000));

	// Timestamp Name          ID   When Generated
	// ------------------------------------------------------------
	// Originate Timestamp     T1   time request sent by client
	// Receive Timestamp       T2   time request received by server
	// Transmit Timestamp      T3   time reply sent by server
	// Destination Timestamp   T4   time reply received by client
	const T1 = message.originateTimestamp;
	const T2 = message.rxTimestamp;
	const T3 = message.txTimestamp;
	const T4 = message.destinationTimestamp;

	// The roundtrip delay d and system clock offset t are defined as:
	// -
	// d = (T4 - T1) - (T3 - T2)     t = ((T2 - T1) + (T3 - T4)) / 2
	message.d = T4 - T1 - (T3 - T2);
	message.t = (T2 - T1 + (T3 - T4)) / 2;

	return message;
}

class Client {
	constructor(
		server = 'pool.ntp.org',
		port = 123,
		options = { timeout: 3000 }
	) {
		this.server = server;
		this.port = port;
		this.socket = udp.createSocket('udp4');
		this.options = options;

		return this;
	}

	async syncTime() {
		return new Promise((resolve, reject) => {
			this.socket = udp.createSocket('udp4');

			const {
				server,
				port,
				options: { timeout }
			} = this;

			const packet = createPacket();

			this.socket.send(packet, 0, packet.length, port, server, err => {
				if (err) {
					this.socket.close();
					return reject(err);
				}

				const timer = setTimeout(() => {
					const error = new Error(
						"NTP request timed out, server didn't answered"
					);
					this.socket.close();
					return reject(error);
				}, timeout);

				this.socket.once('message', data => {
					clearTimeout(timer);

					const message = parse(data);

					this.socket.close();

					return resolve(message);
				});
			});
		});
	}
}

module.exports = Client;
