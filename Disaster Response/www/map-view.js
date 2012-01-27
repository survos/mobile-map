// If you want to prevent dragging, uncomment this section
/*
 function preventBehavior(e) 
 { 
 e.preventDefault(); 
 };
 document.addEventListener("touchmove", preventBehavior, false);
 */

/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
 see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
 for more details -jm */
/*
 function handleOpenURL(url)
 {
 // TODO: do something with the url passed in.
 }
 */

/*
 * OpenLayers.Map
 */
var map;

var navSymbolizer = new OpenLayers.Symbolizer.Point({
	pointRadius : 10,
	externalGraphic : "css/images/15x15_Blue_Arrow.png",
	fillOpacity: 1,
	rotation: 0
	});
});

var navStyle = new OpenLayers.StyleMap({
	"default" : new OpenLayers.Style(null, {
		rules : [ new OpenLayers.Rule({
					symbolizer : navSymbolizer
				})]
	})
});

var navigationLayer = new OpenLayers.Layer.Vector("Navigation Layer",
{
  styleMap: navStyle
});


var WGS84 = new OpenLayers.Projection("EPSG:4326");
var WGS84_google_mercator = new OpenLayers.Projection("EPSG:900913");
var maxResolution = 15543.0339;
var maxExtent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508);
var restrictedExtent = maxExtent.clone();

var touchNavOptions = {
dragPanOptions: {
interval: 0, //non-zero kills performance on some mobile phones
enableKinetic: true
}
};


var rotatingTouchNav = new OpenLayers.Control.TouchNavigation(touchNavOptions);

var options = {
div: "map",
projection: WGS84,
	numZoomLevels : 20,
maxResolution: maxResolution,
maxExtent: maxExtent,
restrictedExtent: restrictedExtent,
controls: [
		   rotatingTouchNav
		   ]
};

/*var gimmyHeading = 315;
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
	defaultHandlerOptions: {
		'single': true,
		'double': false,
		'pixelTolerance': 0,
		'stopSingle': false,
		'stopDouble': false
	},
					
	initialize: function(options) {
		this.handlerOptions = OpenLayers.Util.extend(
		 {}, this.defaultHandlerOptions
		);
		OpenLayers.Control.prototype.initialize.apply(
		  this, arguments
		); 
		this.handler = new OpenLayers.Handler.Click(
			this, {
				'click': this.trigger
			}, this.handlerOptions
		);
	}, 
											
	trigger: function(e) {
		//navSymbolizer.rotation += 10;
		//navigationLayer.redraw();
									
		//Rotate map
											var heading = gimmyHeading;
											var mapRotation = 360 - heading;
											var diff = (-1 * mapRotation) - map.events.rotationAngle;
											if(diff > -180)
											$("#map").animate({rotate: mapRotation + 'deg'}, 1000);
											else
											$("#map").animate({rotate: (-1 * heading) + 'deg'}, 1000);
											
											map.events.rotationAngle = -1 * mapRotation;
											gimmyHeading = 90;
	}
										
});*/


function onBodyLoad()
{		
    document.addEventListener("deviceready", onDeviceReady, false);
}

var geolocationSuccess = function(position){
	var lon = position.coords.longitude;
	var lat = position.coords.latitude;
	
	var currentPoint = new OpenLayers.Geometry.Point(lon, lat).transform(WGS84, WGS84_google_mercator);
	var currentPosition = new OpenLayers.Feature.Vector(currentPoint);
	
	navigationLayer.removeAllFeatures();
	navigationLayer.addFeatures([currentPosition]);
	
	map.setCenter(new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude)
				  .transform(WGS84, WGS84_google_mercator), 17);
    
    //iPhone Quirks
    //  position.timestamp returns seconds instead of milliseconds.
}

var geolocationError = function(error){
	//error handling
}

var compassSuccess = function(heading){
	//Rotate arrow
	/*navSymbolizer.rotation = heading.magneticHeading;
	navigationLayer.redraw();*/
	
	//Rotate map
	var heading = heading.magneticHeading;
	var mapRotation = 360 - heading;
	var diff = (-1 * mapRotation) - map.events.rotationAngle;
	if(diff > -180)
		$("#map").animate({rotate: mapRotation + 'deg'}, 1000);
	else
		$("#map").animate({rotate: (-1 * heading) + 'deg'}, 1000);
	
	map.events.rotationAngle = -1 * mapRotation;
}

var compassError = function(error){
	//error handling
	if(error.code == CompassError.COMPASS_INTERNAL_ERR)
		alert("compass internal error");
	else if(error.code == CompassError.COMPASS_NOT_SUPPORTED)
		alert("compass not supported");
	
}

/* When this function is called, PhoneGap has been initialized and is ready to roll */
/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
 see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
 for more details -jm */

var plugin;
function onDeviceReady()
{
    //Now that the device is ready, lets set up our event listeners.
        document.addEventListener("pause"  , onAppPause  , false);
        document.addEventListener("resume" , onAppResume , false);
        document.addEventListener("online" , onAppOnline , false);
        document.addEventListener("offline", onAppOffline, false);
        window.addEventListener("batterycritical", onBatteryCritical, false);
        window.addEventListener("batterylow"     , onBatteryLow     , false);
        window.addEventListener("batterystatus"  , onBatteryStatus  , false);
    
    //ChildBrowser code to open Google.com
        //var cb = ChildBrowser.install();
        //if(cb != null) { window.plugins.childBrowser.showWebPage("http://google.com"); }
    
	// The Local Database (global for a reason)
	try {
		if (!window.openDatabase) {
			// Do we need to support this?
			navigator.notification.alert('Local databases not supported');
		}
		else {
			// Open or create a 3MB database and store in global variable
			sqlDb = window.openDatabase('mobdisapp', '0.1', 'MobDisAppDB', 3145728);
			createStatusRefTable(sqlDb);
			createQueueTable(sqlDb);
		}
	}
	catch (e) {
		// Do we need to handle this?
		navigator.notification.alert('Error opening database: ' + e);
	}

	// do your thing!
	var docHeight = $(window).height();
	var headerHeight = $("#header").height();
	var footerHeight = $("#footer").height();
	var mapHeight = docHeight - headerHeight - footerHeight - 50;
	
	var mapContainer = $("#mapContainer");
	mapContainer.height(mapHeight +"px");
	var mapDiv = $("#map");
	mapHeight = mapHeight*1.7;
	mapDiv.height(mapHeight+"px");
	mapDiv.width(mapHeight+"px");

	var mapLeftPosition = -1 * (mapDiv.width()-mapContainer.width()) / 2;
	var mapTopPosition = -1 * (mapDiv.height()-mapContainer.height()) / 2;
	mapDiv.css('top', mapTopPosition);
	mapDiv.css('left', mapLeftPosition);
	
	map = new OpenLayers.Map(options);
	map.events.mapSideLength = mapHeight;
	
	var mapLayerOSM = new OpenLayers.Layer.OSM();
	map.addLayers([mapLayerOSM, navigationLayer]);
	
	navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, 
	{
		enableHighAccuracy: true,
		maximumAge: 3000
	});
	
	var compassOptions = {
		frequency: 3000
	};
	
	//navigator.compass.watchHeading(compassSuccess, compassError, compassOptions);
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, 
	{
		defaultHandlerOptions : 
		{
			'single' : true, 'double' : false, 'pixelTolerance' : 0, 'stopSingle' : false, 'stopDouble' : false 
		},
		initialize : function (options) 
		{
			this.handlerOptions = OpenLayers.Util.extend( {}, this.defaultHandlerOptions );
			OpenLayers.Control.prototype.initialize.apply( this, arguments );
			this.handler = new OpenLayers.Handler.Click( this, {
				'click' : this.trigger 
			},
			this.handlerOptions );
		},
		trigger : function (e) 
		{
			var lonlat = map.getLonLatFromViewPortPx(e.xy);
			navigator.camera.getPicture(function (imageURI) 
			{
				insertToLocationQueueTable(sqlDb, lonlat.lon, lonlat.lat, null, imageURI, null);
				// TODO: This sometimes flashes the map
				$.mobile.changePage('#queue-dialog', 'pop');
			},
			function () { },
			{
				quality : 100,
				destinationType : Camera.DestinationType.FILE_URI,
				// DEBUG: This should be CAMERA to force a new pic
				sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
				allowEdit : false
			});
		}
	});

	var zoomPanel = new OpenLayers.Control.ZoomPanel({div: document.getElementById("zoomPanel")});
	map.addControl(zoomPanel);
	var zoomRight = .05 * mapHeight;
	$("#zoomPanel").css("right", "5%");
	$("#zoomPanel").css("bottom", zoomRight + "px");

	var click = new OpenLayers.Control.Click();
	map.addControl(click);
	click.activate();

	$('#queue-dialog').on('pageshow', function() {
		// TODO: more efficient to keep a 'dirty' flag telling us when we need to clear/update
		// rather than doing it every time.
		clearQueueDialog();
		forAllLocations(sqlDb, addToQueueDialog);
	});
}

function clearQueueDialog() {
	$('#queue-dialog li').not('#queue-list-item-archetype').remove();
}

function addToQueueDialog(locRow) {
	var $clone = $('#queue-list-item-archetype').clone();	
	$clone.removeAttr('id');
	$clone.find('img').attr('src', locRow.photo);

	if (locRow.status >= 1) {
		$clone.find('h3').text(StatusRef.fromId(locRow.status).toString());
	}

	$clone.attr('rowid', locRow.id);
	$('#queue-dialog ul').append($clone);
	$clone.show();
}

function hideQueueItemDelete(e) {
	$('#queue-item-delete').hide();
}

function showQueueItemDelete(e) {
	var $del = $('#queue-item-delete');
	$del.attr('rowid', $(this).attr('rowid'));
	$del.show();
	$del.position({
		my:	'right center',
		at:	'right center',
		of:	$(this),
		offet:'0, 0'
	});
}

$(document).ready(function() {
	$(document).click(function() {
		$('#queue-item-delete').hide();
	});

	var $queue_item;

	// TODO: Why do some of these only work with live() and not on() ?
	$('.queue-list-item').live('click', function(e) {
		$queue_item = $(this);
	});

	$('.queue-list-item').live('swipeleft', showQueueItemDelete)
	$('.queue-list-item').live('swiperight', hideQueueItemDelete);
	$('.queue-list-item').live('blur', hideQueueItemDelete);

	$('#queue-item-delete').live('click', function(e) {
		var id = $(this).attr('rowid');
		deleteLocation(sqlDb, id);
		$(this).hide();
		$('.queue-list-item').filter('[rowid="' + id + '"]').remove();
	});

	$('.status-list-item').on('click', function(e) {
		// See the text for the currently selected queue list item
		var $h3 = $queue_item.find('h3');
		$h3.text($(this).text());
		
		// Store back to local DB
		var id = $queue_item.attr('rowid');
		updateLocationStatus(sqlDb, id, $(this).attr('status-ref'));
	});

	$('.status-submit-button').on('click', function(e) {
		var valid = 0;
		var items = new Array();
		// TODO: this should probably be a class we search for, not h3
		$('#queue-dialog li').find('h3').filter(':visible').each(function() {
			if ($(this).text() !== 'Select a Status') {
				++valid;
				items.push($(this));
			}
		});

		if (valid === 0) {
			navigator.notification.alert('You must set the status for at least one location');
			e.preventDefault();
			e.stopPropagation();
			$(this).removeClass('ui-btn-active');
		}
		else {
			var names = 'Submitted';
			items.forEach(function(elem) {
				// Submit them to the server - if successful remove from local database
				names += '\n' + $(elem).text();
			});
			navigator.notification.alert(names, function() { }, 'Debug', 'Okay');
		}		
	});
});

/*
        ==============================================
                      Plugin Callbacks
        ==============================================
 */
function getDeviceUIDSuccess(device) {
    alert(10); //return device.uid;
}

/*
        ==============================================
                  Event Listener Callbacks
        ==============================================

    When the application is put into the background via the home button, phone call, app switch, etc. it is paused. Any Objective-C code or PhoneGap code (like alert()) will not run. This callback will allow us to pause anything we need to to avoid time based errors.
 
 */
function onAppPause() {
    
}

/*
    When the user resumes the app from the background this callback is called, allowing us to resume anything that we stopped.
 */
function onAppResume() {
    
}

/*
    Whenever the device connects to the internet this function will be called. This allows us to know when to update our fusion tables online as well as when to start updating the map again.
    #QUIRK: Durring the inital startup of the app, this will take at least a second to fire.
 */
function onAppOnline() {
    
}

/*
    This function is called whenever the device loses internet connection (be it WiFi or 3G or EDGE). With this we can keep the current map tiles cached to avoid losing them.
    #QUIRK: Durring the inital startup of the app, this will take at least a second to fire.
 */
function onAppOffline() {
    
}

/*
    Called when the device hits the critical level threshold. This is device specific. (10 on iDevices)
 */
function onBatteryCritical(info) {
    //info.level = % of battery (0-100).
    //info.isPlugged = true if the device is plugged in.
}

/*
    Called when the device hits the low level threshold. This is device specific. (20 on iDevices).
 */
function onBatteryLow(info) {
    //info.level = % of battery (0-100).
    //info.isPlugged = true if the device is plugged in.
}

/*
    Whenever the battery changes status (either info.level changes by one, or info.isPlugged is toggled) this function is called.
    Example: If they plug in, that means they have power where they are. The building locations that are close by are now operational (if they weren't already labled as such).
 */
function onBatteryStatus(info) {
    //info.level = % of battery (0-100).
    //info.isPlugged = true if the device is plugged in.
}
