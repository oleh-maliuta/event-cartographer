import { Icon } from 'leaflet';
import newMarkerPng from './assets/new-marker.png';
import lowImpMarkerPng from './assets/low-imp-marker.png';
import mediumImpMarkerPng from './assets/medium-imp-marker.png';
import highImpMarkerPng from './assets/high-imp-marker.png';

export const newMarkerIcon = new Icon({
    iconUrl: newMarkerPng,
    iconSize: [26, 40],
    iconAnchor: [13, 40],
    popupAnchor: [0, -30]
});

export const lowImpMarkerIcon = new Icon({
    iconUrl: lowImpMarkerPng,
    iconSize: [26, 40],
    iconAnchor: [13, 40],
    popupAnchor: [0, -30]
});

export const mediumImpMarkerIcon = new Icon({
    iconUrl: mediumImpMarkerPng,
    iconSize: [26, 40],
    iconAnchor: [13, 40],
    popupAnchor: [0, -30]
});

export const highImpMarkerIcon = new Icon({
    iconUrl: highImpMarkerPng,
    iconSize: [26, 40],
    iconAnchor: [13, 40],
    popupAnchor: [0, -30]
});