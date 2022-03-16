const assert = require('assert');
const { prepareQueryPayloadString } = require('../../../');

describe('prepareQueryPayloadString(query)', function() {

	it('returns payload string, sorted alphabetically by key', function() {
		const query = {
			nonce: '6352744c67396aa43ac7',
			tag: 'withdrawRequest',
			id: 'b6cb8e81e3',
			maxWithdrawable: 60000,
			defaultDescription: '',
			minWithdrawable: 50000,
		};
		const result = prepareQueryPayloadString(query);
		assert.strictEqual(result, 'defaultDescription=&id=b6cb8e81e3&maxWithdrawable=60000&minWithdrawable=50000&nonce=6352744c67396aa43ac7&tag=withdrawRequest');
	});
});
