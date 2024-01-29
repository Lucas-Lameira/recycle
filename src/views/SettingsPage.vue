<template>
    <v-container class="calculated-height" >
    <v-card elevation="0">
      <v-card-title class="align-center justify-start">
        <v-icon left large>mdi-account</v-icon>
        <!-- TODO: get firstname and lastname -->
        <span class="ml-2 font-weight-bold">
          {{currentUser ? currentUser.name : ""}}
        </span>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-subheader>Configurações</v-list-subheader>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          @click="execute"
        >
          <template v-slot:append>
            <v-icon left :icon="item.icon"></v-icon>
          </template>

          <v-list-item-title class="body-1">
          {{ item.text }}
          </v-list-item-title>            
        </v-list-item>
      </v-list>
    </v-card>

    <!-- EXIT DIALOG -->
     <v-dialog
      v-model="exitDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h5">
          Sair do aplicativo
        </v-card-title>
        <v-card-text>
          Tem certeza de que gostaria de sair do aplicativo?  
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="exitDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            text
            @click="signOut"
          >
            Sair
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { getAuth, signOut as firebaseSignOut } from "firebase/auth"
import { useCurrentUserStore } from "@/stores/user"
import { storeToRefs } from "pinia"

const router = useRouter()

const userStore = useCurrentUserStore()
const { currentUser } = storeToRefs(userStore)

const exitDialog = ref(false)
const items = ref([
  { text: 'Sair', icon: 'mdi-logout' }
])

const execute = () => {
  exitDialog.value = true
}

const signOut = () => {
  const auth = getAuth();
  firebaseSignOut(auth).then((response) => {
    router.push("/")
    console.log(response)
  }).catch((error) => {
    console.log(error.code)
    console.log(error.message)
  });
}

</script>

<style>
.calculated-height {
  height: calc(100vh - 56px) !important;
} 
</style>