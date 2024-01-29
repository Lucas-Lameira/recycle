<!-- eslint-disable -->
<template>
  <v-dialog
    v-model="showDialog"
    persistent
    width="auto"
  >
    <v-card class="align-center">
      <v-card-title class="text-h5">
        Parabéns!
      </v-card-title>
      <v-card-text class="d-flex flex-column align-center justify-center">
        Todos os resíduos foram coletados com sucesso!
        
        <v-icon size="120" class="my-4" color="success">
          mdi-check-circle
        </v-icon>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="green-darken-1"
          variant="text"
          @click="finishAction"
        >
          Finalizar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useFeedbackStore } from "@/stores/feedback"

const feedbackStore = useFeedbackStore()
const { 
  showDialog
} = storeToRefs(feedbackStore)

const router = useRouter()

const finishAction = () => {
  feedbackStore.toggleSnackbar()
  router.push("/home")
}
</script>
