const assert = require('assert');
const crypto = require('crypto');

module.exports = {
	// Variant 1:
	// <variant_byte><len|nonce><len|payload:{pin}{amount}><hmac>
	decrypt: function(key, payload) {
		assert.ok(Buffer.isBuffer(key), 'Invalid argument ("key"): Buffer expected');
		assert.ok(Buffer.isBuffer(payload), 'Invalid argument ("payload"): Buffer expected');
		let pos = 0;
		const variant = payload[pos++];
		// <variant_byte><len|nonce><len|payload:{pin}{amount}><hmac>
		assert.strictEqual(variant, 1, 'Variant not implemented');
		const nonceLength = payload[pos++];
		const nonce = payload.subarray(pos++, pos += (nonceLength - 1));
		assert.strictEqual(nonce.length, nonceLength, 'Missing nonce bytes');
		assert.ok(nonce.length >= 8, 'Nonce is too short');
		const dataLength = payload[pos++];
		const data = payload.subarray(pos++, pos += (dataLength - 1));
		assert.ok(data.length <= 32, 'Payload is too long for this encryption method');
		assert.strictEqual(data.length, dataLength, 'Missing payload bytes');
		const hmac = payload.subarray(pos);
		assert.ok(hmac.length >= 8, 'HMAC is too short');
		assert.ok(hmac.length <= 32, 'HMAC is too long');
		const expected = crypto.createHmac('sha256', key).update(
			Buffer.concat([
				Buffer.from('Data:', 'utf8'),
				payload.subarray(0, payload.length - hmac.length)
			])
		).digest();
		assert.ok(!hmac.compare(expected.subarray(0, hmac.length)), 'HMAC is invalid');
		const secret = crypto.createHmac('sha256', key).update(
			Buffer.concat([
				Buffer.from('Round secret:', 'utf8'),
				nonce
			])
		).digest();
		let buffer = Buffer.alloc(data.length);
		for (let index = 0; index < data.length; index++) {
			buffer[index] = data[index] ^ secret[index];
		}
		let offset = 0;
		// https://github.com/diybitcoinhardware/embit/blob/a43ee04d8619cdb4bbb84dab60002fd9c987ee60/src/embit/compact.py#L29-L36
		const readFrom = function(buffer) {
			let int = buffer[offset++];
			if (int >= 0xFD) {
				const bytesToRead = 2 ** (int - 0xFC);
				int = buffer.readUIntLE(offset, bytesToRead);
				offset += bytesToRead;
			}
			return int;
		};
		const pin = readFrom(buffer);
		const amount = readFrom(buffer);
		return { pin, amount };
	},
	encrypt: function(key, data, options) {
		assert.ok(Buffer.isBuffer(key), 'Invalid argument ("key"): Buffer expected');
		assert.ok(data, 'Misssing required argument: "data"');
		assert.strictEqual(typeof data, 'object', 'Invalid argument ("data"): Object expected');
		assert.ok(!options || typeof options === 'object', 'Invalid argument ("options"): Object expected');
		options = Object.assign({
			nonce: null,
			nonceBytes: 8,
		}, options || {});
		const { amount, pin } = data;
		assert.ok(typeof amount === 'number' && !Number.isNaN(amount) && parseInt(amount) === amount, 'Invalid data attribute ("amount"): Integer expected');
		assert.ok(typeof pin === 'number' && !Number.isNaN(pin) && parseInt(pin) === pin, 'Invalid data attribute ("pin"): Integer expected');
		let payload = [];
		payload.push(1);// variant
		const nonce = options.nonce || crypto.randomBytes(options.nonceBytes);
		payload.push(nonce.length);
		for (let index = 0; index < nonce.length; index++) {
			payload.push(nonce[index]);
		}
		const pinVarIntLength = this.lenVarInt(pin);
		const amountVarIntLength = this.lenVarInt(amount);
		// pin bytes + currency code byte + amount bytes:
		let buffer = Buffer.alloc(pinVarIntLength + amountVarIntLength);
		this.writeVarInt(pin, buffer);
		this.writeVarInt(amount, buffer, pinVarIntLength);
		payload.push(buffer.length);
		const secret = crypto.createHmac('sha256', key).update(
			Buffer.concat([
				Buffer.from('Round secret:', 'utf8'),
				nonce
			])
		).digest();
		for (let index = 0; index < buffer.length; index++) {
			payload.push(buffer[index] ^ secret[index]);
		}
		const hmac = crypto.createHmac('sha256', key).update(
			Buffer.concat([
				Buffer.from('Data:', 'utf8'),
				Buffer.from(payload)
			])
		).digest().subarray(0, 8);
		for (let index = 0; index < 8; index++) {
			payload.push(hmac[index]);
		}
		return Buffer.from(payload);
	},
	lenVarInt: function(int) {
		if (int < 0xFD) return 1;
		if ((int >> 16) === 0) return 3;
		if ((int >> 32) === 0) return 5;
		return 9;
	},
	writeVarInt: function(int, buffer, offset) {
		let len = this.lenVarInt(int);
		offset = offset || 0;
		if (buffer.length < len) return;
		if (len === 1) {
			buffer[offset++] = int & 0xFF;
		} else {
			if (len === 3) {
				buffer[offset++] = 0xFD;
			} else if (len === 5) {
				buffer[offset++] = 0xFE;
			} else if (len === 9) {
				buffer[offset++] = 0xFF;
			}
			for (let index = 0; index < buffer.length - 1; index++) {
				buffer[index + offset] = ((int >> (8*index)) & 0xFF);
			}
		}
	},
};
