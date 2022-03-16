const assert = require('assert');
const { createSignature } = require('../../../');

describe('createSignature(data, key[, algorithm])', function() {

	it('key is utf8 string', function() {
		const data = 'data to be signed';
		const key = 'super secret key 123';
		const result = createSignature(data, key);
		assert.strictEqual(result, 'f7021356e338f6d47a71dc85e4df150bfce921934ab7093b61c8ef59d5486ecd');
	});

	it('key is hex string', function() {
		const data = 'data to be signed';
		const key = '5f3b9daa7772c83bf81a0758334f28898282c93bbbb994365fbbfb9489e45660';
		const result = createSignature(data, key);
		assert.strictEqual(result, '6184adef27edba31fb58cef933fb8e569e15d647402663ab031b83e225227316');
	});

	it('key is buffer from hex string', function() {
		const data = 'data to be signed';
		const key = Buffer.from('5f3b9daa7772c83bf81a0758334f28898282c93bbbb994365fbbfb9489e45660', 'hex');
		const result = createSignature(data, key);
		assert.strictEqual(result, '6184adef27edba31fb58cef933fb8e569e15d647402663ab031b83e225227316');
	});

	it('key is buffer from base64 string', function() {
		const data = 'data to be signed';
		const key = Buffer.from('ClxH16XPA26IJPXuUMyVCeLpVq6cges21dBltssRz/M=', 'base64');
		const result = createSignature(data, key);
		assert.strictEqual(result, 'b40b8b67bdca4f7c0fb7f9b4b8f019bf1b31ee8e425800d9baa39d6a36b9ac35');
	});

	it('algorithm = sha512', function() {
		const data = 'some data 0123456';
		const key = '0726a962c3871f05f6d1006fa39e9617f462d1a59867d31b1006357cb491356c';
		const algorithm = 'sha512';
		const result = createSignature(data, key, algorithm);
		assert.strictEqual(result, '7a1d421e61e4032cd6fba3f7c0de3716d522615784577e98605d7da26339da7b5eb7a1031a5a5f7320287236d1c47ed391a912c85646a5737a4e6309dd94eb3a');
	});
});
