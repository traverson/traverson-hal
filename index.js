'use strict';

var halfred = require('halfred');

function JsonHalAdapter(log) {
  this.log = log;
}

JsonHalAdapter.mediaType = 'application/hal+json';

// TODO Pass the traversal state into the adapter... and possibly also only
// modify it, do not return anything.
JsonHalAdapter.prototype.findNextStep = function(doc, key, preferEmbedded) {
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
  return prepareResult(ctx, key, preferEmbedded);
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
    if (ctx.linkError) {
      message += ' Error while resolving linked documents: ' + ctx.linkError;
    }
    if (ctx.embeddedError) {
      message += ' Error while resolving embedded documents: ' +
        ctx.embeddedError;
    }
    message += ' Document: ' + JSON.stringify(ctx.doc);

    throw new Error(message);
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
    default:
      throw new Error('Illegal mode: ' + ctx.parsedKey.mode);
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
  if (!resourceArray || resourceArray.length === 0) {
    return null;
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
      findEmbeddedAll(ctx);
      break;
    case 'first':
      findEmbeddedWithoutIndex(ctx, resourceArray, log);
      break;
    default:
      throw new Error('Illegal mode: ' + ctx.parsedKey.mode);
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

function findEmbeddedAll(ctx) {
  ctx.embeddedStep = {
    doc: ctx.halResource.original()._embedded[ctx.parsedKey.key]
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

module.exports = JsonHalAdapter;
