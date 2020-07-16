# sri-calc

![Build and Test CI](https://github.com/sjinks/sri-calc/workflows/Build%20and%20Test%20CI/badge.svg)

A simple module to generate SRI hashes of files, whcih then can be used to implement [sub-resource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

This module was inspired by [odino/node-sri](https://github.com/odino/node-sri) but it operates differently:
  * it does not require Linux environment;
  * it uses NodeJS Crypto API instead of launching an external process to calculate a digest

## Installation

```bash
npm install --save sri-calc
```

## Usage

Using the module is pretty straightforward, as you can use it
both with callbacks:

``` javascript
const sri = require('sri-calc');

sri.hash('/path/to/my/file.js', (err, hash) => {
  if (err) {
    throw err;
  }

  console.log('The hash is', hash);
});
```

and with promises:

``` javascript
const sri = require('sri-calc');

sri.hash('/path/to/my/file.js')
  .then(hash => console.log('The hash is', hash))
  .catch(err => console.log(err))
;
```

## Options

The first parameter of `sri.hash()` can either be a name of the file to process, or an object with the following configuration options:

  * `hash`: digest to use, the default value is `sha256`. In theory you can use any digest supported by [crypto.createHash](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options),
    but [the specification](https://w3c.github.io/webappsec-subresource-integrity/#grammardef-hash-algo) [allows](https://w3c.github.io/webappsec-csp/2/#source-list-valid-hashes) only for
    `sha256`, `sha384`, and `sha512`.
  * `prefix`: if `true` (default), the name of the digest algorithm will be prepended to the digest value, i.e., `sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==`.
  * `file`: name of the file to process


``` javascript
sri.hash({file: '/path/to/my/file.js', algo: 'sha512', prefix: false}) // z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==
```

## Tests

Have [mocha](https://mochajs.org/) installed and run `npm test`
