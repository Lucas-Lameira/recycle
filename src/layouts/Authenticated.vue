<!-- eslint-disable -->
<template>
	<!-- TODO: ADD A LOADING HERE https://vuetifyjs.com/en/components/overlays/#loader-->
	<v-app>
		<v-progress-circular v-if="loadingUser" indeterminate></v-progress-circular>
		<v-main v-else>
			<router-view />
			<!-- Add a fake loading here so the leaflet can load -->
			<BottomNavigation v-show="showBottomNavigation" />
		</v-main>
	</v-app>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { computed, onBeforeMount } from "vue"
import { useRoute } from "vue-router"
import { storeToRefs } from "pinia"
import { useCurrentUserStore } from "@/stores/user"
import BottomNavigation from "@/components/navigation/BottomNavigation.vue"

const route = useRoute()
const currentUserStore = useCurrentUserStore()
const { loadingUser } = storeToRefs(currentUserStore)

const showBottomNavigation = computed(() => {
	return !["Success", "RequestCollection", "Collection"].includes(route.name)
})

onBeforeMount(async () => {
  await currentUserStore.fetchCurrentUser()
  await currentUserStore.fetchCurrentUserRequests()
})

</script>