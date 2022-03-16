const assert = require('assert');
const { createSignature, createSignedUrl, prepareQueryPayloadString } = require('../../../');
const querystring = require('querystring');
const url = require('url');

describe('createSignedUrl(apiKey, tag, params[, options])', function() {

	const validArgs = {
		apiKey: {
			id: 'b6cb8e81e3',
			key: '74a8f70391e48b7a35c676e5e448eda034db88c654213feff7b80228dcad7fa0',
		},
		tag: 'withdrawRequest',
		params: {
			minWithdrawable: 50000,
			maxWithdrawable: 60000,
			defaultDescription: '',
		},
		options: {
			baseUrl: 'http://localhost:3000/lnurl',
		},
	};

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
			baseUrl: 'http://localhost:3000/lnurl',
			shorten: false,
		};
		const result = createSignedUrl(apiKey, tag, params, options);
		const { id, key } = apiKey;
		assert.strictEqual(typeof result, 'string');
		assert.strictEqual(result.substr(0, options.baseUrl.length), options.baseUrl);
		const parsedUrl = url.parse(result);
		const query = querystring.parse(parsedUrl.query);
		assert.strictEqual(query.id, id);
		assert.strictEqual(query.tag, tag);
		assert.strictEqual(query.minWithdrawable, params.minWithdrawable.toString());
		assert.strictEqual(query.maxWithdrawable, params.maxWithdrawable.toString());
		assert.strictEqual(query.defaultDescription, params.defaultDescription);
		assert.strictEqual(query.nonce.length, 20);
		assert.strictEqual(query.signature.length, 64);
		const payload = prepareQueryPayloadString({
			id,
			nonce: query.nonce,
			tag,
			minWithdrawable: params.minWithdrawable,
			maxWithdrawable: params.maxWithdrawable,
			defaultDescription: params.defaultDescription,
		});
		const signature = createSignature(payload, key, 'sha256');
		assert.strictEqual(query.signature, signature);
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
			baseUrl: 'http://localhost:3000/lnurl',
			shorten: true,
		};
		const result = createSignedUrl(apiKey, tag, params, options);
		const { id } = apiKey;
		const parsedUrl = url.parse(result);
		const query = querystring.parse(parsedUrl.query);
		assert.strictEqual(query.id, id);
		assert.strictEqual(query.t, 'w');
		assert.strictEqual(query.pn, '50000');
		assert.strictEqual(query.px, '60000');
		assert.strictEqual(query.pd, params.defaultDescription);
		assert.strictEqual(query.n.length, 20);
		assert.strictEqual(query.s.length, 64);
		assert.ok(!query.tag);
		assert.ok(!query.minWithdrawable);
		assert.ok(!query.maxWithdrawable);
		assert.ok(!query.defaultDescription);
		assert.ok(!query.nonce);
		assert.ok(!query.signature);
	});

	it('missing required option ("baseUrl")', function() {
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
		const options = {};
		assert.throws(() => createSignedUrl(apiKey, tag, params, options), {
			message: 'Missing required option: "baseUrl"',
		});
	});

	it('missing required option ("baseUrl")', function() {
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
			baseUrl: 1,
		};
		assert.throws(() => createSignedUrl(apiKey, tag, params, options), {
			message: 'Invalid option ("baseUrl"): String expected',
		});
	});
});
