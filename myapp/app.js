// Initialize leaflet.js
var L = require('leaflet');
let lat =  50.450001
let lon = 30.523333

let map = L.map('map').setView([lat, lon], 11);

/*	Variety of base layers */
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; OSM <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var osm_de = L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; OSM Deutschland <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var osm_fr = L.tileLayer('http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: '&copy; OSM France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var osm_hot = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; OSM Hot <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
});
var osm_topo = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
var esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Create base layers group object
var baseLayers = {
	"OSM": osm,
	"OSM Germany": osm_de,
	"OSM France": osm_fr,
	"OSM Hot": osm_hot,
	"OSm Topo": osm_topo,
	"ESRI World Imagery": esri_WorldImagery
};

let yellowIcon = L.icon({
    iconUrl:"style/yellow_bin.png",
    iconSize:[40,40],
    popupAnchor: [0, -10]

   })
let greenIcon = L.icon({
    iconUrl:"style/green_bin.png",
    iconSize:[40,40],
    popupAnchor: [0, -10]
})
let redIcon = L.icon({
    iconUrl:"style/red_bin.png",
    iconSize: [40, 40],
    popupAnchor: [0, -10]
})
let iconOptions = {
    draggable:false,
    icon:redIcon
}

function get_icon(percent){
    let icon_src = ''
    if (percent > 90){
        icon_src = "style/red_bin.png"
    }else if (percent > 75){
        icon_src = "style/orange_bin.png"
    }else if (percent > 50){
        icon_src = "style/yellow_bin.png"
    }else{
        icon_src = "style/green_bin.png"
    }
    return (L.icon({
        iconUrl: icon_src,
        iconSize: [40, 40],
        popupAnchor: [0, -10]
    })    )
}
const markers_json = require('./markers.json'); 
let markers = []
let buckets_fullness = []
for (let mkr_ind in markers_json) {
    mkr = markers_json[mkr_ind]
    new_marker = L.marker([mkr['lat'], mkr['lon']], {icon: get_icon(mkr['fill_status'])})
                    .bindPopup(mkr['popup'] + 
                    '<br>Filled up ' + mkr['fill_status'] + '%'),
    markers.push(new_marker)
    buckets_fullness.push(Number(mkr['fill_status']))
 }

// Add baseLayers and overlays to layer panel
var buckets = L.layerGroup(markers).addTo(map);

var overlays = {
	'buckets': buckets
};
L.control.layers(baseLayers).addTo(map);
L.control.layers(null, overlays).addTo(map);
let marker = new L.Marker([50.398845,30.5070573] , {icon : get_icon(76)});
marker.addTo(map);
marker.bindPopup('content').openPopup();
marker.addEventListener("click", update_markers);

filling_state = true
let filling_interval = 0
function update_markers() {
    if (filling_state){
        filling_interval = setInterval(fill_buckets, 500)
    }else{
        clearInterval(filling_interval);
    }
    filling_state = !filling_state
}

function fill_buckets(){
    for(let mrkr in markers) {
        if (buckets_fullness[mrkr] < 100){
            let new_fullness = (buckets_fullness[mrkr] + Math.random() * 2).toFixed(2)
            if (new_fullness > 100) {new_fullness = 100}
            console.log(new_fullness)
            buckets_fullness[mrkr] = Number(new_fullness)
            markers[mrkr].setPopupContent('This is bucket №' + mrkr +
            '<br>Filled up ' + new_fullness + '%') 
            markers[mrkr].setIcon(get_icon(new_fullness))
        }  
    }
}
