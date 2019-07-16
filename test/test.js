const assert = require('assert');
const path   = require('path');
const sri    = require('../index');

function fixture(name)
{
	return path.join(__dirname, 'fixtures', name);
}

describe('sri', function() {
	describe('#hash()', function() {
		it('should return a promise when called without a callback', function() {
			assert(typeof sri.hash(fixture('sample.js')).then === 'function');
		});

		it('should return a hash when generating an SRI for an existing file', function(done) {
			sri.hash('fixtures/sample.js')
				.then((hash) => {
					assert.strictEqual('sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', hash);
					done();
				})
				.catch((err) => {
					assert.fail("Should not happen");
				})
				.catch(() => done())
			;
		});

		it('should accept an option not to prefix the digest with the hash algorithm', function(done) {
			sri.hash({ file: fixture('sample.js'), prefix: false })
				.then((hash) => {
					assert.strictEqual('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', hash);
					done();
				})
				.catch((err) => {
					assert.fail("Should not happen");
				})
				.catch(() => done())
			;
		});

		it('should accept an option to use different hash algorithms', function(done) {
			sri.hash({ file: fixture('sample.js'), hash: 'sha512'})
				.then((hash) => {
					assert.strictEqual('sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==', hash);
					done();
				})
				.catch((err) => {
					assert.fail("Should not happen");
				})
				.catch(() => done())
			;
		});

		it('should return an error when generating an SRI for a non-existing file', function(done) {
			sri.hash('fixtures/nooooooo.js')
				.catch((err) => {
					assert.strictEqual(err.code, 'ENOENT');
					done();
				})
				.catch(() => done())
			;
		});

		it('should use a callback instead of returning a Promise', function() {
			assert(sri.hash('/hello', () => {}) === undefined);
		});

		it('should return a digest when generating an SRI for an existing file with a callback', function(done) {
			sri.hash(fixture('sample.js'), (err, hash) => {
				assert.strictEqual('sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', hash);
				assert.strictEqual(null, err);
				done();
			});
		});

		it('should return an error when generating an SRI for a non-existing file with a callback', function(done) {
			sri.hash('fixtures/nooooooo.js', (err, hash) => {
				assert(err instanceof Error);
				assert.strictEqual(err.code, 'ENOENT');
				assert.strictEqual(undefined, hash);
				done();
			});
		});
	});
});
