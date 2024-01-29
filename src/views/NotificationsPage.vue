<template>
  <div class="teste">
    <Recycler v-if="currentUser.isRecycler"/>
    <Discarder v-else/>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useCurrentUserStore } from "@/stores/user"

import Discarder from "../components/requests/Discarder.vue"
import Recycler from "../components/requests/Recycler.vue"

const currentUserStore = useCurrentUserStore()
const { currentUser } = storeToRefs(currentUserStore)
</script>

<style scoped>
.teste{
  overflow: hidden;
}
</style>