<!-- eslint-disable -->
<template>
  <v-container class="calculated-height">
    <v-tabs
      v-model="tab"
      color="blue"
      align-tabs="center"
    >
      <v-tab :value="1">Pedidos de Coleta</v-tab>
      <v-tab :value="2">Histórico de Pedidos</v-tab>
    </v-tabs>
    <v-row class="flex-column white my-4 justify-center align-center">
      <v-card
        outlined
        v-for="(requester, wasteID) in wastesRequests"
        :key="wasteID"
        class="my-4"
        width="550"
        max-width="600"
      >
        <v-card-title class="align-center justify-space-between">
          <div class="d-flex align-center">
            <strong class="font-weight-medium">Catador responsável</strong>
            <v-spacer></v-spacer>
            
            <v-menu v-if="!requester.hasCanceled && !requester.hasAccepted && !requester.hasDeclined">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
              </template>

              <v-list>
                <v-list-item
                  v-for="(item, i) in items"
                  :key="i"
                  @click="openDialog(requester, wasteID)"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </v-card-title>

        <v-card-text class="pb-2">
          <div v-if="!requester.pendingRequestWithNoRecycler">
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
            
            <p class="mb-4">
              <strong class="font-weight-medium">Telefone:</strong>
              {{ formatCellphone(requester.cellphone) }}
            </p>
          </div>

          <div v-else class="pb-4">
            Aguardando Catador
          </div>

          <v-divider></v-divider>
          <p class="text-subtitle-1 font-weight-medium mt-4">
            Detalhes da coleta
          </p>

          <p class="mb-4">{{ requester.address }}</p>
          <WasteCollection :wastes="requester.residues"/>

        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <span class="success--text" v-if="requester.hasAccepted">
            Aceito <v-icon color="success">mdi-progress-check</v-icon>
          </span>
          <span class="warning--text" v-else-if="requester.hasDeclined">
            Recusado <v-icon color="warning">mdi-progress-alert</v-icon>
          </span>
          <span class="error--text" v-else-if="requester.hasCanceled">
            Cancelado <v-icon color="error">mdi-progress-close</v-icon>
          </span>
          <span v-else>
            Aguardando coleta <v-icon>mdi-progress-clock</v-icon>
          </span>
        </v-card-actions>
      </v-card>

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
              @click="cancelRequest"
            >
              Confirmar cancelamento
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-row v-if="noWastes && !loading" class="d-flex align-center flex-column">
      <p class="my-4">Você não tem nenhuma solicitação de coleta! </p>
      <v-btn 
        elevation="0"
        class=""
        color="blue"
        @click="goToRequestCollectionPage"
      >
        Solicitar coleta
      </v-btn>
    </v-row>
    <Snackbar />
  </v-container>
</template>
<script setup>
import { ref, computed, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import {
  ref as firebaseRef,
  getDatabase,
  update,
  onValue,
  query,
  equalTo,
  orderByChild } from "firebase/database"

/* STORE */
import { useCurrentUserStore } from "@/stores/user"
import { useFeedbackStore } from "@/stores/feedback"

import { formatCellphone } from "@/utils/utils"
import WasteCollection from "@/components/WasteCollection.vue"
import Snackbar from "@/components/feedback/Snackbar.vue"

const router = useRouter()

/* STORE */
const currentUserStore = useCurrentUserStore()
const { currentUser, userRequests } = storeToRefs(currentUserStore)

const feedbackStore = useFeedbackStore()

const dialog = ref(false)
const loading = ref(false)
const selectedWaste = ref({})
const selectedWasteID = ref("")
const userPendingRequests = ref({})

const tab = ref(1)
const items = ref([
  { title: 'Cancelar coleta' },
])

/* mapeado */
const cancelRequest = () => {
  const { hasCanceled, hasAccepted, hasDeclined, pendingRequestWithNoRecycler } = selectedWaste.value
  const wasteID = selectedWasteID.value

  if(hasCanceled || hasAccepted || hasDeclined){
    return
  }

  loading.value = true
  if (pendingRequestWithNoRecycler) {
    cancelPendingRequest()
    return
  }

  const db = getDatabase()
  const { uid } = currentUser.value

  const updates = {}

  updates[`/users-requests/${uid}/${wasteID}/hasCanceled`] = true
  updates[`/users-requests/${selectedWaste.value.uid}/${wasteID}/hasCanceled`] = true

  update(firebaseRef(db), updates).then(() => {
    openSnackbar("Solcitação de coleta cancelada com sucesso!")
  }).catch((error) => {
    console.log(error)
    openSnackbar("Um erro ocorreu ao cancelar a solicitação de coleta", "error")
  }).finally(() => {
    closeDialog()
    loading.value = false
  })
}
/* FALTA MAPEAR */
const cancelPendingRequest = () => {
  const wasteID = selectedWasteID.value
  const data = {...selectedWaste.value}
  data['hasCanceled'] = true

  const db = getDatabase()
  const { uid } = currentUser.value

  const updates = {}

  updates[`/users-requests/${uid}/${wasteID}`] = data
  updates[`/pending-requests/${wasteID}`] = null

  update(firebaseRef(db), updates).then(() => {
    openSnackbar("Solcitação de coleta cancelada com sucesso!")
    userPendingRequests.value[wasteID]['hasCanceled'] = true
  }).catch((error) => {
    console.log(error)
    openSnackbar("Um erro ocorreu ao cancelar a solicitação de coleta", "error")
  }).finally(() => {
    closeDialog()
    loading.value = false
  })
}


const closeDialog = () => {
  dialog.value = false
}

const openSnackbar = (text = "", color = "success") => {
  feedbackStore.setSnackbarText(text)
  feedbackStore.setSnackbarColor(color)
  feedbackStore.openSnackbar()
}

const fetchCurrentUserPendingRequests = () => {
  
  const { uid } = currentUser.value

  if (!uid) {
    return false
  }

  const database = getDatabase()
  
  onValue(query(firebaseRef(database, `/pending-requests/`), orderByChild("uid"), equalTo(uid)) , (snapshot) => {
    Object.assign(userPendingRequests.value, snapshot.val() || {})
    loading.value = false
  })
}

const openDialog = (waste, wasteID) => {
  selectedWaste.value = waste
  selectedWasteID.value = wasteID
  dialog.value = true
}

const noWastes = computed(() => {
  
  if (tab.value == 1 && JSON.stringify(userRequests.value) === "{}" || JSON.stringify(wastesRequests.value) === "{}") {
    return true
  }
  
  return false

})

const wastesRequests = computed(() => {
  const allWastes = {...userRequests.value, ...userPendingRequests.value}
  const wasteHistory = {}
  const pendingwastes = {}

  for (let id in allWastes) {
    if(allWastes[id]['hasCanceled'] || allWastes[id]['hasCollected']) {
      wasteHistory[id] = allWastes[id]
      continue
    }
    pendingwastes[id] = allWastes[id]
  }
  
  if (tab.value == 1) {
    return pendingwastes
  }

  return wasteHistory
})

const goToRequestCollectionPage = () => {
  const route = {path: "/request-collection"}
  router.push(route)
}

onBeforeMount(() => {
  loading.value = true
	fetchCurrentUserPendingRequests()
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
</style>