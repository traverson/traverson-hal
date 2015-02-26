(function() {
  /* global TraversonJsonHalAdapter */
  'use strict';

  // register HAL adapter in Traverson's media type registry
  traverson.registerMediaType(TraversonJsonHalAdapter.mediaType,
    TraversonJsonHalAdapter);

  // create a new Traverson instance to work with HAL
  var rootUri = '/';
  var api = traverson.from(rootUri);

  // HAL
  function executeHalRequest() {
    $('#json_hal_response').html('<img src="assets/spinner.gif"/>');
    api
    .jsonHal()
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
      'traverson.registerMediaType(TraversonJsonHalAdapter.mediaType, ' +
      'TraversonJsonHalAdapter);<br/>' +
      'var rootUri = \'' + rootUri + '\'<br/>' +
      'var api = traverson.from(rootUri)<br/>'
    );

    // HAL
    $('#json_hal_request').html(
      'api<br/>' +
      '.jsonHal()<br/>' +
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
