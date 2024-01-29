<template>
  <v-container fluid class="pa-0">
    <!-- TODO: ADD loading de calculando rota -->
    <div id="map-wrap" style="z-index: 0;" ></div>
    <strong class="text-center teste3">Residuos coletados</strong>
    <v-progress-linear
      v-model="amountOfCollectedWastes"
      color="blue"
      class="teste2"
      bg-color="blue"
      height="25"
      :max="amountOfWastesToCollect"
      rounded
      rounded-bar
    >
      <template v-slot:default="{}">
        <strong>{{ amountOfCollectedWastes + '/' + amountOfWastesToCollect}}</strong>
      </template>
    </v-progress-linear>

    <v-bottom-navigation
      :active="bottomNav"
      color="indigo"
      height="540"
    >
      <v-card v-if="collectionID" elevation="0" class="d-flex flex-column align-center justify-center px-4 my-4">
        <v-card-title class="px-0 d-flex flex-column align-center">
          <v-avatar class="py-4 mr-2 mb-2" size="48" color="red">
            <span class="white--text text-h5">
              {{userRequests[collectionID].name ? userRequests[collectionID].name[0].toUpperCase() : ""}}
            </span>
          </v-avatar>
          <div class="d-flex flex-column text-center">
            <strong class="text-subtitle-1 text-capitalize font-weight-bold">{{userRequests[collectionID].name }}</strong>
          </div>
        </v-card-title>

        <v-card-text class="pb-0">
          <div class="d-flex flex-column align-center justify-center">
            <!-- ADDRESS -->
            <div class="pb-2 address-width text-center">
              {{ userRequests[collectionID].address }}
            </div>
    
            <!-- PHONE NUMBER  -->
            <span>
              {{ formatCellphone(userRequests[collectionID].cellphone)}}
            </span>
          </div>

          <div class="pb-0 mt-4">
            <h3>Detalhes da coleta</h3>
          </div>
          <div v-if="userRequests[collectionID].message">
            <p class="mb-2">{{ userRequests[collectionID].message }}</p>
          </div>
  
          <div class="my-2 py-2 mt-4 max-residue-height">
              <WasteCollection :wastes="userRequests[collectionID].residues"/>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between full-size-mode px-4">
          <v-btn
            @click="bottomNav = false"
            variant="text"
            :loading="loadingCollectionWaste"
            :disable="loadingCollectionWaste"
            class="button-mode-height pa-4"
            >
            Fechar
          </v-btn>
          
          <v-btn
            @click="collectWaste"
            :loading="loadingCollectionWaste"
            :disable="loadingCollectionWaste"
            class="button-mode-height pa-4 buttonMode"
            >
            Coletar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-navigation>
    
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn 
          icon="mdi-dots-vertical"
          color=""
          class="goback-float-btn"
          v-bind="props"
        />
      </template>

      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          @click="dialog = true"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog
        v-model="dialog"
        width="auto"
      >
        <v-card>
          <v-card-title>
            Você tem certeza que gostaria de sair do modo coleta?
          </v-card-title>
          <v-card-text>
            Você ainda possui {{amountOfWastesToCollect - amountOfCollectedWastes}} coletas pendentes.
          </v-card-text>
          <v-card-actions>
            <v-btn
              elevation="0"
              @click="dialog = false"
            >
              Cancelar
            </v-btn>

            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="goToHomePage"
            >
              Sair
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <Snackbar />
      <Dialog />
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ref as firebaseRef, getDatabase, update} from "firebase/database"
import { map, tileLayer, Routing, marker, icon, Marker } from "leaflet"
import { storeToRefs } from "pinia"
import { formatCellphone, DEFAULT_COORDINATES, DEFAULT_MAP_SETTINGS } from "@/utils/utils"

/* COMPONENTES */
import Snackbar from "@/components/feedback/Snackbar.vue"
import Dialog from "@/components/feedback/Dialog.vue"

/* STORES */
import { useCurrentUserStore } from "@/stores/user"
import { useFeedbackStore } from "@/stores/feedback"

/* COMPONENTES */
import WasteCollection from "@/components/WasteCollection.vue"

/* STYLES */
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import "leaflet-routing-machine"

/* IMAGES */
import iconImg from 'leaflet/dist/images/marker-icon.png';
import iconShadowImg from 'leaflet/dist/images/marker-shadow.png';
import recyclerMapPointImage from "@/assets/map_points/recycler-map-point.png"
import recyclerMapPointShadowImage from "@/assets/map_points/recycler-map-point-shadow.png"

/* STORE */
const currentUserStore = useCurrentUserStore()
const { userRequests, currentUser } = storeToRefs(currentUserStore)
const feedbackStore = useFeedbackStore()

const router = useRouter()

// Suas coordenadas atuais
const currentPosition = ref(DEFAULT_COORDINATES)
const showGeolocationAlert = ref(false)
const mapSettings = reactive(DEFAULT_MAP_SETTINGS)
const newMap = ref(null)
const dialog = ref(false)
const markers = ref([])
const markerIndex = ref(null)
const collectionID = ref("")
const bottomNav = ref(false)

const amountOfWastesToCollect = ref(0)
const amountOfCollectedWastes = ref(0)

const items = ref([
  { title: "Sair do modo coleta" },
])

const loadingCollectionWaste = ref(false)

// const waypoints = [
//   { lat: -1.306415, lng: -48.480692 },
//   { lat: -1.3062462, lng: -48.4887322 },
//   { lat: -1.4410462, lng: -48.4612806 },
// ];
const waypoints = ref([])
const waypointsWithDistance = ref([])

const loading = ref(true)

/* ICONS */
let recyclerIcon = null

/* TESTAR ISSO EM PROD */
let DefaultIcon = icon({
  iconUrl: iconImg,
  shadowUrl: iconShadowImg,
  iconSize: [24,36],
  iconAnchor: [12,36]
});

Marker.prototype.options.icon = DefaultIcon;

// MAP METHODS
/* MAPEADO */
const getUserGeolocation = () => {
  if("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords

      /* MAPEADO */
      updateUserLocation(latitude, longitude);

      /* MAPEADO */
      updateUserGeolocationInMapUI(latitude, longitude)

      buildWayPoints()

      setAmountOfWastesToCollect()

      calculateDistanceBetweenCurrentPositionAndEachWayPoint()

      orderWaypointsByDistance()

      createMap()

      createRecyclerIcon()
    });
  }else{
    showLocationAlert()
  }
}

/* NÂO MAPEADO */
const setAmountOfWastesToCollect = () => {
  amountOfWastesToCollect.value = waypoints.value.length
}

/* NÂO MAPEADO */
const increaseCollectedWastes = () => {
  amountOfCollectedWastes.value++

  if (amountOfCollectedWastes.value == amountOfWastesToCollect.value) {
    feedbackStore.toggleSnackbar()
    return
  }

  openSnackbar("Coleta realiza com sucesso!")
}

/* MAPEADO */
const updateUserLocation = (lat, lng) => {
  currentPosition.value.lat = lat
  currentPosition.value.lng = lng
}

/* MAPEADO */
const updateUserGeolocationInMapUI = (lat, long) => {
  mapSettings.latitude = lat;
  mapSettings.longitude = long;
  mapSettings.center = [lat, long]
}

/* NÂO MAPEADO */
const collectWaste = () => {
  loadingCollectionWaste.value = true

  const waste = {...userRequests.value[collectionID.value]}
  waste["hasCollected"] = true;

  const db = getDatabase();
  const { uid } = currentUser.value
  const updates = {}

  updates[`/users-requests/${uid}/${collectionID.value}`] = waste
  updates[`/users-requests/${waste.uid}/${collectionID.value}`] = waste

  update(firebaseRef(db), updates).then(() => {
    setSuccesMarker()
    increaseCollectedWastes()
  }).catch((error) => {
    console.log(error)
    openSnackbar("Falha ao recolher resíduo a coleta", "error")
  }).finally(() => {
    bottomNav.value = false
    loadingCollectionWaste.value = false
  })


}

/* NÂO MAPEADO */
const openSnackbar = (text = "", color = "success") => {
  feedbackStore.setSnackbarText(text)
  feedbackStore.setSnackbarColor(color)
  feedbackStore.openSnackbar()
}

/* NÂO MAPEADO */
const showLocationAlert = () => {
  showGeolocationAlert.value = true
}

/* NÂO MAPEADO */
const openMarkerPopup = (uid, index) => {
  if (userRequests.value[uid]['hasCollected']) return
  
  markerIndex.value = index
  collectionID.value = uid
  bottomNav.value = true
}

const setSuccesMarker = () => {
  const {latitude, longitude} = userRequests.value[collectionID.value]
  markers.value[markerIndex.value].remove()

  // create new marker
  marker([latitude, longitude], {icon: createIcon('green')}).addTo(newMap.value).bindPopup('Coleta realizada!');
}

const createIcon = (color) => {
  return icon({
    iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

/* MAPEADO */
const createMap = () => {
	const { zoom } = mapSettings
  const { lat, lng } = currentPosition.value

  newMap.value = map("map-wrap").setView([lat, lng], zoom)
  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(newMap.value);

  waypoints.value.forEach(({lat, lng, uid}, index) => {
    const point = marker([lat, lng]).addTo(newMap.value).on("click", () => openMarkerPopup(uid, index));
    markers.value.push(point);
  });
  
  /* DA PRA ARRASTAR OS ICONES AAKKAKAKA */
  Routing.control({
    waypoints: buildWayPointsOrderedByDistance(true),
    lineOptions: {
      styles: [{ color: 'blue', opacity: 0.8, weight: 3 }],
      addWaypoints: false
    },
    routeWhileDragging: false,
    createMarker: function () {
      return null;
    },
    show: false,
    collapsible: false
    //language: 'pt-br' does not work
  }).addTo(newMap.value);

  // Remove a capacidade de arrastar os marcadores após serem criados
  markers.value.forEach(point => {
    point.dragging.disable();
  });
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
  const { lat, lng } = currentPosition.value
  marker([lat, lng], {icon: recyclerIcon}).addTo(newMap.value);

}

// Function to calculate the distance between two points using the Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
  const radLat1 = (Math.PI * lat1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radTheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radLat1) * Math.sin(radLat2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Distância em milhas
  return dist;
}

/* MAPEADO */
// Calcular a distância entre sua localização e cada waypoint
const calculateDistanceBetweenCurrentPositionAndEachWayPoint = () => {
  const { lat, lng } = currentPosition.value
  if (!lat && !lng){
    return
  }

  waypointsWithDistance.value = waypoints.value.map((waypoint) => {
    const distance = haversine(
      lat,
      lng,
      waypoint.lat,
      waypoint.lng
    );
    return { waypoint, distance };
  });
}

/* MAPEADO */
// Os waypoints agora estão classificados por proximidade, o mais próximo vem primeiro
const orderWaypointsByDistance = () => {
  waypointsWithDistance.value.sort((a, b) => a.distance - b.distance)
}

const buildWayPoints = () => {
  for (let uid in userRequests.value) {
    if(userRequests.value[uid]['hasAccepted'] && !userRequests.value[uid]['hasCollected']) {
      const { latitude, longitude } = userRequests.value[uid]

      waypoints.value.push({
        lat: latitude, lng: longitude, uid
      })
    }
  }
}

/* NÂO MAPEADO */
const buildWayPointsOrderedByDistance = ( add = false) => {
  const teste = waypointsWithDistance.value.map(({waypoint}) => {
    const { lat, lng } = waypoint
    return { lat, lng }
  })

  if (add) {
    const { lat, lng } = currentPosition.value
    teste.unshift({
      lat, lng
    })
  }

  return teste
}

const goToHomePage = () => {
  router.push("/home")
}

onMounted(() => {
  buildWayPoints()
  if(!currentUser.value.isRecycler || waypoints.value.length == 0) {
    goToHomePage()
  }
  
  loading.value = true
  getUserGeolocation()
})

</script>

<style>
#map-wrap{
  height: 100vh !important; 
}

.leaflet-control-container .leaflet-routing-container-hide {
  display: none;
}

.buttonMode {
  color: white;
  background-color: #2196F3;
  margin-top: 0;
}

.full-size-mode{
  width: 100%;
}

.button-mode-height {
  height: 2.4rem !important;
}

.goback-float-btn{
	position:fixed;
	width:60px;
	height:60px;
	top: 20px;
	right:20px;
}

.teste3 {
  position: absolute !important;
  top: 10px !important;
  left:0;
  right:0;
  margin-left:auto;
  margin-right:auto;
}

.teste2 {
  position: absolute !important;
  top: 40px !important;
  color:white !important;
  background-color: #81C784 !important;
  width: 40vw;
}
</style>