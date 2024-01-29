import { createApp } from "vue"
import {VueFire, VueFireAuth} from "vuefire"
import App from "./App.vue"
import router from "./router"
import vuetify from "./plugins/vuetify"
import firebaseApp from "./plugins/firebase"
import { loadFonts } from "./plugins/webfontloader"
import { createPinia } from "pinia"

loadFonts()
const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(vuetify)
app.use(pinia)
app.use(VueFire, {
    firebaseApp,
    modules: [
        VueFireAuth(),
    ],
})

app.mount("#app")
