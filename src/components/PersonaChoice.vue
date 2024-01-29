<template>
  <v-card 
    elevation="1"
    :class="`mb-2 align-end ${hasChosenCurrentPersona ? 'border' : ''}`"
    max-height="300"
    min-height="330"
    @click="setPersona"
  >
    <v-card-title class="text-green text-center font-weight-black">
      {{personas[persona].name}}
    </v-card-title>
    <v-card-text class=" mt-10 d-flex align-end justify-center">
      <v-img class="align-self-end" max-height="200" max-width="200" :src="personas[persona].image"/>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue"
import discarder from "../assets/discarder.png"
import recycler from "../assets/recycler.png"
import { useRegisterStore } from "@/stores/register"
import { storeToRefs } from "pinia"

const registerStore = useRegisterStore()
const { personaChoice } = storeToRefs(registerStore)

const props = defineProps({
  persona: {
    type: String,
    default: "discarder"
  }
})

const personas = {
  recycler: {
    name: "Reciclador",
    image: recycler
  },
  discarder: {
    name: "Descartador",
    image: discarder
  }
}

const setPersona = () => {
  registerStore.user.isRecycler = props.persona == "recycler"
  personaChoice.value = props.persona
}

const hasChosenCurrentPersona = computed(() => {
  return props.persona === personaChoice.value
})
</script>

<style>
.border { 
  border: 2px solid #4CAF50 !important;
} 
</style>