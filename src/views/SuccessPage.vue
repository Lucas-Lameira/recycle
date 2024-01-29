<template>
  <v-container class="full-height text-center d-flex flex-column align-center justify-center">
    <h1 class="text-success font-weight-black">
      {{ hasKeyInRoute ? "Operaçaõ realizada com sucesso!" : "Perfil criado com sucesso!" }}
    </h1>
    <div
      class="d-flex
        flex-column
        align-center
        justify-center
        section"
    >
      <img class="mb-8" width="300" :src="happyTrashcan"/>
      <span v-if="hasKeyInRoute && currentUser.isRecycler">
        <!-- TODO:  Informar qual o catador se possível-->
        Coleta aceita! Agora, basta ir até o local e coletar o resíduo.
        Não se esqueça de confirmar nas suas requisições quando você coletar o resíduo.
        <!-- TODO: Você receberá uma  noticação quando a coleta iniciar! -->
      </span>
      <span v-else-if="hasKeyInRoute">
        <!-- TODO:  Informar qual o catador se possível-->
        Seu pedido de coleta foi concluido com sucesso! Agora basta aguardar até que o catador faça a coleta no ponto solicitado.
        <!-- TODO: Você receberá uma  noticação quando a coleta iniciar! -->
      </span>
      <span v-else>
        Tudo está pronto para o início da sua jornada 
        na coleta seletiva de Belém! Agora, vamos explorar a aplicação.
      </span>
    </div>
    
    <v-btn
      color="success"
      class="my-4"
      elevation="0"
      @click="execute"
    >
      {{ hasKeyInRoute && !currentUser.isRecycler ? "Acompanhar coleta" : "Vamos lá"}}
    </v-btn>
  </v-container>
</template>
<script setup>
import { computed } from "vue" 
import { storeToRefs } from "pinia"
import { useRouter, useRoute } from "vue-router"
import { useCurrentUserStore } from "@/stores/user"
import happyTrashcan from "../assets/happy_trashcan.png"
const currentUserStore = useCurrentUserStore()
const { currentUser } = storeToRefs(currentUserStore)

const router = useRouter()
const route = useRoute()

const goToRequestsPage = () => {
  router.push("/notifications")
}

const goToHomePage = () => {
  router.push("/home")
}

const execute = () => {
  if (hasKeyInRoute.value) {
    goToRequestsPage()
  }else {
    goToHomePage()
  } 
}

const hasKeyInRoute = computed(() => {
  return route.query.key
})
</script>

<style>
.section {
  max-width: 400px;
  margin-bottom: 1rem;
}

.full-height {
  height: 100vh;
}
</style>