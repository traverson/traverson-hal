'use strict';

/*
 * Used by test/json_hal.js
 */

var embeddedOrders = [{
  '_links': {
    'self': { 'href': '/orders/123' },
    'ea:basket': { 'href': '/baskets/987' },
    'ea:customer': { 'href': '/customers/654' }
  },
  'total': 30.00,
  'currency': 'USD',
  'status': 'shipped'
}, {
  '_links': {
    'self': { 'href': '/orders/124' },
    'ea:basket': { 'href': '/baskets/321' },
    'ea:customer': { 'href': '/customers/42' }
  },
  'total': 20.00,
  'currency': 'USD',
  'status': 'processing'
}];

var embeddedWithoutSelfLink = {
  '_links': {
  },
};

var embeddedAdmins = [{
  '_links': {
    'self': { 'href': '/admins/2' }
  },
  'title': 'Fred',
  'name': 'Freddy'
}, {
  '_links': {
    'self': { 'href': '/admins/5' }
  },
  'title': 'Kate',
  'name': 'Catharina'
}];

module.exports = {
  root: {
    '_links': {
      'self': { 'href': '/' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:orders': { 'href': '/orders' }
    }
  },

  embeddedOrders: embeddedOrders,

  embeddedAdmins: embeddedAdmins,

  orders: {
    '_links': {
      'self': { 'href': '/orders' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'next': { 'href': '/orders?page=2' },
      'ea:find': { 'href': '/orders{/id}', 'templated': true },
      'ea:admin': [{
        'href': '/admins/2',
        'title': 'Fred'
      }, {
        'href': '/admins/5',
        'title': 'Kate',
        'name': 'boss'
      }, {
        'name': 'no-href'
      }],
      // to test robustness against shadowing by links when using embedded/$all
      'ea:link_and_embedded_admin': embeddedAdmins[0]._links.self

    },
    'currentlyProcessing': 14,
    'shippedToday': 20,
    '_embedded': {
      'ea:order': embeddedOrders,
      'ea:admin': embeddedAdmins, // to test preferEmbedded
      // to test $all with a single object
      'ea:single_embedded_admin': embeddedAdmins[0],
      // to test robustness against shadowing by links when using embedded/$all
      'ea:link_and_embedded_admin': embeddedAdmins[0],
    }
  },

  admin2: {
    '_links': {
      'self': { 'href': '/admins/2' }
    },
    'name': 'Fred'
  },
  admin5: {
    '_links': {
      'self': { 'href': '/admins/5' }
    },
    'name': 'Kate'
  },

  basket: {
    basket: 'empty'
  },
  basket1: {
    '_links': {
      'self': { 'href': '/baskets/987' }
    },
    'much': 'items'
  },
  basket3: {
    '_links': {
      'self': { 'href': '/baskets/321' }
    },
    'wow': 'such prices'
  },

  singleOrder: {
    '_links': {
      'self': { 'href': '/orders/13' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:customer': { 'href': '/customers/4711' },
      'ea:basket': { 'href': '/baskets/4712' }
    },
    'total': 30.00,
    'currency': 'USD',
    'status': 'shipped'
  },

  embeddedWithoutSelfLink: embeddedWithoutSelfLink,

  customer: {
    '_links': {
      'self': { 'href': '/customer/4711' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }]
    },
    'first_name': 'Halfred',
    'last_name': 'Halfredson',
    '_embedded': {
      'ea:no_self_link': embeddedWithoutSelfLink
    }
  }
};
