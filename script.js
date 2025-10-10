var map = L.map('map', {
    zoomControl: false
}).setView([40.0985, -88.2291], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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
    count = 0
    var markers = L.markerClusterGroup();
    data.forEach(element => {
        for (i = 0; i < element.locations.length; i++) {
            locationName = element.name;
            locationData = element.locations[i].coordinate;
            locationAddr = element.locations[i].address;
            locationArea = element.locations[i].area;
            locationPhoneNum = element.locations[i].phoneNumber;
            locationRating = element.locations[i].rating;

            dataCheck(locationName, count, i);
            dataCheck(locationData, count, i);
            dataCheck(locationAddr, count, i);
            dataCheck(locationArea, count, i);
            dataCheck(locationPhoneNum, count, i);
            dataCheck(locationRating, count, i);

            popupContent = `
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

            lat = locationData.lat;
            lng = locationData.lng;
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