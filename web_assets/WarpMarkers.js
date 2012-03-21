/*
MapMarkers Minecraft Bukkit plugin for showing Essentials warps 
and warp events on maps generated by Minecraft Overviewer.
Copyright (C) 2011 Brendan Johan Lee 
Email: brendan (at) vanntett.net
Contributions by: 

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, 
MA  02110-1301, USA.
*/

var warpmarkers = {

    /* Configuration options */

    'refreshrate': 5000, /* How often the script checks for an update in miliseconds */
    'show_notifications': true, /* Set this to false to turn of all notifications (events, start, stop) */
    'marker_image': "cropcircles.png", /* Image file used for markers */
    'marker_shadow': "marker_shadow.png", /* Image file used for marker shadows */
    'warp_icon': "warp.jpg", /* Icon showed in popups and notifications */
    'on_by_default': true, /* Should warppoints be shown on the map  by default, or only when user pushes the button */
    'warpmarkers_file': "warpmarkers.json", /*The location of the main warpmarkers json file*/
    'warpupdates_file': "warpupdates.json", /*The location of the warpmarkers updates json file*/
    'world' : '', /*The name of the world that warps should be displayed for. Leave blank for all worlds.*/

    /* End configuration options */

    'interval': null,
    'msg_timeout': null,
    'warps' : [],
    'info_windows' : [],
    'handled_updates' : [],
    'is_showing' : false,
    'show_warps': function() {
	$.ajax({
	    url: 'warpmarkers.json',
	    dataType: 'json',
	    success: function(data) {
		$.each(data, function(key, val) {
		    if (warpmarkers.warps[val.name] == undefined && (val.world == warpmarkers.world || warpmarkers.world == '')) {
			var image = new google.maps.MarkerImage(warpmarkers.marker_image,
								new google.maps.Size(32.0, 37.0),
	 							new google.maps.Point(0, 0),
	 							new google.maps.Point(16.0, 37.0)
	 						       );
	 		var shadow = new google.maps.MarkerImage(warpmarkers.marker_shadow,
	 							 new google.maps.Size(51.0, 37.0),
	 							 new google.maps.Point(0, 0),
	 							 new google.maps.Point(16.0, 37.0)
	 							);
			var loc = overviewer.util.fromWorldToLatLng(val.x,val.y,val.z,overviewer.mapView.options.currentTileSet);
			warpmarkers.info_windows[val.name] = new google.maps.InfoWindow({
	 		    content: "<div class=\"infoWindowContainer\"><img src=\""+warpmarkers.warp_icon+"\" style=\"margin-right:5px;\"/><div class=\"infoWindowText\"><strong>"+val.name+"</strong><br/>Created by: "+val.createdby+" "+val.createdtime+"<br />Last used by: "+val.accessedby+" "+val.accessedtime+"</div></div>"
	 		});
	 		warpmarkers.info_windows[val.name].setPosition(loc);
	 		warpmarkers.warps[val.name] = new google.maps.Marker();
	 		warpmarkers.warps[val.name].setTitle(val.name);
	 		warpmarkers.warps[val.name].setIcon(image);
	 		warpmarkers.warps[val.name].setShadow(shadow);
	 		warpmarkers.warps[val.name].setPosition(loc);
	 		warpmarkers.warps[val.name].setMap(overviewer.map);
	 		google.maps.event.addListener(warpmarkers.warps[val.name], 'click', function() {
	 		    if(warpmarkers.info_windows[val.name].getMap()){
					warpmarkers.info_windows[val.name].close();
			    }
			    else {
					warpmarkers.info_windows[val.name].open(overviewer.map);
			    }
	 		});
	 	    }
		});
	    }
	});	
    },
    'update_warps': function() {
	$.ajax({
	    url: 'warpupdates.json',
	    dataType: 'json',
	    success: function(data) {
		var updateNeeded = false;
		$.each(data, function(key, val) {
		    if (warpmarkers.handled_updates[val.uid] == undefined) {
			warpmarkers.handled_updates[val.uid] = true;
			var message = 'Just received a non-defined update status. If you have upgraded WarpMarkers, please copy all of the files in web_assets to your minecraft overviewer web_assets folder and run minecraft overviewer.';
			if (val.type==0) {
			    message = "<strong>"+val.by+"</strong> just warped to <strong>"+val.name+"</strong>";
			} else if (val.type==1) {
			    message = "<strong>"+val.by+"</strong> just created or moved <strong>"+val.name+"</strong>";
			} else if (val.type==2) {
			    message = "<strong>"+val.by+"</strong> just deleted <strong>"+val.name+"</strong>";
			}
			if (warpmarkers.show_notifications) {
			    $.gritter.add({
				title: 'WarpMarkers:',
				text: message,
				image: warpmarkers.warp_icon
			    });
			}
			updateNeeded = true;
		    }
		});
		if (updateNeeded && warpmarkers.is_showing == true) {
		    warpmarkers.hide_warps();
		    warpmarkers.show_warps();
		}
	    }
	});
    },
    'hide_warps': function() {
	for (var i in warpmarkers.warps) {
	    if (warpmarkers.warps[i] != undefined) {
	 	warpmarkers.warps[i].setMap(null);
	 	warpmarkers.warps[i] = undefined;
	    }
	    if (warpmarkers.info_windows[i] != undefined) {
	 	warpmarkers.info_windows[i] = undefined;
	    }	    
	}
    },
    'toggle': function() {
	if (warpmarkers.is_showing == false) {
	    warpmarkers.show_warps();
	    if (warpmarkers.show_notifications) {
		$.gritter.add({
		    title: 'WarpMarkers:',
		    text: 'Showing warps on map',
		    image: warpmarkers.warp_icon
		});
	    }
	    warpmarkers.is_showing = true;
	} else {
	    warpmarkers.hide_warps();
	    warpmarkers.interval = null;
	    if (warpmarkers.show_notifications) {
		$.gritter.add({
		    title: 'WarpMarkers:',
		    text: 'Not showing warps on map anymore',
		    image: warpmarkers.warp_icon
		});
	    }
	    warpmarkers.is_showing = false;
	}
    },
    'init': function() {
	var warpMarkerContainer = $('<div id="warpMarkerContainer" class="customControl" title=\"Warps\"></div>');
	var warpMarkerControl = $('<div id="warpMarkerControl" class="top"></div>');
	var warpMarkerControlButton = $('<div id="warpMarkerControlButton" class="button">Warps</div>');
	warpMarkerControl.append(warpMarkerControlButton);
	warpMarkerContainer.append(warpMarkerControl);
	warpMarkerControlButton.click(function() {
	    warpmarkers.toggle();
	});
	if (warpmarkers.on_by_default) {
	    warpmarkers.toggle();
	}
	overviewer.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(warpMarkerContainer[0]);
	warpmarkers.interval = window.setInterval(warpmarkers.update_warps, warpmarkers.refreshrate);
    }
}
