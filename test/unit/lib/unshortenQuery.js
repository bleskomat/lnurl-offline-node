const assert = require('assert');
const { unshortenQuery } = require('../../../');

describe('unshortenQuery(query)', function() {

	[
		{
			query: {
				t: 'c',
				pl: 1000,
				pp: 500,
			},
			expected: {
				tag: 'channelRequest',
				localAmt: 1000,
				pushAmt: 500,
			},
		},
		{
			query: {
				id: '9bb19f843d',
				n: '3f03c3fd5b57ac6b837b',
				s: 'b11135b4d2cf4dc3a3cc4ae52dea627a8cbae2f6eb37ce3d08e5692e4a705614',
				t: 'channelRequest',
				pl: 1000,
				pp: 0,
			},
			expected: {
				id: '9bb19f843d',
				nonce: '3f03c3fd5b57ac6b837b',
				signature: 'b11135b4d2cf4dc3a3cc4ae52dea627a8cbae2f6eb37ce3d08e5692e4a705614',
				tag: 'channelRequest',
				localAmt: 1000,
				pushAmt: 0,
			},
		},
		{
			query: {
				t: 'c',
				localAmt: 800,
				pp: 400,
			},
			expected: {
				tag: 'channelRequest',
				localAmt: 800,
				pushAmt: 400,
			},
		},
		{
			query: {
				t: 'l',
			},
			expected: {
				tag: 'login',
			},
		},
		{
			query: {
				tag: 'login',
			},
			expected: {
				tag: 'login',
			},
		},
		{
			query: {
				id: 'some-id',
				t: 'l',
			},
			expected: {
				id: 'some-id',
				tag: 'login',
			},
		},
		{
			query: {
				t: 'w',
				pn: 1,
				px: 5000,
				pd: 'default memo',
			},
			expected: {
				tag: 'withdrawRequest',
				minWithdrawable: 1,
				maxWithdrawable: 5000,
				defaultDescription: 'default memo',
			},
		},
		{
			query: {
				t: 'p',
				pn: 1000,
				px: 5000,
				pm: '[["text/plain","example metadata"]]',
			},
			expected: {
				tag: 'payRequest',
				minSendable: 1000,
				maxSendable: 5000,
				metadata: '[["text/plain","example metadata"]]',
			},
		},
	].forEach(test => {
		const { query, expected } = test;
		it(JSON.stringify(query), function() {
			const result = unshortenQuery(query);
			assert.deepStrictEqual(result, expected);
		});
	});
});
