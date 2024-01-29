<template>
	<v-container fluid class="pa-0">
		<div id="map-wrap" style="z-index: 0;" ></div>
    
    <!-- TODO: Condicionar a altura conforme o tamanho da tela -->
    <v-bottom-navigation
      :active="bottomNav"
      color="indigo"
      :height="currentUser.isRecycler ? '540' : '400'"
    >
      <v-progress-circular v-if="!currentRecycler" color="blue" model-value="20" indeterminate :size="46" ></v-progress-circular>
      <v-card v-else elevation="0" class="d-flex flex-column align-center justify-center px-4 my-4">
        <v-card-title class="px-0 d-flex flex-column align-center">
          <v-avatar class="py-4 mr-2 mb-2" size="48" color="red">
            <span class="white--text text-h5" v-if="currentRecycler.name">
              {{currentRecycler.name ? currentRecycler.name[0].toUpperCase() : ""}}
            </span>
            <span v-else-if="collection.name" class="white--text text-h5">
              {{collection.name ? collection.name[0].toUpperCase() : ""}}
            </span>
          </v-avatar>
          <div class="d-flex flex-column text-center">
            <strong class="text-subtitle-1 text-capitalize font-weight-bold">{{currentRecycler.name || collection.name }}</strong>
            <span v-if="!currentUser.isRecycler" class="text-subtitle-2 font-weight-regular">{{currentRecycler.email || collection.email}}</span>
          </div>
        </v-card-title>

        <v-card-text class="pb-0">
          <div class="d-flex flex-column align-center justify-center">
            <!-- ADDRESS -->
            <div class="pb-2 address-width text-center" v-if="currentUser.isRecycler">
              {{ currentUser.isRecycler ? collection.address : currentRecyclerAddress }}
            </div>
    
            <!-- PHONE NUMBER  -->
            <span>
              {{ formatCellphone(currentRecycler.cellphone || collection.cellphone)}}
            </span>
          </div>

          <div class="pb-0 mt-4">
            <h3>{{ currentUser.isRecycler ? "Detalhes da coleta" : "Tipos de resíduos que coleta" }}</h3>
          </div>
          <div v-if="collection.message">
            <p class="mb-2">{{ collection.message }}</p>
          </div>
  
          <div v-if="currentUser.isRecycler" class="my-2 py-2 mt-4 max-residue-height">
              <WasteCollection :wastes="collection.residues"/>
          </div>
          
          <div v-else  class="d-flex my-2">
            <!-- RECYCLE CARD -->
            <div 
              v-for="(residue, index) in currentRecycler.residue" 
              :key="index"
            >
              <v-card 
                v-if="residue.selected"
                :color="residue.color"
                elevation="0"
                height="70"
                width="60"
                class="d-flex flex-column align-center mr-2"
              >
                <v-icon color="white" class="mt-3">mdi-recycle</v-icon>
                <strong class="font-weight-bold mt-1">{{residue.name}}</strong>
              </v-card>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex align-center justify-space-between full-size px-4">
          <button
            @click="bottomNav = false"
            variant="outline"
            class="close-button"
            >
            Fechar
          </button>

          <button
            v-if="currentUser.isRecycler"
            @click="acceptRequestCollection"
            color="blue"
            class="button"
            :loading="loadingRequest"
            >
            Aceitar coleta
          </button>
          <button
            v-else
            @click="goToRequestCollectionPage"
            color="blue"
            class="button"
            >
            Solicitar coleta
          </button>
        </v-card-actions>
      </v-card>
    </v-bottom-navigation>

    <v-btn 
      v-if="!currentUser.isRecycler"
      @click="goToRequestCollectionPage(false)"
      icon="mdi-plus"
      color="blue"
      class="float-btn"
    />
    <v-btn
      v-if="currentUser.isRecycler && hasWastesToCollect"
      @click="goToCollectionMode"
      color="blue"
      class="squared-btn"
    >
      Iniciar coleta
    </v-btn>

    <Snackbar />
	</v-container>
</template>
<script setup>
import "leaflet/dist/leaflet.css";
import { map, tileLayer, marker, Marker, icon } from "leaflet"
import { onMounted, reactive, ref, computed } from "vue"
import { useRouter } from "vue-router"
import { ref as firebaseRef, getDatabase, onValue, update} from "firebase/database"

/* STORE */
import { storeToRefs } from "pinia"
import { useCollectionStore } from "@/stores/collection"
import { useCurrentUserStore } from "@/stores/user"
import { useFeedbackStore } from "@/stores/feedback"

import { formatAddress, formatCellphone } from "@/utils/utils"
import WasteCollection from "@/components/WasteCollection.vue"
import Snackbar from "@/components/feedback/Snackbar.vue"

import iconImg from 'leaflet/dist/images/marker-icon.png';
import iconShadowImg from 'leaflet/dist/images/marker-shadow.png';

/* STORE */
const collectionStore = useCollectionStore()
const currentUserStore = useCurrentUserStore()
const { currentUser, userRequests } = storeToRefs(currentUserStore)
const feedbackStore = useFeedbackStore()

/* ROUTER */
const router = useRouter()

/*  */
let currentRecycler = ref({})
const bottomNav = ref(false)
const collectionID = ref("")
const loadingRequest = ref(false)
let newMap = reactive(null)
const markers = ref({})

const collection = ref({})

/* LEAFLETICONS */
let DefaultIcon = icon({
  iconUrl: iconImg,
  shadowUrl: iconShadowImg,
  iconSize: [24,36],
  iconAnchor: [12,36]
});

Marker.prototype.options.icon = DefaultIcon;

/* TODO: Get this based on user location */
const mapSettings = reactive({
	latitude: -1.3062409,
	longitude: -48.4887233,
	center: [],
	zoom: 15,
	maxZoom: 19
})

const createMap = () => {
	const { latitude, longitude, zoom } = mapSettings
  newMap = map("map-wrap").setView([latitude, longitude], zoom)
  tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(newMap);

  newMap.on('click', onMapClick);
}

const onMapClick = () => {
  if(bottomNav.value) {
    bottomNav.value = false
  }
}


//TODO: how to make this load user current position
const getUserGeolocation = () => {
  if("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(position => {
      updateUserLocation(position.coords.latitude, position.coords.longitude);
      mapSettings.center = [position.coords.latitude, position.coords.longitude]
    });
  }else{
    //emitir um alert aqui
    mapSettings.zoom = 3
  }
}

const updateUserLocation = (lat, long) => {
  mapSettings.latitude = lat;
  mapSettings.longitude = long;
}

const fetchRecyclers = async () => {
  const database = getDatabase()
  onValue(firebaseRef(database, "recyclers"), (snapshot) => {
    createMarkers(snapshot.val())
  }, {onlyOnce: true})
}

const fetchPendingRequests = async () => {
  const database = getDatabase()
  onValue(firebaseRef(database, "pending-requests"), (snapshot) => {
    createMarkers(snapshot.val())
  }, {onlyOnce: true})
}

const getRecyclerById = (uid) => {
  const database = getDatabase()

  onValue(firebaseRef(database, `users/${uid}`) , (snapshot) => {
    currentRecycler.value = snapshot.val()
  }, {onlyOnce: true})
}

const goToRequestCollectionPage = (choseRecycler = true) => {
  const route = {path: "/request-collection"}

  if (choseRecycler) {
    collectionStore.currentRecycler = currentRecycler.value
    bottomNav.value = false
    route.query = { uid: currentRecycler.value.uid }
  }

  router.push(route)
}

const openMarkerPopup = (pointInMap, pointID) => {
  if (!currentUser.value.isRecycler) {
    getRecyclerById(pointInMap.uid)
  }else {
    collection.value = pointInMap
    collectionID.value = pointID
  }

  bottomNav.value = true
}

const createMarkers = (points) => {
  for (let point in points ) {
    const {latitude, longitude} = points[point]
    const leafMarker = marker([latitude, longitude]).addTo(newMap).on("click", () => openMarkerPopup(points[point], point));
    markers.value[point] = leafMarker
  }
}

const removeMarker = (wasteID) => {
  markers.value[wasteID].remove()
}

const goToCollectionMode = () => {
  router.push({
    path: "/collection-mode",
  })
}

const acceptRequestCollection = async () => {
  loadingRequest.value = true
  const wasteID = collectionID.value
  const discarderUID = collection.value.uid
  
  const { name, email, cellphone, uid } = currentUser.value
  
  //Esses dados serão salvos pra o catador
  //JSON.parse(JSON.stringify(collection.value))

  const recyclerWaste = {...collection.value}

  recyclerWaste["pendingRequestWithNoRecycler"] = false
  recyclerWaste["hasAccepted"] = true
  
  //Esses dados serão salvos pra o descartador, para ele saber qual o catador associado aquela requisição
  const discarderWaste = {...recyclerWaste}
  discarderWaste["address"] = formatAddress(currentUser.value),
  discarderWaste["cellphone"] = cellphone
  discarderWaste["email"] = email
  discarderWaste["name"] = name
  discarderWaste["uid"] = uid
  
  const updates  = {}
  updates['/users-requests/' + discarderUID + '/' + wasteID] = discarderWaste;
  updates['/users-requests/' + uid + '/' + wasteID] = recyclerWaste;
  
  // Isso aqui é um exclude no banco
  updates['/pending-requests/' + collectionID.value] = null;
  
  const db = getDatabase()

  update(firebaseRef(db), updates).then(() => {
    //goToSuccesPage()
    openSnackbar("Coleta aceita!")
    removeMarker(wasteID)
  }).catch((error) => {
    console.log(error)
    openSnackbar("Um erro ocorreu ao aceitar a coleta", "error")
  }).finally(() => {
    loadingRequest.value = false;
    bottomNav.value = false
  })
}

const openSnackbar = (text = "", color = "success") => {
  feedbackStore.setSnackbarText(text)
  feedbackStore.setSnackbarColor(color)
  feedbackStore.openSnackbar()
}


/* COMPUTED */
const currentRecyclerAddress = computed(() => {  
  const {street, uf, city, district, complement, cep, number} = currentRecycler.value
  return `${street}, ${complement}. Nº ${number} - ${district}, ${city} - ${uf}. CEP: ${cep}`
})

const computedUser = computed(() => {
  return currentUser.value
})

const hasWastesToCollect = computed(() => {
  let hasWastes = false

  for (let id in userRequests.value) {
    if(userRequests.value[id]['hasAccepted'] && !userRequests.value[id]['hasCollected']) {
      hasWastes = true
      break
    }
  }

  return hasWastes
})

onMounted(() => {
  getUserGeolocation()

  if (computedUser.value.isRecycler) {
    fetchPendingRequests()
  }else {
    fetchRecyclers()
  }
  createMap()
})
</script>

<style scoped>
#map-wrap{
  height: calc(100vh - 56px) !important; 
}
.button {
  background-color: #2196F3;
  padding: 0 16px;
  height: 2.4rem;
  margin-top: 1rem;
  font-weight: bold;
  color: white;
  font-size: 0.9rem;
  border-radius: 4px;
}

.close-button {
  padding: 0 16px;
  height: 2.4rem;
  margin-top: 1rem;
  font-weight: bold;
  color: rgb(59, 59, 59);
  font-size: 0.9rem;
  border-radius: 4px;
  border: 1px solid black;
}


.float-btn{
	position:fixed;
	width:60px;
	height:60px;
	bottom:80px;
	right:40px;
}

.squared-btn{
	position:fixed;
	bottom:80px;
	right:40px;
}

.address-width{
	max-width: 400px;
}

.max-residue-height{
  max-height: 160px;
  overflow-y: scroll;
}

.max-residue-height::-webkit-scrollbar {
  display: none;
}

.border{
  border: 1px solid black;
}

.full-size{
  width: 100%;
}
</style>