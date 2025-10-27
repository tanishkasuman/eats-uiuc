/* eslint-disable no-undef */
var markers = L.markerClusterGroup();

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
    var geoLayer = L.geoJSON(data, {
        onEachFeature: onEachFeature
    });

    geoLayer.eachLayer(function(layer) {
        if (layer.feature.geometry.type == "MultiPolygon" || layer.feature.geometry.type == "Polygon") {
            geoLayer.removeLayer(layer);
        }
    });

    markers.addLayer(geoLayer);

    map.addLayer(markers);
}

fetch('/data/uiuc-geo-data.geojson')
    .then(response => response.json())
    .then(data => fetchData(data))
    .catch(error => console.log(error));