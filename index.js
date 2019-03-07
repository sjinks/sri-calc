const crypto = require('crypto');
const fs     = require('fs');

/**
 * Creates a SRI hash of the given file
 *
 * @param  {Mixed}    file Accepts either a filename or a dictionary of options
 * @param  {Function} cb   Optional callback
 * @return {Mixed}    Returns a promise if no callback was provided
 */
function hash(file, cb)
{
	let options = {
		hash: 'sha256',
		prefix: true
	};

	const hasher = (s) => crypto.createHash(options.hash).update(s).digest('base64');

	if (typeof file === 'object') {
		for (let prop in file) {
			options[prop] = file[prop];
		}
	}
	else {
		options.file = file;
	}

	const p = new Promise((resolve, reject) => {
		const input = fs.createReadStream(options.file);
		const hash  = crypto.createHash(options.hash);
		hash.setEncoding('base64');

		input.on('end', () => {
			hash.end();
			const digest = hash.read();
			resolve(options.prefix ? `${options.hash}-${digest}` : digest);
		});

		input.on('error', (e) => reject(e));

		input.pipe(hash);
	});

	if (typeof cb === 'function') {
		p
			.then(digest => cb(null, digest))
			.catch(err   => cb(err))
		;
	}
	else {
		return p;
	}
}

module.exports = {
	hash
};

