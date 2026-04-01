/* eslint-disable no-undef */
var markers = L.markerClusterGroup();
var markerIndex = {};  // maps @id string → Leaflet marker instance

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

// Copy Share Link button handler (delegated)
document.getElementById('map').addEventListener('click', function(e) {
    var btn = e.target.closest('.share-link-btn');
    if (!btn) return;
    var id = decodeURIComponent(btn.dataset.id);
    var url = window.location.origin + window.location.pathname + '?place=' + encodeURIComponent(id);
    navigator.clipboard.writeText(url).then(function() {
        var original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = original; }, 1500);
    }).catch(function() {
        window.prompt('Copy this link:', url);
    });
});

// Update URL bar when a popup opens
markers.on('popupopen', function(e) {
    var btn = e.popup.getElement().querySelector('.share-link-btn');
    if (!btn) return;
    var id = decodeURIComponent(btn.dataset.id);
    if (id) { history.replaceState(null, '', '?place=' + encodeURIComponent(id)); }
});

// Clear URL when clicking empty map space
map.on('click', function() {
    history.replaceState(null, '', window.location.pathname);
});

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

const listedFeatures = ["name", "cuisine", "amenity"];

const addressOrder = [
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

function formatLabel(key) {
    var label = key.replace(/_/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatValue(raw) {
    return raw.split(";").map(function(part) {
        part = part.trim().replace(/_/g, " ");
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(", ");
}

function buildAddress(properties) {
    var addressTags = {};

    for (var key in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, key) && key.startsWith("addr:")) {
            addressTags[key.split(":")[1]] = properties[key];
        }
    }

    if (addressTags.housenumber || addressTags.street) {
        addressTags.streetname = [addressTags.housenumber, addressTags.street].filter(Boolean).join(" ");
    }
    if (addressTags.suite) {
        addressTags.suite = "STE " + addressTags.suite;
    }
    if (addressTags.unit
        && !addressTags.unit.toLowerCase().includes("suite")
        && !addressTags.unit.toLowerCase().includes("ste")) {
        addressTags.unit = "UNIT " + addressTags.unit;
    }

    if (Object.keys(addressTags).length === 0) return "N/A";
    return addressOrder.map(function(k) { return addressTags[k]; }).filter(Boolean).join(", ");
}

function buildPopupContent(feature) {
    var properties = feature.properties;
    var featureId = properties["@id"];
    var content = "";

    for (var key in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, key)
            && listedFeatures.some(function(prefix) { return key.startsWith(prefix); })) {
            content += "<b>" + formatLabel(key) + ": " + formatValue(properties[key]) + "</b><br>";
        }
    }

    content += "<b>Address: " + buildAddress(properties) + "</b><br>";

    var encodedId = encodeURIComponent(featureId || "");
    content += '<br><button class="share-link-btn" data-id="' + encodedId + '" '
        + 'style="margin-top:6px;padding:4px 10px;cursor:pointer;font-size:0.85em;">'
        + 'Copy Share Link</button>';

    return content;
}

function onEachFeature(feature, layer) {
    var featureId = feature.properties["@id"];

    //---DEBUG---
    //Print unique feature tags
    //propertyKeys = Object.keys(feature.properties);
    //propertyKeys.forEach(element => {
    //    uniqueFeatures.add(element)
    //});
    //---DEBUG---

    var popupContent = buildPopupContent(feature);

    if (feature.geometry.type == "MultiPolygon" || feature.geometry.type == "Polygon") {
        var centroidMarker = L.marker(layer.getBounds().getCenter()).bindPopup(popupContent);
        markers.addLayer(centroidMarker);
        if (featureId) { markerIndex[featureId] = centroidMarker; }
    }

    layer.bindPopup(popupContent);

    if (feature.geometry.type !== "MultiPolygon" && feature.geometry.type !== "Polygon") {
        if (featureId) { markerIndex[featureId] = layer; }
    }
}

function handleDeepLink() {
    var params = new URLSearchParams(window.location.search);
    var place = params.get('place');
    if (!place) return;
    var marker = markerIndex[place];
    if (!marker) { console.warn('Deep link target not found:', place); return; }
    markers.zoomToShowLayer(marker, function() { marker.openPopup(); });
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
    .then(data => { fetchData(data); handleDeepLink(); })
    .catch(error => console.log(error));
