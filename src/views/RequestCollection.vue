<template>
  <v-container>
    <v-row class="my-4 mx-2 px-4 d-flex align-center justify-end text-h6">
      <strong>{{step}}/2</strong>
      <v-spacer></v-spacer>
      <v-btn
        elevation="0"
        text
        class="text-none"
        variant="outlined"
        @click="previousStep"
      >
        <v-icon left>mdi-arrow-left</v-icon>
        Voltar
      </v-btn>
    </v-row>
    <Alert />

    <v-window v-model="step">
      <v-window-item :value="1" class="px-2 pt-2">
        <v-card elevation="0 px-4">
          <!-- TITLE -->
          <v-card-title class="px-0">
            Escolha os resíduos
            <v-tooltip
              location="top"
              text="Escolha a categoria e quais resíduos você tem para descartar, assim o catador sabe o que vai coletar">
              <template v-slot:activator="{ props }">
                <v-icon
                  color="blue"
                  dark
                  right
                  v-bind="props"
                >
                  mdi-help-circle
                </v-icon>  
              </template>
            </v-tooltip>
          </v-card-title>

          <v-card-text>
            <v-row class="d-block mb-8 mt-2">
              <v-select
                v-model="selectedResidueType"
                variant="outlined"
                :items="computedResidueType"
                label="Selecione o tipo de Resíduo"
                item-color="green"
              ></v-select>

              <v-select
                v-model="selectedResidue"
                attach
                chips
                :disabled="!hasSelectedAResidueType"
                :items="possibleResidues"
                item-color="green"
                class="green--text"
                label="Selecionar resíduos"
                multiple
                variant="outlined"
              ></v-select>

              <v-text-field
                v-model="bags"
                min="1"
                max="100"
                label="Quantidade de sacolas"
                variant="outlined"
                type="number"
                :hint="showHint ? 'O número de sacolas permitidas é de 1 a 100' : ''"
                :persistent-hint="showHint"
                @change="validateAmountOfBags"
              >
              </v-text-field>

              <v-btn 
                color="blue"
                class="white--text text-none mt-2"
                elevation="0"
                @click="addToDiscard"
                :disabled="isAddActionDisbled"
              >
                Adicionar
              </v-btn>
            </v-row>

            <!-- SEÇÃO DOS RESÌDUOS PARA O DESCARTE -->
            <v-row>
              <v-card-title class="px-0">
                Resíduos para descarte
                <v-tooltip
                  location="top"
                  text="Nesta seção ficam os resíduos que você selecionou para descarte.">
                  <template v-slot:activator="{ props }">
                      <v-icon
                      color="blue"
                      dark
                      right
                      v-bind="props"
                    >
                      mdi-help-circle
                    </v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
            </v-row>
            
            <div v-if="nothingToDiscard" class="emptSize">
              <div class="background">
                Nenhum resíduo para descarte
              </div>
            </div>

            <div v-else class="my-2 py-2 mt-4 max-residue-height">
              <div v-for="(item, type) in itemsToDiscard" :key="type" class="d-flex align-center border mb-2 pt-2">
                <img class="mb-2 mx-4" width="50" :src="getTrashCan(type)"/>
                
                <div class="mx-4 full-size" >
                  <div class="d-flex mb-4">
                    <strong>{{ type }}</strong>
                    <v-spacer></v-spacer>
                    <strong>Sacolas: {{ item.bags || 1 }}</strong>
                  </div>
                  
                  <div class="d-flex">
                    <v-chip
                      v-for="residue in item.residues"
                      :key="residue"
                      class="mr-2 mb-2 font-weight-bold text-capitalize"
                      :color="`${residueColors[type]} lighten-2`"
                      label
                      size="small"
                    >
                      <span :class="type == 'Metal' ? 'text-grey-darken-4' : ''">{{ residue }}</span> 
                    </v-chip>
  
                    <v-spacer></v-spacer>
  
                    <v-btn icon variant="text" @click="removeDiscardItem(type)">
                      <v-icon color="red">mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- CONFIRMAR PEDIDO AO INVÈS DE DADOS -->
      <v-window-item :value="2" class="px-4 pb-0">
        <v-row class="mb-4 flex-column">
          <v-card-title> Confirmar solicitação de coleta </v-card-title>
          <v-card-subtitle>
            Os dados abaixo serão enviados  {{
              chosenRecycler ? ` para ${chosenRecycler.name}` : ''}} na solicitação de coleta
          </v-card-subtitle>
        </v-row>

        <v-card elevation="0">
          <!-- AVATAR -->
          <div class="d-flex pb-4 pt-2">
            <v-avatar color="yellow">
              <span class="black--text text-h5">
                {{currentUser.name ? currentUser.name[0].toUpperCase() : ""}}
              </span>
            </v-avatar>

            <div class="d-flex flex-column ml-2 pb-1">
              <strong class="text-capitalize">{{ currentUser.name }}</strong>
              <small class="lineHeight">{{ currentUser.email }}</small>
            </div>
          </div>
          <v-divider></v-divider>
          <v-card-text class="d-flex flex-column px-0">
            <strong class=" mb-1 font-weight-medium"> Endereço para coleta </strong>
            <span>{{ currentUserAddress }}</span>

            <strong class="mt-4 mb-1 font-weight-medium"> Telefone </strong>
            <p>{{ formatCellphone(currentUser.cellphone) }}</p>

            <strong class="mt-6 mb-2 font-weight-medium">Alguma observação? </strong>
            <v-textarea
              v-model="orderMessage"
              name="input-7-1"
              placeholder="Ex: as sacolas estão na lixeira na frente de casa"
              variant="outlined"
              rows="1"
              auto-grow
            />
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
    <v-row class="justify-center my-4">
      <v-btn
        elevation="0"
        color="blue"
        :disabled="nothingToDiscard"
        class="text-none white--text"
        @click="nextStep"
        :loading="loadingRequest"
      >
        {{step != 2 ? 'Continuar' : 'Requisitar coleta'}}
      </v-btn>
    </v-row>
  </v-container>
</template>
<script setup>
import { onMounted, ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ref as firebaseRef, getDatabase, onValue, push, child, update} from "firebase/database"
import { storeToRefs } from "pinia"

/* STORE */
import { useCollectionStore } from "@/stores/collection"
import { useCurrentUserStore } from "@/stores/user"
import { useFeedbackStore } from "@/stores/feedback"

import { residues, residueType, residueColors } from "@/utils/residues"
import { formatAddress, formatCellphone, formatCEP } from "@/utils/utils"
import glassTrashcan from "../assets/trashcan/glass-trashcan.png"
import metalTrashcan from "../assets/trashcan/metal-trashcan.png"
import paperTrashcan from "../assets/trashcan/paper-trashcan.png"
import plasticTrashcan from "../assets/trashcan/plastic-trashcan.png"
import Alert from "@/components/feedback/Alert.vue"

/* STORE */
const collectionStore = useCollectionStore()
const currentUserStore = useCurrentUserStore()
const { currentUser } = storeToRefs(currentUserStore)

const feedbackStore = useFeedbackStore()

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const loadingRequest = ref(false)

const step = ref(1)
const selectedResidueType = ref(null)
const selectedResidue = ref([])
const itemsToDiscard = ref({})
const orderMessage = ref("")
const bags = ref(null)
const showHint = ref(false)

const getRecyclerById = () => {
  const uid = route.query.uid
  if (!uid && collectionStore.currentRecycler) {
    collectionStore.clearCurrentRecycler()
    return
  }

  const database = getDatabase()

  onValue(firebaseRef(database, `users/${uid}`), (snapshot) => {
    collectionStore.setCurrentRecycler(snapshot.val())
    loading.value = false
  }, {onlyOnce: true})
}

const resetValues = () => {
  selectedResidueType.value = null
  selectedResidue.value = []
  bags.value = null
}

const addToDiscard = () => {
  itemsToDiscard.value[selectedResidueType.value] = {
    "residues": selectedResidue.value,
    "bags": bags.value || 1
  }
  resetValues()
}

const removeDiscardItem = (residue_type) => {
  delete itemsToDiscard.value[residue_type]
}

const initRecycleRequest = async () => {
  loadingRequest.value = true
  /* REFATORAR PARA IF TERNARIO */
  if (chosenRecycler.value && route.query.uid) {
    await sendRecycleRequest()
  }
  else if (!chosenRecycler.value && !route.query.uid) {
    await createPendingRequest()
  } else  {
    loadingRequest.value = false
  }
}

const sendRecycleRequest = async () => {

  const db = getDatabase()
  const { name, email, cellphone, latitude, longitude, uid } = currentUser.value

  //Esses dados serão enviados para o catador
  const recyclerRequest = {
    residues: itemsToDiscard.value,
    coordinates: [latitude, longitude],
    latitude,
    longitude,
    message: orderMessage.value,
    address: formatAddress(currentUser.value),
    email,
    name,
    cellphone,
    hasAccepted: false,
    hasDeclined: false,
    hasCanceled: false,
    hasCollected: false,
    uid,
  }

  //Esses dados serão salvos pra o descartador, para ele saber qual o catador associado aquela requisição
  const discarderRequest = {
    residues: itemsToDiscard.value,
    coordinates: [latitude, longitude],
    latitude,
    longitude,
    message: orderMessage.value,
    address: formatAddress(chosenRecycler.value),
    email: chosenRecycler.value.email,
    name: chosenRecycler.value.name,
    cellphone: chosenRecycler.value.cellphone,
    hasAccepted: false,
    hasDeclined: false,
    hasCanceled: false,
    hasCollected: false,
    uid: chosenRecycler.value.uid,
  }

  const newRequestKey = push(child(firebaseRef(db), 'requests')).key;

  const updates  = {}
  updates['/users-requests/' + chosenRecycler.value.uid + '/' + newRequestKey] = recyclerRequest;
  updates['/users-requests/' + uid + '/' + newRequestKey] = discarderRequest;

  await update(firebaseRef(db), updates).then(() => {
    goToSuccesPage()
  }).catch((error) => {
    console.log(error)
  }).finally(() => {
    loadingRequest.value = false;
  })
}

const createPendingRequest = async () => {
  if (!hasGeolocationCoordinates()) {
    
    feedbackStore.setAlert(
      "Permita acesso à localização",
      "Precisamos da permissão de acesso à sua localização para que o catador o encontre no mapa!"
    )
    loadingRequest.value = false
    return
  }

  const db = getDatabase();
  const { name, email, cellphone, uid, latitude, longitude } = currentUser.value

   //Esses dados serão enviados para o catador
   const data = {
    residues: itemsToDiscard.value,
    message: orderMessage.value,
    address: formatAddress(currentUser.value),
    email,
    name,
    cellphone,
    coordinates: [latitude, longitude],
    latitude,
    longitude,
    hasAccepted: false,
    hasDeclined: false,
    hasCanceled: false,
    pendingRequestWithNoRecycler: true,
    uid,
  }

  const newRequestKey = push(child(firebaseRef(db), 'requests')).key

  const updates  = {}
  updates['/users-requests/' + uid + '/' + newRequestKey] = {}
  updates['/pending-requests/' + newRequestKey] = data

  await update(firebaseRef(db), updates).then(() => {
    goToSuccesPage()
  }).catch((error) => {
    console.log(error)
  }).finally(() => {
    loadingRequest.value = false
  })
}

const nextStep = () => {
  if (step.value == 1 && Object.keys(itemsToDiscard).length){
    step.value++
    return
  }

  if (step.value == 2){
    initRecycleRequest()
  }
}

const goToHomePage = () => {
  router.push("/home")
}

const previousStep = () => {
  if (step.value == 1) {
    goToHomePage()
    return
  }

  step.value--
}

const goToSuccesPage = () => {
  router.push({
    path: "/success",
    query: { key: "true" }
  })
}

const getTrashCan = (type) => {
  const trashcans = {
    "Vidro": glassTrashcan,
    "Metal": metalTrashcan,
    "Papel": paperTrashcan,
    "Plástico": plasticTrashcan,
  }

  return trashcans[type]
}

const validateAmountOfBags = () => {
  if (bags.value <= 0 || bags.value > 100){
    showHint.value = true
    bags.value = 1
    return
  }
  
  showHint.value = false
}


const hasGeolocationCoordinates = () => {
  const { latitude, longitude } = currentUser.value
  if (!latitude || !longitude) {
    return false
  }

  return true
}

/* COMPUTEDS */
const chosenRecycler = computed(() => {
  return collectionStore.currentRecycler
})

const computedResidueType = computed(() => {
  if (chosenRecycler.value){
    return chosenRecycler.value.residue.map(residue => residue.name)
  }

  return residueType
})

const hasSelectedAResidueType = computed(() => {
  return !!selectedResidueType.value
})

const possibleResidues = computed(() => {
  if (selectedResidueType.value) {
    return residues[selectedResidueType.value]
  }

  return []
})

const isAddActionDisbled = computed (() => {
  return selectedResidueType.value == "" || selectedResidue.value.length == 0
})

const nothingToDiscard = computed (() => {
  return JSON.stringify(itemsToDiscard.value) === "{}"
})

const currentUserAddress = computed(() => {  
  const { street, uf, city, district, complement, cep, number } = currentUser.value
  return `${street}, ${complement}. Nº ${number} - ${district}, ${city} - ${uf}. CEP: ${formatCEP(cep)}`
})

onMounted(() => {
  getRecyclerById()
})

</script>
<style>
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

.emptSize{
  width: 100%;
  height: 290px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background{
  background-image: url('../assets/trashcan/background-trashcan.png');
  background-repeat: no-repeat;
  background-size: 100%;
  text-align: center;
  height: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>