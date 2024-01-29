<template>
  <v-container>
    <div 
      v-if="pageLoading"
      class="d-flex flex-column align-center justify-center"
      style="height: 80vh;"
    >
      <img class="ml-5 my-8" width="300" :src="loadingImage"/>
      <v-progress-circular
        v-if="pageLoading"
        :size="70"
        :width="7"
        color="success"
        indeterminate
      ></v-progress-circular>
    </div>
    <v-row
      v-else
      class="align-center justify-center bg-image" 
      style="height: 100vh;"
    >
      <v-col cols="12" sm="4">
        <v-img class="ml-11 my-8" width="300" :src="lpImage"/>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-card elevation="0" class="transparent">
          <v-card-title class="text-center text-h4 mb-8">
            Bem-vindo
          </v-card-title>
          <v-card-text>
            <v-form
              ref="loginForm"
              v-model="validForm"
              lazy-validation
            >
              <v-row class="flex-column align-center justify-center">
                <v-col cols="12">
                  <v-text-field
                    v-model="credentials.email"
                    :rules="rules.email"
                    label="E-mail"
                    variant="outlined"
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="credentials.password"
                    :rules="rules.password"
                    label="Senha"
                    variant="outlined"
                    required
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:appendInner="showPassword = !showPassword"
                  />
                </v-col>
                <v-col>
                  <v-alert dismissible v-if="error.show" type="error">
                    {{error.messages[error.code] || error.messages["unknown"]}}
                  </v-alert>
                </v-col>

                <v-col cols="6" sm="12">
                  <!-- TODO: Add login com enter -->
                  <v-btn
                    :disabled="!validForm"
                    elevation="0"
                    color="success"
                    class="text-none"
                    @click="signIn"
                    block
                    :loading="loading"
                  >
                    Login
                  </v-btn>
                </v-col>
                
                <!-- TODO -->
                <v-col cols="12" v-if="furtherImplementation">
                  <v-btn
                    elevation="0"
                    color="#4285F4"
                    class="font-weight-bold text-none d-flex align-center justify-start body-1 text-white pr-4 btn_google"
                    @click="signinWithGoogle"
                  >
                    <div class="g-logo">
                      <v-img width="30" height="30" :src="googleBtnImg" />
                    </div>
                    Fazer login com o google
                  </v-btn>
                </v-col>
                
                <span class="my-4">
                  Ainda não possui uma conta?
                  <strong>
                    <router-link class="remove-link text-green" to="/register">Cadastre-se</router-link>
                  </strong>
                </span>
                
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: "LoginPage",
    inheritAttrs: false,
    customOptions: {}
  }
</script>

<script setup>
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import lpImage from "../assets/component.png"
import googleBtnImg from "../assets/google.png"
import loadingImage from "../assets/recycle.png"


const router = useRouter();

const loginForm = ref(null)
const validForm = ref(false)
const pageLoading = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const furtherImplementation = ref(false)
const credentials = reactive({ 
  email: "",
  password: "",
})

const rules = reactive({
  email: [
      v => !!v || 'E-mail is required',
      v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
  password: [
      v => !!v || 'password is required',
      v => v.length > 5 || 'Senha mínima de 5 caracteres',
    ]
})

const error = reactive({
  show: false,
  messages: {
    "auth/user-not-found": "Usuário não encontrado, cadastre-se gratuitamente na nossa aplicação!",
    "auth/wrong-password": "Usuário ou senha incorretos!",
    "unknown": "Serviço temporariamente indisponível, tente mais tarde!"
  },
  code: "unknown"
})

const inputValidCredentials = () => {
  return loginForm.value.validate()
}

const signIn = () => {
  if (inputValidCredentials()){
    loading.value = true
    const auth = getAuth();
    const {email, password} = credentials

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.push("/home")
      })
      .catch((e) => {
        console.log(e)
        error.show = true
        error.code = e.code
      }).finally(() => {
        loading.value = false
      });
  }
}

const signinWithGoogle = () => {
  console.log("TODO: Login com o google")
}

</script>

<style>
.btn_google {
  border-radius: 3px;
  font-size: 1.2rem !important;
  letter-spacing: 0ch !important;
  padding-left: 2px !important;
  height: 54px !important;
  margin: 0 auto !important;
}

.g-logo {
  background: #fff;
  border-radius: 2px;
  margin-right: 8px;
  padding: 10px;
}

.remove-link {
  text-decoration: none;
}
</style>