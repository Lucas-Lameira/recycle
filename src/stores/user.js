import { getCurrentUser } from "vuefire"
import { defineStore } from "pinia"
import { ref, getDatabase, onValue } from "firebase/database"

export const useCurrentUserStore = defineStore("currentUser", {
	state: () => {
		return {
			currentUser: {},
			userRequests: {},
			isAuthenticated: false,
			loadingUser: false,
		}
	},

	actions: {
		async fetchCurrentUser() {
			this.loadingUser = true

			const { uid } = await getCurrentUser()

			if (!uid) {
				return false
			}

			/* DESCOBRIR UM JEITO DEE ESPERAR ISSO TERMINAR PRA CARREGAR TUDO */
			const database = getDatabase()
			onValue(ref(database, `users/${uid}`), (snapshot) => {

				Object.assign(this.currentUser, snapshot.val())
				this.loadingUser = false
			}, {onlyOnce: true})
		},

		async fetchCurrentUserRequests() {
			/* TODO: REMOVER REDUNDANCIA */
			const { uid } = await getCurrentUser()

			if (!uid) {
				return false
			}

			const database = getDatabase()

			onValue(ref(database, `/users-requests/${uid}`) , (snapshot) => {
				Object.assign(this.userRequests, snapshot.val() || {})
			})
		},

		setIsAuthenticated(currentUser) {
			this.isAuthenticated = currentUser ? true : false
		},

		removeWaste(uid) {
			delete this.userRequests[uid];
		}		
	},
})
