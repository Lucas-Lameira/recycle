<template>
  <v-layout class="overflow-visible"  style="height: 56px;">
    <v-bottom-navigation
      v-model="navigation"
      dark
      shift
      :color="color"
    >
      <v-btn v-for="(item, index) in menu" :key="index" @click="execute(item.action)">
        <span>{{item.title}}</span>

        <v-icon>{{item.icon}}</v-icon>
      </v-btn>
      <span v-show="false">{{ currentRoute }}</span>
    </v-bottom-navigation>
  </v-layout>
</template>
<!-- UTILIZAR O SETUP PARA TESTAR EM PROD -->
<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useCurrentUserStore } from "@/stores/user"

const currentUserStore = useCurrentUserStore()
const { currentUser } = storeToRefs(currentUserStore)

const router = useRouter()

const navigation = ref (0)
const menu = ref([
  {
    title: 'Mapa',
    icon: 'mdi-map',
    action: 'redirectToMap'
  },
  {
    title: currentUser.value.isRecycler ? "Coletas" : "Descartes",
    icon: 'mdi-map-marker-path',
    action: 'redirectToRequests'
  },
  {
    title: 'Config.',
    icon: 'mdi-cog',
    action: 'redirectToConfig'
  },
])

const execute = (action) => {
    switch (action) {
      case 'redirectToMap': return router.push('/home')
      case 'redirectToRequests': return router.push('/notifications')
      case "redirectToConfig": return router.push('/settings')
      default: return router.push('/home')
    }
  }

const updateValue = (x) => {
  navigation.value = x
}

const color = computed(() => {
  switch (navigation.value) {
    case 0: return 'blue-grey'
    case 1: return 'teal'
    case 2: return 'brown'
    case 3: return 'indigo'
    default: return 'blue-grey'
  }
})

const currentRoute = computed(() => {
  const bottomMenu = {
    HomePage: 0,
    Notifications: 1,
    Settings: 2
  }

  const { name } = router.currentRoute.value
  
  if (bottomMenu[name] !== undefined){
    updateValue(bottomMenu[name])
  }

  return false
})
</script>