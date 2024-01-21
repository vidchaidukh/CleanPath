function move_bucket(){
    console.log(marker)
    new_lat = marker['_latlng']['lat']*Math.floor(Math.random() * 0.00005);
    new_lon = marker['_latlng']['lng']*Math.floor(Math.random() * 0.00005);
    var newLatLng = new L.LatLng(new_lat, new_lon);
    marker.setLatLng(newLatLng); 
}
