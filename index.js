const { createHash } = require('node:crypto');
const { createReadStream } = require('node:fs');

/**
 * @callback hashCallback
 * @param {*} err
 * @param {string=} digest
 * @return {*}
 */

/**
 * @typedef {object} hashOptions
 * @property {string} file
 * @property {string=} hash
 * @property {boolean=} prefix
 */

/**
 * Creates a SRI hash of the given file
 *
 * @param  {(string|hashOptions)} file Accepts either a filename or a dictionary of options
 * @param  {hashCallback=} cb          Optional callback
 * @return {Promise<string>|void}      Returns a promise if no callback has been provided
 */
function hash(file, cb)
{
	let options = {
		hash: 'sha256',
		prefix: true
	};

	if (typeof file === 'object') {
		options = { ...options, ...file };
	}
	else {
		options.file = file;
	}

	if (!options.file) {
		throw new TypeError('No file specified');
	}

	const p = new Promise((resolve, reject) => {
		const input = createReadStream(options.file);
		const hash  = createHash(options.hash);
		hash.setEncoding('base64');

		input.on('end', () => {
			hash.end();
			/** @type string */
			const digest = hash.read();
			resolve(options.prefix ? `${options.hash}-${digest}` : digest);
		});

		input.on('error', (e) => reject(e));
		input.pipe(hash);
	});

	if (typeof cb === 'function') {
		p.then(digest => cb(null, digest)).catch(cb);
	}
	else {
		return p;
	}
}

module.exports = {
	hash
};
