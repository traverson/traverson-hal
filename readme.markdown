traverson-hal
=============

HAL adapter for Traverson
-------------------------

[![Build Status](https://travis-ci.org/basti1302/traverson-hal.png?branch=master)](https://travis-ci.org/basti1302/traverson-hal)
[![Dependency Status](https://david-dm.org/basti1302/traverson-hal.png)](https://david-dm.org/basti1302/traverson-hal)

[![NPM](https://nodei.co/npm/traverson-hal.png?downloads=true&stars=true)](https://nodei.co/npm/traverson-hal/)

| File Size (browser build) | KB   |
|---------------------------|-----:|
| minified & gzipped        |  2.9 |
| minified                  | 18   |

Introduction
------------

traverson-hal is a [Traverson](https://github.com/basti1302/traverson) plug-in that adds support for the JSON dialect of [HAL](http://tools.ietf.org/id/draft-kelly-json-hal-06), the hypertext application language to Traverson. Internally, traverson-hal uses [Halfred](https://github.com/basti1302/halfred) to work with HAL resources.

While in theory you could use Traverson even without special support for HAL by specifying each link relation with JSONPath (like `$._links.linkName`) that would be quite cumbersome. traverson-hal makes working with HAL APIs in Traverson a breeze.

Installation
------------

### Node.js

    npm install traverson traverson-hal --save

### Browser

* If you are using npm and [Browserify](http://browserify.org/): Just `npm install traverson traverson-hal --save` and include `traverson` and `traverson-hal` via `require` (see below), then browserify your module as usual - browserify will include Traverson and its dependencies for you .
* If you are using [Bower](http://bower.io): `bower install traverson traverson-hal--save`
* Otherwise you can grab a download from the [latest release](https://github.com/basti1302/traverson-hal/releases/latest). None of files includes Traverson itself, so you will also have to download a Traverson release.
    * `traverson-hal.min.js`: Minified build with UMD. This build can be used with an AMD loader like RequireJS or with a script tag (in which case it will register `TraversonJsonHalAdapter` in the global scope). **If in doubt, use this build.**
    * `traverson-hal.js`: Non-minified build with UMD. Same as above, just larger :-)
    * `traverson-hal.external.min.js`: Minified require/external build. Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson-hal`. This build could be used if you use browserify but do not want to bundle traverson-hal with your own browserify build but keep it as a separate file.
    * `traverson-hal.external.js`: Non-minified require/external build, same as before, just larger.

Usage
-----

```javascript
// require traverson and traverson-hal
var traverson = require('traverson');
var JsonHalAdapter = require('traverson-hal');

// register the traverson-hal plug-in for media type 'application/hal+json'
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

// use Traverson to follow links, as usual
traverson
.from('http://api.io')
.jsonHal()
.follow('ht:me', 'ht:posts')
.getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached our destination.')
    console.log(JSON.stringify(document))
  }
});
```

Working with HAL resources
--------------------------

Here is a more thorough explanation of the introductory example:

<pre lang="javascript">
var traverson = require('traverson');
var JsonHalAdapter = require('traverson-hal');

// register the traverson-hal plug-in for media type 'application/hal+json'
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

traverson
.from('http://haltalk.herokuapp.com/')
<b>.jsonHal()</b>
.withTemplateParameters({name: 'traverson'})
.follow('ht:me', 'ht:posts')
.getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log(JSON.stringify(document))
  }
});
</pre>

```
http://haltalk.herokuapp.com/
{
  "_links": {
    "self": {
      "href": "/"
    },
    "curies": [ ... ],
    "ht:users": {
      "href": "/users"
    },
    "ht:me": {
      "href": "/users/{name}",
      "templated": true
    }
  }
}

http://haltalk.herokuapp.com/users/traverson
{
  "_links": {
    "self": {
      "href": "/users/traverson"
    },
    "curies": [ ... ],
    "ht:posts": {
      "href": "/users/traverson/posts"
    }
  },
  "username": "traverson",
  "real_name": "Bastian Krol"
}

http://haltalk.herokuapp.com/users/traverson/posts
{
  "_links": {
    "self": { "href": "/users/traverson/posts" },
    "curies": [ ... ],
    "ht:author": { "href": "/users/traverson" }
  },
  "_embedded": {
    "ht:post": [
      {
        "_links": { "self": { "href": "/posts/526a56454136280002000015" },
          "ht:author": { "href": "/users/traverson", "title": "Bastian Krol" }
        },
        "content": "Hello! I'm Traverson, the Node.js module to work with hypermedia APIs. ...",
        "created_at": "2013-10-25T11:30:13+00:00"
      },
      {
        "_links": { "self": { "href": "/posts/526a58034136280002000016" },
          "ht:author": { "href": "/users/traverson", "title": "Bastian Krol" }
        },
        "content": "Hello! I'm Traverson, the Node.js module to work with hypermedia APIs. You can find out more about me at https://github.com/basti1302/traverson. This is just a test post. @mikekelly: Don't worry, this tests will only be run manually a few times here and there, I'll promise to not spam your haltalk server too much :-)",
        "created_at": "2013-10-25T11:37:39+00:00"
      },
      ...
    ]
  }
}
```

This will give you all posts that the account `traverson` posted to Mike Kelly's haltalk server. Note that we called `jsonHal()` on Traverson's request builder (the object returned from `traverson.from(...)` instead of the usual `traverson.from(...).json()`. When called in this way, Traverson will assume the resources it receives comply with the HAL specification and looks for links in the `_links` property. If there is no such link, traverson-hal will also look for an embedded resource with the given name. You can omit the method call to `jsonHal()` and rely on content type detection when you are sure that the server always sets the HTTP header `Content-Type: application/hal+json` in its responses. However, some HAL APIs use `Content-Type: application/json` in their responses although the return HAL resources.

You can also pass strings like `'ht:post[name:foo]'` to the `follow` method to select links (which share the same link relation) by a secondary key. Because multiple links with the same link relation type are represented as an array of link objects in HAL, you can also use an array indexing notation like `'ht:post[1]'` to select an individual elements from an array of link objects. However, this is not recommended and should only be used as a last resort if the API does not provide a secondary key to select the correct link, because it relies on the ordering of the links as returned from the server, which might not be guaranteed to be always the same.

You can also use the array indexing notation `'ht:post[1]'` to target individual elements in an array of embedded resources.

#### Embedded Documents

When working with HAL resources, for each link given to the `follow` method, traverson-hal checks the `_links` object. If the `_links` object does not have the property in question, traverson-hal also automatically checks the embedded document (the `_embedded` object). If there is an embedded document with the correct property key, this one will be used instead. If there is both a `_link` and an `_embedded` object with the same name, traverson-hal will prefer the link by default, not the embedded object (reason: the spec says that an embedded resource may "be a full, partial, or inconsistent version of the representation served from the target URI", so to get the complete and up to date document your best bet is to follow the link to the actual resource, if available). This behaviour can be configured by calling `preferEmbeddedResources()` on the request builder object, which will make traverson-hal prefer the embedded resource over following a link.

Link relations can denote a single embedded document as well as an array of embedded documents. Therefore, the same mechanisms that are used to select an individual link from an array of link objects can also be used with embedded arrays. That is, you can always use `'ht:post[name:foo]'` or `'ht:post[1]'`, no matter if the link relation is present in the `_links` object or in the `_embedded` object.

For embedded arrays you can additionally use the meta selector `$all`: If you pass `ht:post[$all]` to the `follow` method, you receive the complete array of posts, not an individual post resource. A link relation containing `$all` must only be passed as the last element to `follow` and it only works for embedded documents. Futhermore, it can only be used with `get` and `getResource`, not with `post`, `put`, `delete`, `patch` or `getUri`.

### HAL and JSONPath

JSONPath is not supported when working with HAL resources. It would also make no sense because in a HAL resource there is only one place in the document that contains all the links.

Release Notes
-------------

* 2.1.0 2015-08-27
    * Update for Traverson release 2.1.0 (including `convertResponseToObject()`).
* 2.0.1 2015-07-29
    * Fixes a bug with selecting embedded documents by a secondary key ([#8](https://github.com/basti1302/traverson-hal/issues/8), thanks to @travi).
* 2.0.0 2015-04-07
    * Update for Traverson release 2.0.0 (including `traversal.continue()`).
* 1.2.0 2015-03-15
    * Update for Traverson release 1.2.0 (including change media type plug-in api, namely rename of `step.uri` to `step.url`).
    * Added support for `preferEmbeddedResources()` to configure Traverson to prefer embedded resources over following links (#5).
* 1.1.0 2015-03-04
    * Update for Traverson release 1.1.0.
    * Less restrictive peer dependency.
* 1.0.0 2015-02-27
    * Initial release as a separate Traverson media type plug-in.

License
-------

MIT
