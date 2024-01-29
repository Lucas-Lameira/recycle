import { defineStore } from 'pinia'

export const useFeedbackStore = defineStore("feedback", {
  state: () => {
    return {
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      showAlert: false,
      alertTitle: "Permita a localização",
      alertText: "",
      alertType: "warning",
      showDialog: false,
    }
  },

  actions: {
    openSnackbar() { 
      this.snackbar = true
    },

    closeSnackbar() { 
      this.snackbar = false
    },

    setSnackbarText(text) {
      this.snackbarText = text
    },

    setSnackbarColor(color = "error") {

      const colors = {
        error: "error",
        warning: "warning",
        success: "success"
      }

      this.snackbarColor = colors[color] || colors["error"] 
    },

    openAlert() { 
      this.showAlert = true
    },

    closeAlert() { 
      this.showAlert = false
    },

    setAlertText(text) {
      this.alertText = text
    },

    setAlert(title, text, type="warning") {
      this.alertTitle = title
      this.alertText = text
      this.alertType = type
      this.showAlert = true
    },

    toggleSnackbar() {
      this.showDialog = !this.showDialog
    }
  },
})
