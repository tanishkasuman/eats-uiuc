/* eslint-disable no-undef */
var map = L.map('map', {
    zoomControl: false
}).setView([40.0985, -88.2291], 13);

L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
    maxZoom: 21,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', 
}).addTo(map);

/*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);*/

L.control.zoom({
    position: 'topright'
}).addTo(map);

//Disable map dragging when mouse is over UI
var overlay = document.getElementById("content-overlay");

overlay.addEventListener('mouseenter', function() {
  map.dragging.disable(); // Disable map dragging
});

overlay.addEventListener('mouseleave', function() {
  map.dragging.enable(); // Enable map dragging
});

//JSON Data Check
function dataCheck(locationData, index, locIndex) {
    if (locationData === undefined) {
        console.log("This marker has missing data: Index " + index + ", locations[] index " + locIndex);
        locationData = "N/A";
    }
}

//Fetch restaurants.json data and turn it into markers
function fetchData(data) {
    var count = 0
    var markers = L.markerClusterGroup();
    data.forEach(element => {
        for (var i = 0; i < element.locations.length; i++) {
            var locationName = element.name;
            var locationData = element.locations[i].coordinate;
            var locationAddr = element.locations[i].address;
            var locationArea = element.locations[i].area;
            var locationPhoneNum = element.locations[i].phoneNumber;
            var locationRating = element.locations[i].rating;

            //Skip anything without coordinates
            if (element.locations[i].coordinate === undefined) {
                continue;
            }
            dataCheck(locationName, count, i);
            dataCheck(locationAddr, count, i);
            dataCheck(locationArea, count, i);
            dataCheck(locationPhoneNum, count, i);
            dataCheck(locationRating, count, i);

            var popupContent = `
                <b>
                    ${locationName}
                </b>
                <p>
                    Address: ${locationAddr} <br>
                    Area: ${locationArea} <br>
                    Phone Number: ${locationPhoneNum} <br>
                    Rating: ${locationRating}/5 <br>
                </p
            `;
            
            var lat = locationData.lat;
            var lng = locationData.lng;
            var marker = L.marker([lat, lng]).bindPopup(popupContent);

            markers.addLayer(marker);

            //Places with multiple locations (e.x. Espresso Royale) don't work correctly with mouseover
            /*marker.on('mouseover', function() {
                marker.openPopup();
            });
            marker.on('mouseout', function() {
                marker.closePopup();
            });*/
        }
        count++;

    });

    map.addLayer(markers)
}

fetch('/data/restaurants.json')
  .then(response => response.json())
  .then(data => fetchData(data))
  .catch(error => console.log(error));