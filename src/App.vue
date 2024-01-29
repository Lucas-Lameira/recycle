<template>
  <div>
    <Authenticated v-if="isAuthenticated" />
    <Default v-else />
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import Authenticated from "@/layouts/Authenticated.vue"
import Default from "@/layouts/Default.vue"
export default  {
  name: "App",

  components: {
    Authenticated,
    Default
  },
}
</script>

<script setup>
import { useCurrentUserStore } from "@/stores/user"
import { storeToRefs } from "pinia"
const currentUserStore = useCurrentUserStore()
const { isAuthenticated } = storeToRefs(currentUserStore)

</script>
