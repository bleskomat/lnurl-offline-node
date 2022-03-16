const assert = require('assert');
const { createSignature, prepareQueryPayloadString, prepareSignedQuery } = require('../../../');

describe('prepareSignedQuery(apiKey, tag, params[, options])', function() {

	it('valid arguments', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		const options = {
			algorithm: 'sha256',
			nonceBytes: 10,
		};
		const { id, key } = apiKey;
		const result = prepareSignedQuery(apiKey, tag, params, options);
		assert.strictEqual(typeof result, 'object');
		assert.strictEqual(result.id, id);
		assert.strictEqual(result.tag, tag);
		assert.strictEqual(result.minWithdrawable, params.minWithdrawable);
		assert.strictEqual(result.maxWithdrawable, params.maxWithdrawable);
		assert.strictEqual(result.defaultDescription, params.defaultDescription);
		assert.strictEqual(result.nonce.length, 20);
		assert.strictEqual(result.signature.length, 64);
		const payload = prepareQueryPayloadString({
			id,
			nonce: result.nonce,
			tag,
			minWithdrawable: params.minWithdrawable,
			maxWithdrawable: params.maxWithdrawable,
			defaultDescription: params.defaultDescription,
		});
		const signature = createSignature(payload, key, options.algorithm);
		assert.strictEqual(result.signature, signature);
	});

	it('{ options: { algorithm: "sha512" }', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		const options = {
			algorithm: 'sha512',
			nonceBytes: 10,
		};
		const { id, key } = apiKey;
		const result = prepareSignedQuery(apiKey, tag, params, options);
		assert.strictEqual(result.signature.length, 128);
		const payload = prepareQueryPayloadString({
			id,
			nonce: result.nonce,
			tag,
			minWithdrawable: params.minWithdrawable,
			maxWithdrawable: params.maxWithdrawable,
			defaultDescription: params.defaultDescription,
		});
		const signature = createSignature(payload, key, 'sha512');
		assert.strictEqual(result.signature, signature);
	});

	it('{ options: { nonceBytes: 8 }', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		const options = {
			algorithm: 'sha256',
			nonceBytes: 8,
		};
		const { id, key } = apiKey;
		const result = prepareSignedQuery(apiKey, tag, params, options);
		assert.strictEqual(result.nonce.length, 16);
	});

	it('{ options: { shorten: true }', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		const options = {
			algorithm: 'sha256',
			nonceBytes: 10,
			shorten: true,
		};
		const { id, key } = apiKey;
		const result = prepareSignedQuery(apiKey, tag, params, options);
		assert.strictEqual(result.id, id);
		assert.strictEqual(result.t, 'w');
		assert.strictEqual(result.pn, 50000);
		assert.strictEqual(result.px, 60000);
		assert.strictEqual(result.pd, params.defaultDescription);
		assert.strictEqual(result.n.length, 20);
		assert.strictEqual(result.s.length, 64);
		assert.ok(!result.tag);
		assert.ok(!result.minWithdrawable);
		assert.ok(!result.maxWithdrawable);
		assert.ok(!result.defaultDescription);
		assert.ok(!result.nonce);
		assert.ok(!result.signature);
	});

	it('JavaScript object in params', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'payRequest';
		const params = {
			minSendable: 10000,
			maxSendable: 20000,
			metadata: '[["text/plain", "test"]]',
			successAction: {
				tag: 'message',
				message: [],
			},
		};
		const options = {
			algorithm: 'sha256',
			nonceBytes: 10,
		};
		const { id, key } = apiKey;
		const result = prepareSignedQuery(apiKey, tag, params, options);
		const payload = prepareQueryPayloadString({
			id,
			nonce: result.nonce,
			tag,
			minSendable: params.minSendable,
			maxSendable: params.maxSendable,
			metadata: params.metadata,
			successAction: JSON.stringify(params.successAction),
		});
		const signature = createSignature(payload, key, options.algorithm);
		assert.strictEqual(result.signature, signature);
	});

	[
		{
			id: '0f9f1a95b6',
			key: 'ed732a8d99cd154fe276dc0b66b912521164d1f82fc31b4e5ccf2c6988f1b739',
			encoding: 'hex',
		},
		{
			id: 'fHfzU0I=',
			key: 'jqiNkv9yoYBZUqwo5EJqspgxy6MNSgPtHxf8ZogKZ4g=',
			encoding: 'base64',
		},
		{
			id: 'some-id',
			key: 'super-secret-key',
			encoding: 'utf8',
		},
	].forEach(apiKey => {
		it(`API key encoding = ${apiKey.encoding}`, function() {
			const tag = 'withdrawRequest';
			const params = {
				minWithdrawable: 50000,
				maxWithdrawable: 60000,
				defaultDescription: '',
			};
			const result = prepareSignedQuery(apiKey, tag, params);
			const payload = prepareQueryPayloadString({
				id: apiKey.id,
				nonce: result.nonce,
				tag,
				minWithdrawable: params.minWithdrawable,
				maxWithdrawable: params.maxWithdrawable,
				defaultDescription: params.defaultDescription,
			});
			const key = Buffer.from(apiKey.key, apiKey.encoding);
			const signature = createSignature(payload, key);
			assert.strictEqual(result.signature, signature);
		});
	});

	it('missing apiKey', function() {
		const apiKey = null;
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Missing required argument: "apiKey"' }
		);
	});

	it('invalid apiKey', function() {
		const apiKey = 1;
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Invalid argument ("apiKey"): Object expected' }
		);
	});

	it('missing apiKey.id', function() {
		const apiKey = {
			// id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Missing "apiKey.id"' }
		);
	});

	it('missing apiKey.key', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			// key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Missing "apiKey.key"' }
		);
	});

	it('missing tag', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = null;
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Missing required argument: "tag"' }
		);
	});

	it('invalid tag', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 1;
		const params = {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		};
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Invalid argument ("tag"): String expected' }
		);
	});

	it('invalid params', function() {
		const apiKey = {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		};
		const tag = 'withdrawRequest';
		const params = 1;
		assert.throws(
			() => prepareSignedQuery(apiKey, tag, params),
			{ message: 'Invalid argument ("params"): Object expected' }
		);
	});
});
