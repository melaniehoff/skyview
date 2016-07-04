///////////////////
///////////////////

'use strict';

function log() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var message = args.join(' ');
  $('#log').prepend('--&gt; ' + message + '<br>');
}

function warn() {
  log.apply(undefined, arguments);
  $('#log').addClass('warn');
}

function hideLog() {
  $('#log').hide();
}

function showLog() {
  $('#log').show();
}

function clearLog() {
  $('#log').empty();
}

window.onerror = function (error) {
  $('#log').addClass('error').text('Error: ' + error);
};

function checkSupportFor(name, propertyName) {
  var propertyOwner = arguments.length <= 2 || arguments[2] === undefined ? window : arguments[2];

  if (!(propertyName in propertyOwner)) {
    warn('No support for ' + name);
  } else {
    log('Supports ' + name + '!');
    return true;
  }
}

function isInIframe() {
  return window.parent !== window;
}

$(function () {
  //log('Ready!');
  showLog();
  $('#clear-log').click(clearLog);
});

//////////////////
//////////////////

function getPositionOptions() {
  var positionOptions = {
    enableHighAccuracy: false, // when true, a more accurate position is
    // returned when possible (may take longer or use more battery power)
    timeout: Infinity, // will never stop attempting to locate
    maximumAge: 0 };
  // can use a cached/old position
  return positionOptions;
}

function watchPosition() {
  //log('Attempting to start watching...');

  var watchId = navigator.geolocation.watchPosition(locateSuccess, locateError, getPositionOptions());

  $('#stop-watch').show();
  $('#stop-watch').data('watchId', watchId);
  $('#watch').hide();
}

// See http://www.html5rocks.com/en/tutorials/geolocation/trip_meter/#disqus_thread
// http://www.movable-type.co.uk/scripts/latlong.html
function calculateDistance(coords1, coords2) {
  var lat1 = coords1.latitude;
  var lon1 = coords1.longitude;
  var lat2 = coords2.latitude;
  var lon2 = coords2.longitude;

  var toRad = function toRad(number) {
    return number * Math.PI / 180;
  };

  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function getStreetView(coords) {
  var latitude = coords.latitude;
  var longitude = coords.longitude;
  var heading = coords.heading;
  if (!heading) {
    heading = lastHeading;
  }

  if (!heading) {
    heading = 0;
  }


  return "https://maps.googleapis.com/maps/api/streetview?size=2000x700&location=" + latitude + "," + longitude + "&heading=" + heading + "&fov=120&pitch=90&key=AIzaSyBkyqO7gZEog5fj5WyDW_JLvPBmpuM5ZfI";
  console.log('streetview');
}

var lastHeading;

window.onload = function locate() {
  log('Attempting to locate...');
  navigator.geolocation.watchPosition(locateSuccess, locateError, getPositionOptions());
  //console.log('street');
}



function locateSuccess(position) {
  //log('successfully located you!');

  if (!startCoords) {
    startCoords = position.coords;
  }
  currentCoords = position.coords;
  if (position.coords.heading) {
    lastHeading = position.coords.heading;
  }

  $('#location').show();
  $('#no-location').hide();

  var properties = ['latitude', 'longitude', 'altitude', 'heading', 'speed', 'accuracy'];



  properties.forEach(function (property) {
    var value = position.coords[property];
    $('#' + property).text(value);
  });
  var timestamp = new Date(position.timestamp);
  $('#timestamp').text(timestamp);

  $('#static-map-image').attr('src', getStreetView(position.coords));
  $('#static-map-image').css('height','100%');
  $('#static-map-image').css('width','100%');
  $('#distance').text(calculateDistance(startCoords, currentCoords));
  $('#info').css('width','100%');
  // $('#video').css('margin','0','auto');
  // $('#video').css('padding','100px');


 
}

function locateError(error) {
  log('Error locating you: ' + error);

  $('#location-error').show();
  $('#location-error').text('Error locating: ' + error);
}

function stopWatching() {
  var watchId = $('#stop-watch').data('watchId');
  //log('stop watching id:', watchId);

  navigator.geolocation.clearWatch(watchId);

  $('#stop-watch').hide();
  $('#watch').show();
}

var startCoords = undefined;
var currentCoords = undefined;


$(function () {
  $('#watch').click(watchPosition);
  $('#stop-watch').click(stopWatching);
  $('#locate').click(locate);
});