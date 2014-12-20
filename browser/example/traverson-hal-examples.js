'use strict';

(function() {

  // register HAL adapter in Traverson's media type registry
  traverson.registerMediaType(
    TraversonJsonHalAdapter.mediaType, TraversonJsonHalAdapter);

  // create a new Traverson instance to work with HAL
  var rootUri = '/';
  var jsonHalApi = traverson.jsonHal.from(rootUri);

  // HAL
  function executeHalRequest() {
    $('#json_hal_response').html('<img src="assets/spinner.gif"/>');
    jsonHalApi
        .newRequest()
        .withRequestOptions({ headers: { 'accept': 'application/hal+json' } })
        .follow('first', 'second', 'inside_second')
        .getResource(function(err, resource) {
      if (err) {
        $('#json_hal_response').html(JSON.stringify(err));
        return;
      }
      $('#json_hal_response').html(JSON.stringify(resource, null, 2));
    });
  }

  $(document).ready(function () {
    $('#btn-hal').on('click', executeHalRequest);
    $('#general').html(
      'traverson.registerMediaType(TraversonJsonHalAdapter.mediaType, TraversonJsonHalAdapter);<br/>' +
      'var rootUri = \'' + rootUri + '\'<br/>' +
      'var jsonHalApi = traverson.<i>jsonHal</i>.from(rootUri)<br/>'
    );

    // plain vanilla link following
    $('#plain_vanilla_request').html(
      'jsonApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
      '})<br/>' +
      '.follow(\'second\', \'doc\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    );

    // JSONPath
    $('#jsonpath_request').html(
      'jsonApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
      '})<br/>' +
      '.follow(\'$.jsonpath.nested.key\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    );

    // URI templates
    $('#uri_template_request').html(
      'jsonApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
      '})<br/>' +
      '.follow(\'uri_template\')<br/>' +
      '.withTemplateParameters({param: \'foobar\', id: 13})<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    );

    // HAL
    $('#json_hal_request').html(
      'jsonHalApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/hal+json\' }<br/>' +
      '})<br/>' +
      '.follow(\'first\', \'second\', \'inside_second\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    );
  });
})();
