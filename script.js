
var markers = L.markerClusterGroup();
=======
let savedRestaurants = [];
const savedData = localStorage.getItem('savedRestaurants');
if (savedData) {
    savedRestaurants = JSON.parse(savedData);
}

var map = L.map('map', {
    zoomControl: false
}).setView([40.0985, -88.2291], 13);

L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
    maxZoom: 21,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', 
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

function onEachFeature(feature, layer) {
    var properties = feature.properties;
    var popupContent = "";

    if (properties) {
        for (var property in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, property)) {
                popupContent += "<b>" + property + ": " + properties[property] + "</b>" + "<br>";
            }
        }
    }

    if (feature.geometry.type == "MultiPolygon" || feature.geometry.type == "Polygon") {
        markers.addLayer(L.marker(layer.getBounds().getCenter()).bindPopup(popupContent));
    }

    layer.bindPopup(popupContent);
}

function fetchData(data) {
<<<<<<< HEAD
    var geoLayer = L.geoJSON(data, {
        onEachFeature: onEachFeature
    });

    geoLayer.eachLayer(function(layer) {
        if (layer.feature.geometry.type == "MultiPolygon" || layer.feature.geometry.type == "Polygon") {
            geoLayer.removeLayer(layer);
        }
    });

    markers.addLayer(geoLayer);

=======
    count = 0;
    var markers = L.markerClusterGroup();
    data.forEach(element => {
        for (let i = 0; i < element.locations.length; i++) {
            let locationName = element.name;
            let locationData = element.locations[i].coordinate;
            let locationAddr = element.locations[i].address;
            let locationArea = element.locations[i].area;
            let locationPhoneNum = element.locations[i].phoneNumber;
            let locationRating = element.locations[i].rating;

            dataCheck(locationName, count, i);
            dataCheck(locationData, count, i);
            dataCheck(locationAddr, count, i);
            dataCheck(locationArea, count, i);
            dataCheck(locationPhoneNum, count, i);
            dataCheck(locationRating, count, i);

            let restaurantId = locationName + "-" + locationArea;
            let isSaved = savedRestaurants.some(r => r.id === restaurantId);

            let popupContent = `
                <b>
                    ${locationName}
                </b>
                <button class="save-btn" data-restaurant-id="${restaurantId}" data-name="${locationName}" data-area="${locationArea}" data-addr="${locationAddr}" data-phone-number="${locationPhoneNum}" data-rating="${locationRating}" data-saved="${isSaved ? 'true' : 'false'}">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
                <p>
                    Address: ${locationAddr} <br>
                    Area: ${locationArea} <br>
                    Phone Number: ${locationPhoneNum} <br>
                    Rating: ${locationRating}/5 <br>
                </p>
            `;

            let lat = locationData.lat;
            let lng = locationData.lng;
            var marker = L.marker([lat, lng]).bindPopup(popupContent);
            
            marker.on('popupopen', function() {
                const btn = document.querySelector('.leaflet-popup .save-btn');
                if (btn) {
                    btn.addEventListener('click', function() {
                        const restaurantId = btn.getAttribute('data-restaurant-id');
                        if (btn.classList.contains('saved')) {
                            savedRestaurants = savedRestaurants.filter(r => r.id !== restaurantId);
                            btn.classList.remove('saved');
                        } else {
                            const restaurantData = {
                                id: this.dataset.restaurantId,
                                name: this.dataset.locationName,
                                area: this.dataset.locationArea,
                                address: this.dataset.locationAddr,
                                phoneNumber: this.dataset.locationPhoneNum,
                                rating: this.dataset.locationRating
                            };
                            savedRestaurants.push(restaurantData);
                            btn.classList.add('saved');
                        }
                        localStorage.setItem('savedRestaurants', JSON.stringify(savedRestaurants));
                    });
                }
            });
            markers.addLayer(marker);
        }
        count++;
    });
>>>>>>> 16343211474a9811a34b4dc416f4e859ac1bc26f
    map.addLayer(markers);
}

fetch('/data/uiuc-geo-data.geojson')
    .then(response => response.json())
    .then(data => fetchData(data))
    .catch(error => console.log(error));