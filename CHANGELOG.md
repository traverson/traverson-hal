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

