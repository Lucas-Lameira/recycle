<!-- eslint-disable -->
<template>
  <v-container class="calculated-height">
    <v-tabs
      v-model="tab"
      color="green"
      align-tabs="center"
    >
      <v-tab :value="1">Coletas pendentes</v-tab>
      <v-tab :value="2">Histórico de coletas</v-tab>
    </v-tabs>
    
    <v-row class="flex-column white justify-center align-center">
      <v-card
        outlined
        v-for="(requester, index) in wastesRequests"
        :key="index"
        class="my-8"
        max-width="600"
        width="550"
      >
        <v-card-title class="font-weight-bold">
          Dados do Solicitante
        </v-card-title>

        <v-card-text class="pb-2">
          <v-row class="d-flex flex-column">

            <v-col>
              <div class="d-flex pb-4 align-center">
                <!-- ADD RANDOM COLORS HERE -->
                <v-avatar color="yellow">
                  <span class="black--text text-h5">
                    {{requester.name ? requester.name[0].toUpperCase() : ""}}
                  </span>
                </v-avatar>

                <div class="d-flex flex-column ml-2 pb-1">
                  <strong class="text-body-1 font-weight-medium text-capitalize">{{ requester.name }}</strong>
                  <small class="lineHeight font-weight-regular">{{ requester.email }}</small>
                </div>
              </div>

              <MapView
                v-if="!loadingMap && requester.coordinates"
                :mapID="index"
                :userLocation="currenPosition"
                :wasteCoordinates="requester.coordinates"
              />

              <p class="my-2">
                <strong>Endereço:</strong>
                {{ requester.address }}
              </p>

              <p class="mb-4 ">
                <strong>Telefone:</strong>
                {{ formatCellphone(requester.cellphone) }}
              </p>
            </v-col>
          </v-row>

          <v-divider></v-divider>

          <p class="text-subtitle-1 font-weight-bold mt-4">
            Detalhes da coleta
          </p>

          <p class="mb-4">{{ requester.message}}</p>
          <WasteCollection :wastes="requester.residues"/>
        </v-card-text>

        <v-card-actions class="justify-end mx-2 mb-2">
          <span class="success--text" v-if="requester.hasAccepted">
            Aguardando coleta <v-icon>mdi-progress-clock</v-icon>
          </span>
          <span class="warning--text" v-else-if="requester.hasDeclined">
            Recusado <v-icon color="warning">mdi-progress-alert</v-icon>
          </span>
          <span class="error--text" v-else-if="requester.hasCanceled">
            Cancelado <v-icon color="error">mdi-progress-close</v-icon>
          </span>
          <v-spacer v-if="!requester.hasAccepted && tab==1"></v-spacer>
          <div v-if="!requester.hasAccepted && tab==1">
            <v-btn
              elevation="0"
              text
              class="text-none"
              @click="opendDialog(requester, index)"
              :disabled="requester.hasCanceled || requester.hasAccepted || requester.hasDeclined"
              >
              
              Recusar
            </v-btn>
            <v-btn
              color="green"
              elevation="0"
              class="white--text text-none"
              :disabled="requester.hasCanceled || requester.hasAccepted || requester.hasDeclined"
              @click="acceptRequest(requester, index)"
            >
              Aceitar
            </v-btn>

          </div>
        </v-card-actions>
      </v-card>
    </v-row>

    <v-btn
      v-if="initCollectionMode"
      @click="goToCollectionMode"
      color="blue"
      class="squared-btn"
    >
      Iniciar coleta
    </v-btn>

    <v-row v-if="noWastes" class="d-flex align-center flex-column">
      <p class="my-4">Nenhuma solicitação de coleta pendente.</p>
    </v-row>

    <Snackbar />

    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card>
        <v-card-text>
          Você tem certeza que gostaria de cancelar a solicitação de coleta?
        </v-card-text>
        <v-card-actions>
          <v-btn
            elevation="0"
            @click="dialog = false"
          >
            Fechar
          </v-btn>

          <v-spacer></v-spacer>
          <v-btn
            color="error"
            :disabled="loading"
            :loading="loading"
            @click="declineRequest"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"
import { ref as firebaseRef, getDatabase, update} from "firebase/database"

/* STORE */
import { storeToRefs } from "pinia"
import { useCurrentUserStore } from "@/stores/user"
import { useFeedbackStore } from "@/stores/feedback"
import { formatCellphone } from "@/utils/utils"
import WasteCollection from "@/components/WasteCollection.vue"
import MapView from "@/components/MapView.vue"
import Snackbar from "@/components/feedback/Snackbar.vue"


const loadingMap = ref(true)
const tab = ref(1)
const dialog = ref(false)
const loading = ref(false)
const selectedWaste = ref({})
const wasteID = ref("")

/* STORE */
const currenPosition = ref([])
const currentUserStore = useCurrentUserStore()
const { currentUser, userRequests } = storeToRefs(currentUserStore)
const feedbackStore = useFeedbackStore()

/* Router */
const router = useRouter()

const getUserGeolocation = () => {
  loadingMap.value = true
  if("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(position => {
      updateUserLocation(position.coords.latitude, position.coords.longitude);
      loadingMap.value = false
    });
  }
}

const updateUserLocation = (latitude, longitude) => {
  currenPosition.value = [latitude, longitude]
}

const acceptRequest = async (request, index) => {
  request["hasAccepted"] = true;

  const db = getDatabase();
  const { uid } = currentUser.value
  const updates = {}

  updates[`/users-requests/${uid}/${index}`] = request
  updates[`/users-requests/${request.uid}/${index}`] = request

  update(firebaseRef(db), updates).then(() => {
    openSnackbar("Coleta aceita!")
  }).catch((error) => {
    console.log(error)
    openSnackbar("Falha ao aceitar a coleta", "error")
  }).finally(() => {})
}

/* TODO: ADICIONAR RESIDUO DE VOLTA AOS PENDENTES */
const declineRequest = () => {
  if(selectedWaste.value.hasAccepted){
    return
  }

  loading.value = true

  const pendingWaste = {...selectedWaste.value}
  
  const db = getDatabase();
  const { uid } = currentUser.value
  const updates = {}

  updates[`/users-requests/${uid}/${wasteID.value}`] = null
  updates[`/users-requests/${selectedWaste.value.uid}/${wasteID.value}`] = null
  
  pendingWaste['hasAccepted'] = false
  pendingWaste['hasDeclined'] = false
  updates[`/pending-requests/${wasteID.value}/`] = pendingWaste

  update(firebaseRef(db), updates).then(() => {
    currentUserStore.removeWaste(wasteID.value)
    openSnackbar("Coleta recusada!")
  }).catch((error) => {
    console.log(error)
    openSnackbar("Um erro ocorreu ao cancelar a coleta", "error")
  }).finally(() => {
    dialog.value = false
    loading.value = false
  })
}

const openSnackbar = (text = "", color = "success") => {
  feedbackStore.setSnackbarText(text)
  feedbackStore.setSnackbarColor(color)
  feedbackStore.openSnackbar()
}

const goToCollectionMode = () => {
  router.push({
    path: "/collection-mode",
  })
}

const opendDialog = (waste, id) => {
  selectedWaste.value = waste
  wasteID.value = id
  dialog.value = true
}

/* COMPUTED */
const noWastes = computed(() => {
  
  if (tab.value == 1 && JSON.stringify(userRequests.value) === "{}" || JSON.stringify(wastesRequests.value) === "{}") {
    return true
  }
  
  return false

})

const initCollectionMode = computed(() => {
  let hasCollection = false
  if (tab.value == 1) {
    for (let waste in wastesRequests.value) {
      wastesRequests.value[waste]['hasAccepted']
      hasCollection = true
    }
  }

  return hasCollection
  
})

const wastesRequests = computed(() => {
  const wasteHistory = {} // cancelado, recusado, , 
  const pendingwastes = {} // aceito e pendente (não aceito)
  
  for (let id in userRequests.value) {
    if(userRequests.value[id]['hasCanceled'] || userRequests.value[id]['hasCollected'] || userRequests.value[id]["hasDeclined"] ) {
      wasteHistory[id] = userRequests.value[id]
      continue
    }
    pendingwastes[id] = userRequests.value[id]
  }
  
  if (tab.value == 1) {
    return pendingwastes
  }

  return wasteHistory
})

onMounted(() => {
  getUserGeolocation()
})
</script>

<style scoped>
.calculated-height {
  overflow-y: scroll;

  height: calc(100vh - 56px) !important;
}

.calculated-height::-webkit-scrollbar {
  display: none;
}

.lineHeight{
  line-height: 1rem;
}

.address-width {
  max-width: 100px;
}

.squared-btn{
	position:fixed;
	bottom:80px;
	right:40px;
}

</style>