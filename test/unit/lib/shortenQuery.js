const assert = require('assert');
const { shortenQuery } = require('../../../');

describe('shortenQuery(query)', function() {

	[
		{
			query: {
				tag: 'channelRequest',
				localAmt: 1000,
				pushAmt: 500,
			},
			expected: {
				t: 'c',
				pl: 1000,
				pp: 500,
			},
		},
		{
			query: {
				tag: 'channelRequest',
				localAmt: 1000,
				pushAmt: 500,
			},
			expected: {
				t: 'c',
				pl: 1000,
				pp: 500,
			},
		},
		{
			query: {
				tag: 'login',
			},
			expected: {
				t: 'l',
			},
		},
		{
			query: {
				t: 'l',
			},
			expected: {
				t: 'l',
			},
		},
		{
			query: {
				id: 'some-id',
				tag: 'login',
			},
			expected: {
				id: 'some-id',
				t: 'l',
			},
		},
		{
			query: {
				tag: 'withdrawRequest',
				minWithdrawable: 1,
				maxWithdrawable: 5000,
				defaultDescription: 'default memo',
			},
			expected: {
				t: 'w',
				pn: 1,
				px: 5000,
				pd: 'default memo',
			},
		},
		{
			query: {
				id: 'c16822e114',
				nonce: '3f03c3fd5b57ac6b837b',
				signature: 'b11135b4d2cf4dc3a3cc4ae52dea627a8cbae2f6eb37ce3d08e5692e4a705614',
				tag: 'withdrawRequest',
				minWithdrawable: 1,
				maxWithdrawable: 5000,
				defaultDescription: 'default memo',
			},
			expected: {
				id: 'c16822e114',
				n: '3f03c3fd5b57ac6b837b',
				s: 'b11135b4d2cf4dc3a3cc4ae52dea627a8cbae2f6eb37ce3d08e5692e4a705614',
				t: 'w',
				pn: 1,
				px: 5000,
				pd: 'default memo',
			},
		},
		{
			query: {
				tag: 'payRequest',
				minSendable: 1000,
				maxSendable: 5000,
				metadata: '[["text/plain","example metadata"]]',
			},
			expected: {
				t: 'p',
				pn: 1000,
				px: 5000,
				pm: '[["text/plain","example metadata"]]',
			},
		},
		{
			query: {
				tag: 'payRequest',
				minSendable: 1000000,
				maxSendable: 5000000,
				metadata: '[["text/plain","example metadata"]]',
			},
			expected: {
				t: 'p',
				pn: 1000000,
				px: 5000000,
				pm: '[["text/plain","example metadata"]]',
			},
		},
		{
			query: {
				tag: 'unknown',
			},
			expected: {
				t: 'unknown',
			},
		},
	].forEach(test => {
		const { query, expected } = test;
		it(JSON.stringify(query), function() {
			const result = shortenQuery(query);
			assert.deepStrictEqual(result, expected);
		});
	});
});
