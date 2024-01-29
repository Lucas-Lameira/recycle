<!-- eslint-disable -->
<template>
  <div class="map-wrap" :id="mapID"></div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import { map, tileLayer, marker, icon, Marker } from "leaflet"
import { DEFAULT_MAP_SETTINGS } from "@/utils/utils"
import "leaflet/dist/leaflet.css"
import iconImg from 'leaflet/dist/images/marker-icon.png';
import iconShadowImg from 'leaflet/dist/images/marker-shadow.png';

import recyclerMapPointImage from "@/assets/map_points/recycler-map-point.png"
import recyclerMapPointShadowImage from "@/assets/map_points/recycler-map-point-shadow.png"

let recyclerIcon = null

let DefaultIcon = icon({
  iconUrl: iconImg,
  shadowUrl: iconShadowImg,
  iconSize: [24,36],
  iconAnchor: [12,36]
});

Marker.prototype.options.icon = DefaultIcon;

const props = defineProps({
  mapID: String,
  userLocation: Array,
  wasteCoordinates: Array
})

const mapSettings = reactive(DEFAULT_MAP_SETTINGS)
const leafletMap = ref(null)

const createMap = () => {
	const { zoom } = mapSettings
  leafletMap.value = map(props.mapID).setView(props.userLocation, zoom)
  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(leafletMap.value);
}

const createMarkers = () => {
  createRecyclerIcon()
  marker(props.wasteCoordinates).addTo(leafletMap.value);
}

/* NÂO MAPEADO */
const createRecyclerIcon = () => {
  recyclerIcon = icon({
    iconUrl: recyclerMapPointImage,
    shadowUrl: recyclerMapPointShadowImage,

    iconSize:     [48, 55], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 44], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  marker(props.userLocation, {icon: recyclerIcon}).addTo(leafletMap.value);
}

onMounted(() => {
  createMap()
  createMarkers()
})
</script>
<style scoped>
.map-wrap{
  height: 30vh !important;
}
</style>