// Initialize leaflet.js
var L = require('leaflet');
let lat =  50.450001
let lon = 30.523333

let map = L.map('map').setView([lat, lon], 11);

/*	Variety of base layers */
function get_layers(){
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
    return ({
        "OSM": osm,
        "OSM Germany": osm_de,
        "OSM France": osm_fr,
        "OSM Hot": osm_hot,
        "OSm Topo": osm_topo,
        "ESRI World Imagery": esri_WorldImagery
    })
}
L.control.layers(get_layers()).addTo(map);

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

function get_buckets(){
    const bucket_json = require('./buckets.json'); 
    let buckets = []
    let buckets_fullness = []
    for (let buck_ind in bucket_json) {
        obj = bucket_json[buck_ind]
        let new_bucket = L.marker([obj['lat'], obj['lon']], {icon: get_icon(obj['fill_status'])})
                        .bindPopup('Bucket №' + (buck_ind/1+1) + 
                        '<br>Filled up ' + obj['fill_status'] + '%')
        buckets.push(new_bucket)
        buckets_fullness.push(Number(obj['fill_status']))
    }

    // Add baseLayers and overlays to layer panel
    return [buckets, buckets_fullness]
}
let [buckets, buckets_fullness] = get_buckets()
buckets_layer = L.layerGroup(buckets).addTo(map)

function get_trucks(){
    truck_icon = L.icon({
        iconUrl: 'style/truck.png',
        iconSize: [40, 40],
        popupAnchor: [0, -10]
    })
    const trucks_json = require('./trucks.json'); 
    let trucks = []
    for (let buck_ind in trucks_json) {
        obj = trucks_json[buck_ind]
        let new_truck = L.marker([obj['lat'], obj['lon']], {icon: truck_icon}, {riseOnHover: true})
                        .bindPopup('truck №' + (buck_ind/1+1) + 
                        '<br>Route: ' + obj['fill_status'] + '%')
        trucks.push(new_truck)
    }
    // Add baseLayers and overlays to layer panel
    return trucks
}
let trucks = get_trucks()
trucks_layer = L.layerGroup(trucks).addTo(map)
let overlays = {
	'buckets': buckets_layer,
    'trucks': trucks_layer
};

L.control.layers(null, overlays).addTo(map);

let button = document.createElement('button');
button.textContent = '▶';
button.addEventListener("click", update_markers);
document.body.appendChild(button);

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
    for(let b_ind in buckets) {
        if (buckets_fullness[b_ind] < 100){
            let new_fullness = (buckets_fullness[b_ind] + Math.random() * 2).toFixed(2)
            if (new_fullness > 100) {new_fullness = 100}
            console.log(new_fullness)
            buckets_fullness[b_ind] = Number(new_fullness)
            buckets[b_ind].setPopupContent('Bucket №' + (b_ind/1+1) +
            '<br>Filled up ' + new_fullness + '%') 
            buckets[b_ind].setIcon(get_icon(new_fullness))
        }  
    }
}
