// An empty array of camps and their locations built for the api call.  Format should look like the below when populated
//   {
//   name: "Nantes",
//   location: [47.2184, -1.5536]
//   }
var camps = [];
var parks = [];
// An array which will be used to store created camp markers
var campMarkers = L.markerClusterGroup();
var parkMarkers = L.markerClusterGroup();

var parkIcon = L.Icon.extend({
  options: {
      iconSize:     [32, 37],
      iconAnchor:   [16, 37],
      popupAnchor:  [0, -45]
  }
});
var realParkIcon = new parkIcon({iconUrl: 'riparianhabitat.png'})

var campIcon = L.Icon.extend({
  options: {
      iconSize:     [32, 37],
      iconAnchor:   [16, 37],
      popupAnchor:  [0, -45]
  }
});
var realCampIcon = new campIcon({iconUrl: 'campfire-2.png'})



// Testing objects, here for posterity
// var tcg1 = {
//   "name": "277 North Campground",
//   "location": [29.51187, -100.907479]
// };
// var tcg2 = {
//   "name": "Adirondack Shelters",
//   "location": [39.677404, -77.48308]
// };
// var test = [tcg1, tcg2];



// URL for parks dept api, adds api key stored in config.js
var campsURL = "https://developer.nps.gov/api/v1/campgrounds?limit=1000&api_key=" + PARKS_KEY;
var parksURL = "https://developer.nps.gov/api/v1/parks?limit=1000&api_key=" + PARKS_KEY;

d3.json(parksURL).then((p_response) => {

  for (var i = 0; i < p_response.data.length; i++) {
    
    if (p_response.data[i].latitude != ""){
      var p_lat = parseFloat(p_response.data[i].latitude);
      var p_lng = parseFloat(p_response.data[i].longitude);
      var p_description = p_response.data[i].description
      var designation = p_response.data[i].designation
      var pUrl = p_response.data[i].url
      var p_name = p_response.data[i].fullName;
      var p_location = [p_lat, p_lng]
      var p_obj = {
        name: p_name,
        location: p_location,
        description: p_description,
        designation: designation,
        pUrl: pUrl
      }
      parks.push(p_obj) 
    } else {
      continue;
    }
  };


  for (var i = 0; i < parks.length; i++) {
    // loop through the parks array, create a new marker, push it to the camps markers array
    parkMarkers.addLayer(
      L.marker(parks[i].location, {icon: realParkIcon})
      .bindPopup("<h2>" + parks[i].name + "</h2><h3>" + parks[i].designation + "</h3><p>" + parks[i].description + `</p><a href=${parks[i].pUrl}>` + parks[i].pUrl + "</a>")
    );
    
  }


                  // Feeding the api url into d3 and getting the JSON as a response
                  d3.json(campsURL).then((response) => {
                    
                    
                    

                    // For loop to run the length of data in the response
                    for (var i = 0; i < response.data.length; i++) {

                          // Some camps do not have a lat lng listed, so we only want to append our camps list with camps who's lat lng are listed.  If they do not have a value the loop continues
                          if (response.data[i].latitude != ""){
                            var lat = parseFloat(response.data[i].latitude);
                            var lng = parseFloat(response.data[i].longitude);
                            var description = response.data[i].description
                            var reservationInfo = response.data[i].reservationInfo
                            var reservationUrl = response.data[i].reservationUrl
                            var name = response.data[i].name;
                            var location = [lat, lng]
                            var obj = {
                              name: name,
                              location: location,
                              description: description,
                              reservationInfo: reservationInfo,
                              reservationUrl: reservationUrl
                            }
                            camps.push(obj) 
                            

                          } else {
                              continue;
                            }
                    };




                  for (var i = 0; i < camps.length; i++) {
                    // loop through the camps array, create a new marker, push it to the camps markers array
                    campMarkers.addLayer(
                      L.marker(camps[i].location, {icon: realCampIcon})
                      .bindPopup("<h2>" + camps[i].name + "</h2><p>" + camps[i].description + "</p><h3>" + camps[i].reservationInfo + `</h3><a href=${camps[i].reservationUrl}>` + camps[i].reservationUrl + "</a>")
                    );
                    
                  }


                  // Add all the camp Markers to a new layer group.
                  // Now we can handle them as one group instead of referencing each individually
                  var campLayer = L.layerGroup(campMarkers);
                  var parkLayer = L.layerGroup(parkMarkers);


                  // Define variables for our tile layers
                  var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery ?? <a href=\"https://www.mapbox.com/\">Mapbox</a>",
                    maxZoom: 18,
                    id: "light-v10",
                    accessToken: API_KEY
                  });

                  var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
                    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery ?? <a href=\"https://www.mapbox.com/\">Mapbox</a>",
                    maxZoom: 18,
                    id: "dark-v10",
                    accessToken: API_KEY
                  });

                  // Only one base layer can be shown at a time
                  var baseMaps = {
                    Light: light,
                    Dark: dark
                  };

                  // Overlays that may be toggled on or off
                  var overlayMaps = {
                    Parks: parkMarkers,
                    Campgrounds: campMarkers
                  };

                  // Create map object and set defaults, lat/long for center of america
                  var myMap = L.map("map", {
                    center: [44.967243, -103.771556], 
                    zoom: 4,
                    layers: [dark, parkMarkers, campMarkers] 
                  });

                  // Pass our map layers into our layer control
                  // Add the layer control to the map
                  L.control.layers(baseMaps, overlayMaps).addTo(myMap);



                  })
})                  // everything must be in the d3 call, or async will not populate parks before using it to populate parkMarkers