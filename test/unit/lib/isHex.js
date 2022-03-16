const assert = require('assert');
const { isHex } = require('../../../');

describe('isHex(value)', function() {

	it('returns true for hex values', function() {
		['01', '74657374', '353073693f9ecf3de3e76dbbfc1422fb44674902348740651fca4acd23e488fb', '01FFAB077F'].forEach(value => {
			assert.strictEqual(isHex(value), true, `Expected TRUE for value = "${value}"`);
		});
	});

	it('returns false for non-hex values', function() {
		['0', '0z', 'z', 'zz', '012ezzz', '12345'].forEach(value => {
			assert.strictEqual(isHex(value), false, `Expected FALSE for value = "${value}"`);
		});
	});

	it('throws error if value is not a string', function() {
		[undefined, null, 0, {}, []].forEach(value => {
			assert.throws(
				() => isHex(value),
				{ message: 'Invalid argument ("value"): String expected.' },
				'Expected thrown error for value = "' + JSON.stringify(value) + '"'
			);
		});
	});
});
