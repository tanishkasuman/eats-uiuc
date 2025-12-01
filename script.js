let savedRestaurants = [];
const savedData = localStorage.getItem('savedRestaurants');
if (savedData) {
    savedRestaurants = JSON.parse(savedData);
}

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
    map.addLayer(markers);
}

fetch('/data/restaurants.json')
  .then(response => response.json())
  .then(data => fetchData(data))
  .catch(error => console.log(error));