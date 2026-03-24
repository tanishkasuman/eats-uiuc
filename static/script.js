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

//---DEBUG---
// Set of unique feature tags
//var uniqueFeatures = new Set();
//---DEBUG---

/*
Keep:
addr:*
name:
cuisine:
*/

const listedFeatures = ["name", "cuisine", "amenity"]

const adderessOrder = [
    "housename",
    "streetname",
    "unit",
    "suite",
    "city",
    "county",
    "state",
    "postcode",
    "country"
];

function onEachFeature(feature, layer) {
    var properties = feature.properties;

    //---DEBUG---
    //Print unique feature tags
    //propertyKeys = Object.keys(properties);
    //propertyKeys.forEach(element => {
    //    uniqueFeatures.add(element)
    //});
    //---DEBUG---

    var addressTags = {};

    var popupContent = "";

    // Check if the feature has properties
    if (properties) {
        // Iterate through every property
        for (var property in properties) {
            // If property doesn't match with any listedFeatures, then don't add it to popup
            // Exception: address tags (addr:*) don't get added until they are combnined
            if (Object.prototype.hasOwnProperty.call(properties, property) && listedFeatures.some(prefix => property.startsWith(prefix))) {
                popupContent += "<b>" + property + ": " + properties[property] + "</b>" + "<br>";
            } else if (Object.prototype.hasOwnProperty.call(properties, property) && property.startsWith("addr")) {
                // Create full address from available properties
                if (property.startsWith("addr")) {
                    var splitString = property.split(":");
                    addressTags[splitString[1]] = properties[property];
                }
            }
        }
    }

    // Add full address to popups
    // Compound tag: streetname
    if (Object.prototype.hasOwnProperty.call(addressTags, "housenumber") 
        || Object.prototype.hasOwnProperty.call(addressTags, "street")) {
        addressTags["streetname"] = [addressTags["housenumber"], addressTags["street"]].filter(Boolean).join(" ");
    }

    // Add "STE" prefix to addr:suite
    if (Object.prototype.hasOwnProperty.call(addressTags, "suite")) {
        addressTags["suite"] = "STE " + addressTags["suite"];
    }

    // Add "UNIT" prefix to addr:unit IF "ste" OR "suite" is not in the tag
    if (Object.prototype.hasOwnProperty.call(addressTags, "unit") 
        && !addressTags["unit"].toLowerCase().includes("suite") 
        && !addressTags["unit"].toLowerCase().includes("ste")) {
        addressTags["unit"] = "UNIT " + addressTags["unit"];
    }
    
    var addressParts = adderessOrder.map(key => addressTags[key]).filter(Boolean).join(", ");

    // If address is empty, add "N/A" to address bar
    if (Object.keys(addressTags).length == 0) {
        addressParts = "N/A";
    }

    popupContent += "<b>Address: " + addressParts + "</b>" + "<br>";

    if (feature.geometry.type == "MultiPolygon" || feature.geometry.type == "Polygon") {
        markers.addLayer(L.marker(layer.getBounds().getCenter()).bindPopup(popupContent));
    }

    layer.bindPopup(popupContent);
}

function fetchData(data) {
    var geoLayer = L.geoJSON(data, {
        onEachFeature: onEachFeature
    });
    //---DEBUG---
    //Print unique features
    //console.log(uniqueFeatures);
    //---DEBUG---
    geoLayer.eachLayer(function(layer) {
        if (layer.feature.geometry.type == "MultiPolygon" || layer.feature.geometry.type == "Polygon") {
            geoLayer.removeLayer(layer);
        }
    });

    markers.addLayer(geoLayer);

    map.addLayer(markers);
}

fetch('/static/data/uiuc-geo-data.geojson')
    .then(response => response.json())
    .then(data => fetchData(data))
    .catch(error => console.log(error));