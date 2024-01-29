<!-- eslint-disable -->
<template>
  <div id="map-wrap"></div>
</template>
<script setup>
import { map, tileLayer, marker, icon, Marker } from "leaflet"
import { onMounted, reactive, ref } from "vue"
import { DEFAULT_COORDINATES, DEFAULT_MAP_SETTINGS } from "@/utils/utils"

import "leaflet/dist/leaflet.css"
import iconImg from 'leaflet/dist/images/marker-icon.png';
import iconShadowImg from 'leaflet/dist/images/marker-shadow.png';

const currentPosition = ref(DEFAULT_COORDINATES)
const showGeolocationAlert = ref(false)
const mapSettings = reactive(DEFAULT_MAP_SETTINGS)
const newMap = ref(null)
const selectedMarker = ref(null)

let DefaultIcon = icon({
  iconUrl: iconImg,
  shadowUrl: iconShadowImg,
  iconSize: [24,36],
  iconAnchor: [12,36]
});

Marker.prototype.options.icon = DefaultIcon;

const emit = defineEmits(["coordinates"])

// MAP METHODS

const getUserGeolocation = () => {
  if("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(position => {
      updateUserLocation(position.coords.latitude, position.coords.longitude);
      updateUserGeolocationInMapUI(position.coords.latitude, position.coords.longitude)
      createMap()
    });
  }else{
    showMissingLocationAlert()
  }
}

const updateUserLocation = (lat, long) => {
  currentPosition.value.lat = lat
  currentPosition.value.long = long
}

const updateUserGeolocationInMapUI = (lat, long) => {
  mapSettings.latitude = lat;
  mapSettings.longitude = long;
  mapSettings.center = [lat, long]
}

const showMissingLocationAlert = () => {
  showGeolocationAlert.value = true
}


const createMap = () => {
  const lat = currentPosition.value.lat
  const lng = currentPosition.value.long
  const coordinates = [lat, lng]
	const { zoom } = mapSettings

  newMap.value = map("map-wrap").setView(coordinates, zoom)
  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(newMap.value);

  newMap.value.on('click', onMapClick);
  createMarkers({lat, lng})
}

const onMapClick = (e) => {
  if (selectedMarker.value) {
    removeMarkers()
  }

  createMarkers(e.latlng)
}

const createMarkers = ({lat, lng}) => {
  selectedMarker.value = marker([lat, lng]).addTo(newMap.value);
  emit("coordinates", {lat, lng})
}

const removeMarkers = () => {
  selectedMarker.value.remove()
}

onMounted(() => {
  getUserGeolocation()
})
</script>
<style scoped>
#map-wrap{
  height: 30vh !important;
}
</style>