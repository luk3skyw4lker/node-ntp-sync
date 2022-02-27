function toMsecs(buffer, offset) {
	let seconds = 0;
	let fraction = 0;

	for (let i = 0; i < 4; ++i) {
		seconds = seconds * 256 + buffer[offset + i];
	}

	for (let i = 4; i < 8; ++i) {
		fraction = fraction * 256 + buffer[offset + i];
	}

	return seconds + fraction / Math.pow(2, 32);
}

const toFrac = ts => {
	return Math.floor(Math.abs(ts - Math.floor(ts)) * Math.pow(2, 32));
};

const sysToNTP = timestamp => timestamp + NTPPacket.NTP_DELTA;

const writeInMillis = (buffer, offset, ts, addDelta) => {
	const seconds = addDelta ? ts + NTP_DELTA : ts;
	const fraction = toFrac(ts);

	// seconds
	buffer[offset + 0] = (seconds & 0xff000000) >> 24;
	buffer[offset + 1] = (seconds & 0x00ff0000) >> 16;
	buffer[offset + 2] = (seconds & 0x0000ff00) >> 8;
	buffer[offset + 3] = seconds & 0x000000ff;

	// fraction
	buffer[offset + 4] = (fraction & 0xff000000) >> 24;
	buffer[offset + 5] = (fraction & 0x00ff0000) >> 16;
	buffer[offset + 6] = (fraction & 0x0000ff00) >> 8;
	buffer[offset + 7] = fraction & 0x000000ff;

	return buffer;
};

const MODES = {
	CLIENT: 3,
	SERVER: 4
};

const NTP_DELTA = 2208988800;

class NTPPacket {
	constructor(mode) {
		Object.assign(this, {
			mode: mode || 4,
			leap: 0,
			version: 3,
			stratum: 0,
			poll: 0,
			precision: 0,
			rootDelay: 0,
			rootDispersion: 0,
			referenceId: 0,
			referenceTimestamp: 0,
			originateTimestamp: 0,
			rxTimestamp: 0,
			txTimestamp: 0
		});
	}

	static parse(data) {
		if (data.length < 48) {
			throw new Error('Invalid NTP Package');
		}

		const packet = new NTPPacket(4);

		// Control bytes
		packet.leap = (data[0] >> 6) & 0x3;
		packet.version = (data[0] >> 3) & 0x7;
		packet.mode = data[0] & 0x7;
		packet.stratum = parseInt(data[1]) || 2;
		packet.poll = parseInt(data[2]) || 10;
		packet.precision = parseInt(data[3]);
		packet.rootDelay = data.slice(4, 8).readFloatBE(0) / 2 ** 16;
		packet.rootDispersion = data.slice(8, 12).readFloatBE(0) / 2 ** 16;
		packet.referenceId = data.slice(12, 16);

		// Timestamps where the 4 first bytes are the
		// int part and the 4 last are the frac part
		// const refTimestampHigh = data.slice(16, 20).readUint32BE();
		// const refTimestampLow = data.slice(20, 24).readFloatBE();
		packet.referenceTimestamp = toMsecs(data, 16);

		// const origTimestampHigh = data.slice(24, 28).readUint32BE();
		// const origTimestampLow = data.slice(28, 32).readUint32BE();
		packet.originateTimestamp = toMsecs(data, 24);

		// const rxTimestampHigh = data.slice(32, 36).readUint32BE();
		// const rxTimestampLow = data.slice(36, 40).readUint32BE();
		packet.rxTimestamp = toMsecs(data, 32);

		// const txTimestampHigh = data.slice(40, 44).readUint32BE();
		// const txTimestampLow = data.slice(44, 48).readUint32BE();
		packet.txTimestamp = toMsecs(data, 40);

		return packet;
	}

	bufferize(packet) {
		const buffer = Buffer.alloc(48).fill(0x00);

		buffer[0] = (packet.leap << 6) | (packet.version << 3) | (this.mode << 0);
		buffer[1] = packet.stratum;
		buffer[2] = packet.poll;
		buffer[3] = packet.precision;

		buffer.writeUInt32BE(packet.rootDelay, 4);
		buffer.writeUInt32BE(packet.rootDispersion, 8);
		buffer.writeUInt32BE(packet.referenceId, 12);

		// Reference Timestamp
		writeInMillis(buffer, 16, packet.referenceTimestamp, true);

		// Originate timestamp
		writeInMillis(
			buffer,
			24,
			packet.originateTimestamp,
			this.mode !== MODES.SERVER // Don't add NTP_DELTA if the packet is server mode
		);

		// RX Timestamp
		writeInMillis(buffer, 32, packet.rxTimestamp, true);

		// TX Timestamp
		writeInMillis(buffer, 40, packet.txTimestamp, true);

		return buffer;
	}
}

module.exports = { NTPPacket, sysToNTP, MODES };
