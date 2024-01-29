<!-- eslint-disable -->
<template>
  <v-snackbar
    v-model="snackbar"
    multi-line
    :color="snackbarColor"
  >
    <strong>{{ snackbarText }}</strong>

    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="feedbackStore.closeSnackbar"
      >
        Fechar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useFeedbackStore } from "@/stores/feedback"

const feedbackStore = useFeedbackStore()
const { 
  snackbar,
  snackbarText,
  snackbarColor
} = storeToRefs(feedbackStore)
</script>