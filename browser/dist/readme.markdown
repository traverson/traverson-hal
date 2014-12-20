After a full build, this folder contains the browserified single-file builds that can be used in the browser in production.

* traverson-hal.js: Standalone with UMD, not minified. Can be used by script tag or with an AMD module loader.
* traverson-hal.min.js: Standalone with UMD, minified. Can be used by script tag or with an AMD module loader.
* traverson-hal.external.js: Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson-hal`. Not minified.
* traverson-hal.external.min.js: Same as above, but minified.
