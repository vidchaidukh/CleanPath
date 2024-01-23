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
        iconSize: [25, 25],
        popupAnchor: [0, -7]
    })    )
}

function get_buckets(){
    const buckets_json = require('./buckets_150.json'); 
    let buckets = []
    for (let buck_ind in buckets_json) {
        obj = buckets_json[buck_ind]
        let new_bucket = L.marker([obj['lat'], obj['lon']], {icon: get_icon(obj['fill_status'])})
                        .bindPopup('<b>Bucket №' + (buck_ind/1) + 
                        '</b><br>' + obj['address'] +
                        '<br>' + obj['lat'] + ', ' +  obj['lon'] +
                        '<br>Filled up <b>' + obj['fill_status'] + '%</b>')
        buckets.push(new_bucket)
    }
    return [buckets, buckets_json]
}
let [buckets_display, buckets] = get_buckets()
buckets_layer = L.layerGroup(buckets_display).addTo(map)

function get_trucks(){
    truck_icon = L.icon({
        iconUrl: 'style/truck.png',
        iconSize: [40, 40],
        popupAnchor: [0, -10]
    })
    const trucks_json = require('./trucks_15.json'); 
    let trucks = []
    for (let t_ind in trucks_json) {
        obj = trucks_json[t_ind]
        let new_truck = L.marker([obj['lat'], obj['lon']], {icon: truck_icon}, {riseOnHover: true})
                        .bindPopup('truck №' + (ind/1) + 
                        '<br>Route: ' + obj['route'])
        trucks.push(new_truck)
    }
    // Add baseLayers and overlays to layer panel
    return [trucks, trucks_json]
}
let [trucks_display, trucks] = get_trucks()
trucks_layer = L.layerGroup(trucks_display).addTo(map)
let overlays = {
	'buckets': buckets_layer,
    'trucks': trucks_layer
};

L.control.layers(null, overlays).addTo(map);

function add_buttons(){
    let button_filling = document.createElement('button');
    button_filling.setAttribute("id", "filling");
    button_filling.textContent = '▶';
    button_filling.setAttribute('title', "buckets' filling process");
    button_filling.addEventListener("click", filling_func);
    document.body.appendChild(button_filling);

    let button_add = document.createElement('button');
    button_add.setAttribute("id", "driving");
    button_add.textContent = 'drive';
    button_add.addEventListener("click", adding_func);
    document.body.appendChild(button_add);

    let button_distribute = document.createElement('button');
    button_distribute.setAttribute("id", "distribute");
    button_distribute.textContent = '📃';
    button_distribute.setAttribute('title', 'disctribute buckets among trucks');
    button_distribute.addEventListener("click", distribute);
    document.body.appendChild(button_distribute);
}
add_buttons()

filling_state = true
let filling_interval = 0
function filling_func() {
    btn = document.getElementById('filling')
    if (filling_state){
        btn.innerText = 'II'
        btn.style.paddingLeft = "4px" 
        filling_interval = setInterval(fill_buckets, 500)
    }else{
        btn.innerText = '▶'
        btn.style.paddingLeft = "10px" 
        clearInterval(filling_interval);
    }
    filling_state = !filling_state
}
adding_state = true
let adding_interval = 0
function adding_func(){
    btn = document.getElementById('driving')
    if (adding_state){
        btn.innerText = 'stop'
        adding_interval = setInterval(move_trucks, 50)
    }else{
        btn.innerText = 'drive'
        clearInterval(adding_interval);
    }
    adding_state = !adding_state
}
function update_bucket(b_ind, new_fullness){
    buckets[b_ind].fill_status = Number(new_fullness)
    buckets_display[b_ind].setPopupContent('<b>Bucket №' + (b_ind/1) + 
                        '</b><br>' + buckets[b_ind].address +
                        '<br>' + buckets[b_ind].lat + ', ' +  buckets[b_ind].lon +
                        '<br>Filled up <b>' + new_fullness + '%</b>')
    buckets_display[b_ind].setIcon(get_icon(new_fullness))
}
function update_truck(t_ind){
    trucks_display[t_ind].setPopupContent('<b>Truck №' + t_ind +'</b><br>' +
                            'Route: ' + trucks[t_ind].route.join('<br>'))
}
function fill_buckets(){
    for(let b_ind in buckets) {
        if (buckets[b_ind].fill_status < 100){
            let new_fullness = (buckets[b_ind].fill_status + Math.random()).toFixed(2)
            if (new_fullness > 100) {new_fullness = 100}
            update_bucket(b_ind, new_fullness)
        }
        if (buckets[b_ind].fill_status > 75 && !(is_in_route(b_ind))){
            add_bucket_to_route(b_ind)
        }
    }
}
function is_in_route(b_ind){
    finded = false
    trucks.forEach(truck => {
        if (truck.route.includes(b_ind)){
            finded = true
            return true}
    })
    return finded
}
function add_bucket_to_route(b_ind){
    b_coord = [buckets[b_ind].lat, buckets[b_ind].lon]
    t_dist = []
    for (let t_ind in trucks){
        t_coord = [trucks[t_ind].lat, trucks[t_ind].lon]
        t_dist.push(map.distance(b_coord, t_coord)*trucks[t_ind].route.length)
    }
    t_ind = t_dist.indexOf(Math.min(...t_dist))
    trucks[t_ind].route.push(b_ind)
    update_truck(t_ind)
    console.log('add bucket ' + b_ind + ' to ' + t_ind + " truck's route!")

}
function move_trucks(){
    let speed = 30
    for (let t_ind in trucks){
        if (trucks[t_ind].route.length){
            console.log('mooove' + t_ind)
            lat_diff = (buckets[trucks[t_ind].route[0]].lat - trucks[t_ind].lat)
            lon_diff = (buckets[trucks[t_ind].route[0]].lon - trucks[t_ind].lon)

            if (Math.abs(lat_diff) + Math.abs(lon_diff) < 0.00005){
                update_bucket(trucks[t_ind].route[0], 0)
                trucks[t_ind].route.shift()
                update_truck(t_ind)
            }else{
            if (Math.abs(lat_diff) < 0.00005){lat_diff*=speed}
            if (Math.abs(lon_diff) < 0.00005){lon_diff*=speed}

            console.log(lat_diff, lon_diff)
            new_lat = trucks[t_ind].lat + lat_diff/speed
            new_lon = trucks[t_ind].lon + lon_diff/speed
            trucks[t_ind].lat = new_lat
            trucks[t_ind].lon = new_lon
            var newLatLng = new L.LatLng(new_lat, new_lon);
            trucks_display[t_ind].setLatLng(newLatLng); 
            }
        }
    }
}

// Використання генетичного алгоритму
function distribute(){
    let btn = document.getElementById("distribute")
    btn.disabled = true
    
    let generations = 100;
    let mutationRate = 0.1;

    let full_buckets = buckets.filter(function(x) { return x.fill_status > 75; });
    let bestChromosome = geneticAlgorithm(trucks, full_buckets, generations, mutationRate);

    // Розподіл смітників за оптимальним хромосомою
    for (let b_ind in full_buckets) {
        let truckIndex = bestChromosome[b_ind];
        trucks[truckIndex].route.push(full_buckets[b_ind].id);
    }
    for (let t_ind in trucks){
        update_truck(t_ind)
    }

    console.log(trucks);
}