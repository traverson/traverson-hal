'use strict';

var halfred = require('halfred');

function JsonHalAdapter(log) {
  this.log = log;
}

JsonHalAdapter.errors = {
  InvalidArgumentError: 'InvalidArgumentError',
  InvalidStateError: 'InvalidStateError',
  LinkError: 'HalLinkError',
  LinkMissingOrInvalidError: 'HalLinkMissingOrInvalidError',
  EmbeddedDocumentsError: 'HalEmbeddedDocumentsError',
};

JsonHalAdapter.mediaType = 'application/hal+json';

JsonHalAdapter.prototype.findNextStep = function(t, linkObject) {
  if (typeof linkObject === 'undefined' || linkObject === null) {
    throw createError('Link object is null or undefined.',
      JsonHalAdapter.errors.InvalidArgumentError);
  }
  if (typeof linkObject !== 'object') {
    throw createError('Links must be objects, not ' + typeof linkObject +
        ': ', JsonHalAdapter.errors.InvalidArgumentError, linkObject);
  }
  if (!linkObject.type) {
    throw createError('Link objects has no type attribute.',
      JsonHalAdapter.errors.InvalidArgumentError, linkObject);
  }

  switch (linkObject.type) {
    case 'link-rel':
      return this._handleLinkRel(t, linkObject);
    case 'header':
      return this._handleHeader(t.lastStep.response, linkObject);
    default:
      throw createError('Link objects with type ' + linkObject.type +
        ' are not supported by this adapter.',
        JsonHalAdapter.errors.InvalidArgumentError, linkObject);
  }
};

JsonHalAdapter.prototype._handleLinkRel = function(t, linkObject) {
  var doc = t.lastStep.doc;
  var key = linkObject.value;

  this.log.debug('parsing hal');
  var ctx = {
    doc: doc,
    halResource: halfred.parse(doc),
    parsedKey: parseKey(key),
    linkStep: null,
    embeddedStep: null,
  };
  resolveCurie(ctx);
  findLink(ctx, this.log);
  findEmbedded(ctx, this.log);
  return prepareResult(ctx, key, t.preferEmbedded);
};

function prepareResult(ctx, key, preferEmbedded) {
  var step;
  if (preferEmbedded || ctx.parsedKey.mode === 'all') {
    step = ctx.embeddedStep || ctx.linkStep;
  } else {
    step = ctx.linkStep || ctx.embeddedStep;
  }

  if (step) {
    return step;
  } else {
    var message = 'Could not find a matching link nor an embedded document '+
      'for ' + key + '.';
    var errorName = JsonHalAdapter.errors.LinkError;
    if (ctx.linkError) {
      message += ' Error while resolving linked documents: ' + ctx.linkError;
      errorName = JsonHalAdapter.errors.LinkMissingOrInvalidError;
    }
    if (ctx.embeddedError) {
      message += ' Error while resolving embedded documents: ' +
        ctx.embeddedError;

      // traverson-hal tries to find the linked resource in the `_links`
      // section as well as in the `_embedded` section, thus, in
      // some cases (if the document has a `_links` array with a matching key as
      // well as an `_embedded` array with a matching key but no matching
      // *entry* in either of these arrays) both ctx.linkError and
      // ctx.embeddedError will be present. We only claim that it is an embedded
      // documents error if there was no matching link array or when the
      // preferEmbedded flag is set.
      if (!ctx.linkError || preferEmbedded) {
        errorName = JsonHalAdapter.errors.EmbeddedDocumentsError;
      }
    }
    message += ' Document: ' + JSON.stringify(ctx.doc);
    throw createError(message, errorName, ctx.doc);
  }
}

function parseKey(key) {
  var match = key.match(/(.*)\[(.*):(.*)\]/);
  // ea:admin[title:Kate] => access by secondary key
  if (match) {
    return {
      mode: 'secondary',
      key: match[1],
      secondaryKey: match[2],
      secondaryValue: match[3],
      index: null,
    };
  }
  // ea:order[3] => index access into embedded array
  match = key.match(/(.*)\[(\d+)\]/);
  if (match) {
    return {
      mode: 'index',
      key: match[1],
      secondaryKey: null,
      secondaryValue: null,
      index: match[2],
    };
  }
  // ea:order[$all] => meta-key, return full array
  match = key.match(/(.*)\[\$all\]/);
  if (match) {
    return {
      mode: 'all',
      key: match[1],
      secondaryKey: null,
      secondaryValue: null,
      index: null,
    };
  }
  // ea:order => simple link relation
  return {
    mode: 'first',
    key: key,
    secondaryKey: null,
    secondaryValue: null,
    index: null,
  };
}

function resolveCurie(ctx) {
  if (ctx.halResource.hasCuries()) {
    ctx.parsedKey.curie =
      ctx.halResource.reverseResolveCurie(ctx.parsedKey.key);
  }
}

function findLink(ctx, log) {
  var linkArray = ctx.halResource.linkArray(ctx.parsedKey.key);
  if (!linkArray) {
    linkArray = ctx.halResource.linkArray(ctx.parsedKey.curie);
  }
  if (!linkArray || linkArray.length === 0) {
    return;
  }

  switch (ctx.parsedKey.mode) {
    case 'secondary':
      findLinkBySecondaryKey(ctx, linkArray, log);
      break;
    case 'index':
      findLinkByIndex(ctx, linkArray, log);
      break;
    case 'first':
      findLinkWithoutIndex(ctx, linkArray, log);
      break;
    case 'all':
      // do not process $all as a link at all, go straight to the findEmbedded
      break;
    default:
      throw createError('Illegal mode: ' + ctx.parsedKey.mode,
        JsonHalAdapter.errors.InvalidArgumentError);
  }
}

function findLinkBySecondaryKey(ctx, linkArray, log) {
  // client selected a specific link by an explicit secondary key like 'name',
  // so use it or fail
  var i = 0;
  for (; i < linkArray.length; i++) {
    var val = linkArray[i][ctx.parsedKey.secondaryKey];
    /* jshint -W116 */
    if (val != null && val == ctx.parsedKey.secondaryValue) {
      if (!linkArray[i].href) {
        ctx.linkError = 'The link ' + ctx.parsedKey.key + '[' +
          ctx.parsedKey.secondaryKey + ':' + ctx.parsedKey.secondaryValue +
            '] exists, but it has no href attribute.';
        return;
      }
      log.debug('found hal link: ' + linkArray[i].href);
      ctx.linkStep = { url: linkArray[i].href };
      return;
    }
    /* jshint +W116 */
  }
  ctx.linkError = ctx.parsedKey.key + '[' + ctx.parsedKey.secondaryKey + ':' +
      ctx.parsedKey.secondaryValue +
     '] requested, but there is no such link.';
}

function findLinkByIndex(ctx, linkArray, log) {
  // client specified an explicit array index for this link, so use it or fail
  if (!linkArray[ctx.parsedKey.index]) {
    ctx.linkError = 'The link array ' + ctx.parsedKey.key +
        ' exists, but has no element at index ' + ctx.parsedKey.index + '.';
    return;
  }
  if (!linkArray[ctx.parsedKey.index].href) {
    ctx.linkError = 'The link ' + ctx.parsedKey.key + '[' +
      ctx.parsedKey.index + '] exists, but it has no href attribute.';
    return;
  }
  log.debug('found hal link: ' + linkArray[ctx.parsedKey.index].href);
  ctx.linkStep = { url: linkArray[ctx.parsedKey.index].href };
}

function findLinkWithoutIndex(ctx, linkArray, log) {
  // client did not specify an array index for this link, arbitrarily choose
  // the first that has a href attribute
  var link;
  for (var index = 0; index < linkArray.length; index++) {
    if (linkArray[index].href) {
      link = linkArray[index];
      break;
    }
  }
  if (link) {
    if (linkArray.length > 1) {
      log.warn('Found HAL link array with more than one element for ' +
          'key ' + ctx.parsedKey.key + ', arbitrarily choosing index ' + index +
          ', because it was the first that had a href attribute.');
    }
    log.debug('found hal link: ' + link.href);
    ctx.linkStep = { url: link.href };
  }
}

function findEmbedded(ctx, log) {
  log.debug('checking for embedded: ' + ctx.parsedKey.key +
      (ctx.parsedKey.index ? ctx.parsedKey.index : ''));

  var resourceArray = ctx.halResource.embeddedArray(ctx.parsedKey.key);
  if ((!resourceArray || resourceArray.length === 0) &&
       ctx.parsedKey.mode !== 'all' ) {
    return;
  }
  log.debug('Found an array of embedded resource for: ' + ctx.parsedKey.key);

  switch (ctx.parsedKey.mode) {
    case 'secondary':
      findEmbeddedBySecondaryKey(ctx, resourceArray, log);
      break;
    case 'index':
      findEmbeddedByIndex(ctx, resourceArray, log);
      break;
    case 'all':
      findEmbeddedAll(ctx, resourceArray, log);
      break;
    case 'first':
      findEmbeddedWithoutIndex(ctx, resourceArray, log);
      break;
    default:
      throw createError('Illegal mode: ' + ctx.parsedKey.mode,
        JsonHalAdapter.errors.InvalidArgumentError);
  }
}

function findEmbeddedBySecondaryKey(ctx, embeddedArray, log) {
  // client selected a specific embed by an explicit secondary key,
  // so use it or fail
  var i = 0;
  for (; i < embeddedArray.length; i++) {
    var val = embeddedArray[i][ctx.parsedKey.secondaryKey];
    /* jshint -W116 */
    if (val != null && val == ctx.parsedKey.secondaryValue) {
      log.debug('Found an embedded resource for: ' + ctx.parsedKey.key + '[' +
      ctx.parsedKey.secondaryKey + ':' + ctx.parsedKey.secondaryValue + ']');
      ctx.embeddedStep = { doc: embeddedArray[i].original() };
      return;
    }
    /* jshint +W116 */
  }
  ctx.embeddedError = ctx.parsedKey.key + '[' + ctx.parsedKey.secondaryKey +
    ':' + ctx.parsedKey.secondaryValue +
    '] requested, but the embedded array ' + ctx.parsedKey.key +
    ' has no such element.';
}

function findEmbeddedByIndex(ctx, resourceArray, log) {
  // client specified an explicit array index, so use it or fail
  if (!resourceArray[ctx.parsedKey.index]) {
    ctx.embeddedError = 'The embedded array ' + ctx.parsedKey.key +
      ' exists, but has no element at index ' + ctx.parsedKey.index + '.';
    return;
  }
  log.debug('Found an embedded resource for: ' + ctx.parsedKey.key + '[' +
      ctx.parsedKey.index + ']');
  ctx.embeddedStep = {
    doc: resourceArray[ctx.parsedKey.index].original()
  };
}

function findEmbeddedAll(ctx, embeddedArray, log) {
  var result = ctx.halResource.original()._embedded &&
      ctx.halResource.original()._embedded[ctx.parsedKey.key];
  if (!result) {
    result = [];
  } else if (! (result instanceof Array)) {
    result = [].concat(result);
  }

  ctx.embeddedStep = {
    doc: result
  };
}

function findEmbeddedWithoutIndex(ctx, resourceArray, log) {
  // client did not specify an array index, arbitrarily choose first
  if (resourceArray.length > 1) {
    log.warn('Found HAL embedded resource array with more than one element ' +
      ' for key ' + ctx.parsedKey.key +
      ', arbitrarily choosing first element.');
  }
  ctx.embeddedStep = { doc: resourceArray[0].original() };
}

JsonHalAdapter.prototype._handleHeader = function(httpResponse, link) {
  switch (link.value) {
    case 'location':
      var locationHeader = httpResponse.headers.location;
      if (!locationHeader) {
        throw createError('Following the location header but there was no ' +
          'location header in the last response.',
          JsonHalAdapter.errors.InvalidStateError);
      }
      return { url : locationHeader };
    default:
      throw createError('Link objects with type header and value ' +
        link.value + ' are not supported by this adapter.',
        JsonHalAdapter.errors.InvalidArgumentError, link);
  }
};

function createError(message, name, data) {
  var error = new Error(message);
  error.name = name;
  if (data) {
    error.data = data;
  }
  return error;
}

module.exports = JsonHalAdapter;
