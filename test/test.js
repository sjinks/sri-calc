const { describe, it } = require('node:test');
const { strictEqual, rejects } = require('node:assert/strict');
const { join } = require('node:path');
const { isPromise } = require('node:util/types');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { hash } = require('../');

function fixture(name)
{
	return join(__dirname, 'fixtures', name);
}

describe('sri', function() {
	describe('#hash()', function() {
		it('should return a promise when called without a callback', function() {
			const result = hash(fixture('sample.js'));
			strictEqual(isPromise(result), true);
		});

		it('should return a hash when generating an SRI for an existing file', async function() {
			const result = await hash(fixture('sample.js'));
			strictEqual(result, 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=');
		});

		it('should accept an option not to prefix the digest with the hash algorithm', async function() {
			const result = await hash({ file: fixture('sample.js'), prefix: false })
			strictEqual('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', result);
		});

		it('should accept an option to use different hash algorithms', async function() {
			const result = await hash({ file: fixture('sample.js'), hash: 'sha512'})
			strictEqual('sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==', result);
		});

		it('should hash known non-empty content', async function(ctx) {
			const directory = mkdtempSync(join(tmpdir(), 'sri-calc-'));
			ctx.after(() => rmSync(directory, { recursive: true, force: true }));
			const file = join(directory, 'content.js');
			writeFileSync(file, 'abc');
			strictEqual(await hash(file), 'sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=');
		});

		for (const mode of ['promise', 'callback']) {
			it(`should handle an invalid digest without a later stream error (${mode})`, function(ctx) {
				const directory = mkdtempSync(join(tmpdir(), 'sri-calc-'));
				ctx.after(() => rmSync(directory, { recursive: true, force: true }));
				const script = `
					const { hash } = require(process.argv[1]);
					const options = { file: process.argv[2], hash: 'unsupported-digest-for-regression' };
					const handled = (error, digest) => {
						if (!(error instanceof Error) || error.code === 'ENOENT' || digest !== undefined) process.exitCode = 7;
						else process.stdout.write('handled');
					};
					if (process.argv[3] === 'callback') hash(options, handled);
					else hash(options).then(() => { process.exitCode = 7; }, handled);
				`;
				const child = spawnSync(process.execPath, [
					'-e', script, require.resolve('../'), join(directory, 'missing.js'), mode
				], { encoding: 'utf8', timeout: 5000 });
				strictEqual(child.error, undefined);
				strictEqual(child.status, 0, child.stderr);
				strictEqual(child.stdout, 'handled');
			});
		}

		it('should return an error when generating an SRI for a non-existing file', function() {
			return rejects(() => hash('fixtures/nooooooo.js'), (err) => {
				strictEqual('code' in err, true);
				strictEqual(err.code, 'ENOENT');
				return true;
			});
		});

		it('should use a callback instead of returning a Promise', function() {
			strictEqual(hash('/hello', () => {}), undefined);
		});

		it('should return a digest when generating an SRI for an existing file with a callback', function(ctx, done) {
			hash(fixture('sample.js'), (err, hash) => {
				strictEqual('sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=', hash);
				strictEqual(null, err);
				done();
			});
		});

		it('should return an error when generating an SRI for a non-existing file with a callback', function(ctx, done) {
			hash('fixtures/nooooooo.js', (err, hash) => {
				strictEqual(err instanceof Error, true);
				strictEqual('code' in err, true);
				strictEqual(err.code, 'ENOENT');
				strictEqual(undefined, hash);
				done();
			});
		});
	});
});
