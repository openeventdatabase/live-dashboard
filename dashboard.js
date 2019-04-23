var map;
var api = 'http://api.openeventdatabase.org/event';

// Pour chaque requête prédéfinie on associe le div destination

var preDefinedEvents =[
    {"btn":"btn_total_5_min", "glyph":"th-list", "reqDatas":jQuery.param({"when":"last1minutes"}), "layer": L.geoJson()},
    {"btn":"btn_traffic_1_hour", "glyph":"road", "reqDatas":jQuery.param({"when":"last30minutes", "what":"traffic", "near":"2.36,48.85,20000"}), "layer": L.geoJson()},
    {"btn":"btn_nature_2_days", "glyph":"globe", "reqDatas":jQuery.param({"when":"last48hours", "what":"nature"}), "layer": L.geoJson()},
    {"btn":"btn_weather_12_hours", "glyph":"cloud", "reqDatas":jQuery.param({"when":"last12hours", "what":"weather", "near":"2.36,48.85,20000"}), "layer": L.geoJson()},
    {"btn":"btn_health_blood_12_hours", "glyph":"heart", "reqDatas":jQuery.param({"when":"last12hours", "what":"health.blood.collect"}), "layer": L.geoJson()},
    {"btn":"btn_transports_6_hours", "glyph":"plane", "reqDatas":jQuery.param({"when":"last6hours", "what":"public_transport"}), "layer": L.geoJson()}
];

function getPredefinedEvent(targetId) {
    for(var i=0;i<preDefinedEvents.length;i++) {
        item = preDefinedEvents[i];
        if(targetId == item.btn) return item; 
    }
    return 0;
}

function init() {
                    
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors&nbsp;|&nbsp;Events : <a href="https://github.com/openeventdatabase/backend/wiki">OpenEvenDB</a>',
        osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});
    map = new L.Map('map', {layers: [osm], center: new L.LatLng(46.9886, 2.08740), zoom: 6 });

    updateAllEvents();

    for (var i = 0; i < preDefinedEvents.length; i++) {
        const e = preDefinedEvents[i];
        const id = e["btn"];
        $("#" + id).click(function(event) {
            clearCount(id);clearLayer(id);
            updateEvents(e["reqDatas"], id, true);
        });
    }
}

function updateAllEvents() {
    for(var i=0;i<preDefinedEvents.length;i++) {
        item = preDefinedEvents[i];
        clearCount(item.btn);clearLayer(item.btn);
        updateEvents(item.reqDatas, item.btn, false);
    }
}

function updateEvents(reqDatas, targetId, bFitBounds) {
    // console.log(reqDatas, targetId);
    $.ajax({
            url : api,
            data: decodeURIComponent(reqDatas),
            dataType : 'json',
            context: {"targetId":targetId, "fitBounds" : bFitBounds}
        }).done(function(events) {
            var context = this;
            $("#"+ context.targetId + " .count").html( events.count );
            updateMap(context.targetId, events, context.fitBounds);
        });
}


function updateMap(targetId, events, fitBounds) {
    // console.log(targetId, events, fitBounds);
    evt = getPredefinedEvent(targetId);
    evt.layer.clearLayers();
    // console.log(evt.layer);
    evt.layer = L.geoJson(events,{pointToLayer: function(feature, latlng){
        var marker = L.marker(latlng, {
            icon: L.icon.glyph({
                prefix: 'glyphicon',
                glyph: evt.glyph
            })
        });
                
        var title = '';
        if (feature.properties.name != undefined) title += feature.properties.name; 
        if (feature.properties.label != undefined) title += ' ' + feature.properties.label;
        
        if(title=='') title = feature.properties.what;
        
        var dt = '';
        if(feature.properties.start != undefined) {
                dt = "<br />Start : " + feature.properties.start; 
                dt += "<br />Stop : " + feature.properties.start;                 
        }else {
            dt = "<br />When : " + feature.properties.when; 
        }
        
        popup = "<b>" + title + "</b>" + 
                "<br />What : " + feature.properties.what + 
                "<br />Source : " + feature.properties.source + 
                dt + 
                "<br />Type : " + feature.properties.type;
                 
        return marker.addTo(map).bindPopup(popup);
        
    }}).addTo(map);
    
    evt.layer.bringToFront();
    
    if(events.count > 0 && fitBounds == true) {
        // console.log(fitBounds);
        map.fitBounds(evt.layer.getBounds());    
    }
    
}


function clearCount(targetId) {
    $("#"+ targetId + " .count").html('-');
}

function clearLayer(targetId) {
    evt = getPredefinedEvent(targetId);
    evt.layer.clearLayers();
}

function clearAllEvents() {
    for(var i=0;i<preDefinedEvents.length;i++) {
        item = preDefinedEvents[i];
        clearCount(item.btn);clearLayer(item.btn); 
    }
}

