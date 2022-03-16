const assert = require('assert');
const { isValidSignedQuery } = require('../../../');
const querystring = require('querystring');

describe('isValidSignedQuery(query, key)', function() {

	it('returns true for valid signed queries', function() {
		const query = 'id=7f6e30c87012dc3b7bf8&n=ac0284a9560f9abe760c&s=bb183dcf8b17fd12641722e718fb75209816a43a60238ecb13db1e4748960dbb&t=w&pn=1000&px=1000&pd=';
		const key = Buffer.from('5375baf547756f91225dbfcc40b18e7ddba478c4cdf6f18a668a8efa33a0e3b3', 'hex');
		assert.strictEqual(isValidSignedQuery(querystring.parse(query), key), true);// query is object
		assert.strictEqual(isValidSignedQuery(query, key), true);// query is string
	});

	it('query not string or object', function() {
		const query = 1;
		const key = Buffer.from('5375baf547756f91225dbfcc40b18e7ddba478c4cdf6f18a668a8efa33a0e3b3', 'hex');
		assert.throws(
			() => isValidSignedQuery(query, key),
			{ message: 'Invalid argument ("query"): String or Object expected' }
		);
	});

	it('key not buffer', function() {
		const query = {};
		const key = '5375baf547756f91225dbfcc40b18e7ddba478c4cdf6f18a668a8efa33a0e3b3';
		assert.throws(
			() => isValidSignedQuery(query, key),
			{ message: 'Invalid argument ("key"): Buffer expected' }
		);
	});
});
