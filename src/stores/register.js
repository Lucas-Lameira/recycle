import { defineStore } from 'pinia'

export const useRegisterStore = defineStore("register", {
  state: () => {
    return {
      personaChoice: "discarder",

      user: {
        name: "",
        cellphone: "",
        uf: "PA",
        city: "Belém",
        cep: "",
        number: "",
        street: "",
        district: "",
        complement: "",
        email: "",
        isRecycler: false,
        password: "",
        latitude: 0,
        longitude: 0,
        isVisible: false,
        residues: {}
      },
    }
  },

  actions: {
    setResidues(residues) {
			this.user.residues = residues
		},

    setCoordinates(lat, lng) {
			this.user.latitude = lat
      this.user.longitude = lng
		}
  }
})
