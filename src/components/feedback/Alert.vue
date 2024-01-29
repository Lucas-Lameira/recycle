<!-- eslint-disable -->
<template>
  <v-alert
    v-if="showAlert"
    density="compact"
    :type="alertType"
    :title="alertTitle"
    icon="mdi-alert-outline"
    class="my-4"
    closable
    @click:close="feedbackStore.closeAlert"
  >

  <div class="d-md-flex">
    <p>{{ alertText }}</p>
    <v-spacer></v-spacer>
    <v-btn color="blue">
      action
    </v-btn>
  </div>
  </v-alert>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useFeedbackStore } from "@/stores/feedback"

const feedbackStore = useFeedbackStore()
const { 
  showAlert,
  alertTitle,
  alertText,
  alertType
} = storeToRefs(feedbackStore)

</script>