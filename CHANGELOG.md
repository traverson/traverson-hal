# [8.1.0](https://github.com/traverson/traverson-hal/compare/v8.0.0...v8.1.0) (2022-09-26)


### Features

* **traverson:** allowed use of the latest major version ([79ddf72](https://github.com/traverson/traverson-hal/commit/79ddf72748153704777809caf34818dceeb18207))

# [8.0.0](https://github.com/traverson/traverson-hal/compare/v7.0.2...v8.0.0) (2022-09-26)


### Features

* **node-versions:** raised the minimum required version to v14 ([3f80a98](https://github.com/traverson/traverson-hal/commit/3f80a984fbfacf7ceef31353092df10a58b0904e))


### BREAKING CHANGES

* **node-versions:** the minimum required version of node is now v14

## [7.0.2](https://github.com/traverson/traverson-hal/compare/v7.0.1...v7.0.2) (2020-02-28)


### Bug Fixes

* **package:** update halfred to version 1.1.1 ([ffebbfa](https://github.com/traverson/traverson-hal/commit/ffebbfa13fc62ce356d1bebccd61fce346be5988))

## [7.0.1](https://github.com/traverson/traverson-hal/compare/v7.0.0...v7.0.1) (2020-02-28)


### Bug Fixes

* **traverson-peer:** added v7 as a valid peer ([ae0c6ff](https://github.com/traverson/traverson-hal/commit/ae0c6ffc26085b5e6f0b8f9d2af497eec6f630e8))

# [7.0.0](https://github.com/traverson/traverson-hal/compare/v6.1.0...v7.0.0) (2020-02-28)


### chore

* **bower:** dropped support for bower ([63435ce](https://github.com/traverson/traverson-hal/commit/63435ce1e6c73e9f75d09a3d72a10bc056c9492e))


### Code Refactoring

* limited the files included in the build to minimum required ([f94fc8a](https://github.com/traverson/traverson-hal/commit/f94fc8a99c269c5fdf2dea43483318aadb283a40))


### Continuous Integration

* **node-versions:** dropped node versions that have reached EOL ([eaaccea](https://github.com/traverson/traverson-hal/commit/eaaccea31af2a9431b96f42ffc1c3de8d56b0066))


### BREAKING CHANGES

* limited the published files to those used by the public api. use of private files
could break with this change
* **bower:** Bower is no longer supported
* **node-versions:** node versions that have reached EOL are no longer supported

# [7.0.0-alpha.3](https://github.com/traverson/traverson-hal/compare/v7.0.0-alpha.2...v7.0.0-alpha.3) (2020-02-21)


### Code Refactoring

* limited the files included in the build to minimum required ([f94fc8a](https://github.com/traverson/traverson-hal/commit/f94fc8a99c269c5fdf2dea43483318aadb283a40))


### BREAKING CHANGES

* limited the published files to those used by the public api. use of private files
could break with this change

# [7.0.0-alpha.2](https://github.com/traverson/traverson-hal/compare/v7.0.0-alpha.1...v7.0.0-alpha.2) (2020-02-15)


### chore

* **bower:** dropped support for bower ([63435ce](https://github.com/traverson/traverson-hal/commit/63435ce1e6c73e9f75d09a3d72a10bc056c9492e))


### BREAKING CHANGES

* **bower:** Bower is no longer supported

Release Notes
-------------

* 1.0.0 2015-02-27:
    * Initial release as a separate Traverson media type plug-in.
* 1.1.0 2015-03-04:
    * Update for Traverson release 1.1.0.
    * Less restrictive peer dependency.
* 1.2.0 2015-03-15:
    * Update for Traverson release 1.2.0 (including change media type plug-in api, namely rename of `step.uri` to `step.url`).
    * Added support for `preferEmbeddedResources()` to configure Traverson to prefer embedded resources over following links (#5).
* 2.0.0 2015-04-07:
    * Update for Traverson release 2.0.0 (including `traversal.continue()`).
* 2.0.1 2015-07-29:
    * Fixes a bug with selecting embedded documents by a secondary key ([#8](https://github.com/traverson/traverson-hal/issues/8), thanks to @travi).
* 2.1.0 2015-08-27:
    * Update for Traverson release 2.1.0 (including `convertResponseToObject()`).
* 3.0.0 2015-09-15:
    * Various fixes for handling `$all`, ([#11](https://github.com/traverson/traverson-hal/pull/11), thanks to @michaelabuckley):
        * Returns an array with one element instead of a bare object if the source HAL doc has single embedded resource.
        * Return an empty array when the relation has no embedded objects for the given relation (or no embedded resources at all).
        * This is a breaking change for code that relied on the behaviour that the callback is called with an error when the relation is not present when using `$all`, now the callback is called without an error but with an empty array. This is also a breaking change for code that worked around the bug that a single element is returned when only one embedded resource was present when using `$all`.
* 4.0.0 2015-09-16:
    * Update for Traverson release 3.0.0 (including `followLocationHeader()`).
* 4.1.1 2015-11-10:
    * Update to Traverson release 3.1.0 (including `withCredentials`).
* 5.0.0 2016-12-20:
    * Drop support for Node.js 0.10 and 0.12. Node.js versions 4 to 7 are tested and officially supported.
    * All `Error` objects created by Traverson and traverson-hal now have the `name` property set, see [Traverson API docs on error names](https://github.com/traverson/traverson/blob/master/api.markdown#traverson-errors) and [traverson-hal docs on error names](#errors). ([#21](https://github.com/traverson/traverson-hal/issues/21) and [#22](https://github.com/traverson/traverson-hal/issues/22), thanks to @mimol91)
* 6.0.0 2017-02-10:
    * Update to Traverson release 6.0.1 (including auto headers).
* 6.0.1 2018-07-19:
    * Update to Traverson release 6.0.4.
* 6.0.2 2018-07-19:
    * Update `request` devDependency to avoid depending on vulnerable `hoek@4.2.0`.
* 6.0.3 2018-09-09:
    * Inject the Traverson logger into Halfred. ([#30](https://github.com/traverson/traverson-hal/issues/30))
