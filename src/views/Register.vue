<!-- eslint-disable -->
<template>
  <v-container class="my-8">
    <v-card elevation="0">
      <v-card-title class="text-center">
        {{ title }}
        <p v-if="firebaseUser">Hello {{ firebaseUser.email }}</p>
      </v-card-title>
      
      <Alert />

      <v-card-text class="pa-2">
        <v-window v-model="step">
          <v-window-item :value="1">
            <v-row class="align-center justify-center">
              <v-col class="px-0" cols="10" sm="5" lg="4">
                <PersonaChoice />
              </v-col>

              <v-col cols="0" sm="1" class=" d-flex align-center justify-center">
                <span class="font-weight-black text-green">OU</span>
              </v-col>

              <v-col class="px-0" cols="10" sm="5" lg="4">
                <PersonaChoice persona="recycler"/>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- FORMULÀRIO 2 -->
          <v-window-item :value="2">
            <v-form
              ref="form"
              v-model="validForm"
              lazy-validation
            >
              <!-- DADOS PESSOAIS -->
              <v-card>
                <v-card-title>Dados pessoais</v-card-title>
                <v-card-text>
                  <TextFieldLabel label="Nome Completo" :required="true" />
                  <v-text-field
                    v-model="user.name"
                    variant="outlined"
                    required
                    :rules="nameRules"
                    placeholder="Jhon Doe"
                  />

                  <TextFieldLabel label="Telefone" :required="true" />
                  <v-text-field
                    v-model="user.cellphone"
                    variant="outlined"
                    placeholder="91999999999"
                    maxlength="11"
                    :rules="phoneRules"
                  />

                  <RequiredLabel />
                </v-card-text>
              </v-card>

              <v-card>
                <v-card-title>Endereço</v-card-title>
                <v-card-text>
                  <TextFieldLabel label="CEP" :required="true" />
                  <v-text-field
                    v-model="user.cep"
                    maxlength="8"
                    placeholder="00000000"
                    variant="outlined"
                    :rules="cepRules"
                  />

                  <TextFieldLabel label="Número" :required="true" />
                  <v-text-field
                    maxlength="6"
                    v-model="user.number"
                    variant="outlined"
                    :rules="requiredRule"
                  />

                  <TextFieldLabel label="Bairro" :required="true" />
                  <v-text-field v-model="user.district" variant="outlined" :rules="requiredRule"/>

                  <TextFieldLabel label="Rua" :required="true" />
                  <v-text-field v-model="user.street" variant="outlined" :rules="requiredRule"/>

                  <TextFieldLabel label="Complemento" />
                  <v-text-field v-model="user.complement" variant="outlined" placeholder="Ex: casa com portão preto" />

                  <RequiredLabel />
                </v-card-text>
              </v-card>

              <v-card v-if="personaChoice != 'recycler'">
                <v-card-title> Informe a localização do seu endereço </v-card-title>
                <v-card-text>
                  <LeafMap @coordinates="selectedGeolocationPosition" />
                </v-card-text>
              </v-card>

              <!-- Condicionar card de reciclador por página -->
              <v-card v-if="personaChoice == 'recycler'">
                <v-card-title> Dados do reciclador </v-card-title>
                <v-card-subtitle>
                  Selecione os tipos de materias que você coleta.
                </v-card-subtitle>
                <v-card-text>
                  <RecyclerResidues />
                </v-card-text>
              </v-card>
            </v-form>
          </v-window-item>

          <v-window-item :value="3">
            <v-form
              ref="authForm"
              v-model="validAuthForm"
              lazy-validation
            >
              
              <TextFieldLabel label="E-mail" :required="true" />
              <v-text-field
                v-model="user.email"
                :rules="rules.email"
                variant="outlined"
                label=""
                class="mt-1"
                required
              />
              
              <TextFieldLabel label="Senha" :required="true" />
              <v-text-field
                v-model="user.password"
                :rules="rules.password"
                variant="outlined"
                required
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:appendInner="showPassword = !showPassword"
              />

              <TextFieldLabel label="Confirmar senha" :required="true" />
              <v-text-field
                v-model="confirmPassword"
                :rules="rules.confirmPassword"
                variant="outlined"
                required
                :type="showConfirmPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:appendInner="showConfirmPassword = !showConfirmPassword"
              />

              <RequiredLabel />
            </v-form>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions :class="step == 1 ? 'align-center justify-center' : 'justify-space-between px-4'">
        <v-col cols="11" sm="12" class="d-flex px-0">
          <v-btn
            v-show="step > 1"
            variant="text"

            @click="step--"
          >
            voltar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            elevation="0"
            :color="step === 3 ? 'success' : 'blue'"
            :loading="loading"
            variant="flat"
            @click="advanceStep()"
          >
            {{step < 3 ? 'Próximo ' : 'Finalizar cadastro '}}
            {{step + "/3" }}
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>

    <Snackbar />
  </v-container>
</template>
<script setup>
import { computed, ref, reactive} from "vue"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"
import { getDatabase, ref as firebaseRef, set } from "firebase/database"
import { useFirebaseAuth, useCurrentUser } from "vuefire"
import { createUserWithEmailAndPassword } from 'firebase/auth'

/* STORE */
import { useRegisterStore } from "@/stores/register"
import { useFeedbackStore } from "@/stores/feedback"

/* COMPONENTS */
import PersonaChoice from "@/components/PersonaChoice.vue"
import RecyclerResidues from "@/components/RecyclerResidues.vue"
import TextFieldLabel from "@/components/TextFieldLabel.vue"
import RequiredLabel from "@/components/RequiredLabel.vue"
import LeafMap from "@/components/LeafMap.vue"
import Snackbar from "@/components/feedback/Snackbar.vue"
import Alert from "@/components/feedback/Alert.vue"


/* ROUTER */
const router = useRouter()

/* STORE */

const feedbackStore = useFeedbackStore()
const registerStore = useRegisterStore()
const { user } = registerStore

const { personaChoice } = storeToRefs(registerStore)

/* AUTH */
const auth = useFirebaseAuth()
const firebaseUser = useCurrentUser()

/* VARIABLES */
const step = ref(1)
const showPassword = ref(false)
const confirmPassword = ref("")
const showConfirmPassword = ref(false)
const loading = ref(false)

const form = ref(null)
const validForm = ref(false)

const authForm = ref(false)
const validAuthForm = ref(false)

const rules = reactive({
  email:  [
    v => !!v || "Informe o seu e-mail",
    v => /.+@.+\..+/.test(v) || "example@email.com",
  ],
  password:  [
    v => !!v || "Informe a sua senha",
    v => v.length >= 5 || "Senha mínima de 5 caracteres",
  ],

  confirmPassword:  [
    v => !!v || 'Confirme a sua senha',
    v => v == user.password || 'As senhas estão diferentes',
  ],
})

const requiredRule = ref([
  value => {
    if (value) return true

    return 'Preencha este campo obrigatório.'
  },
])

const nameRules = ref([
  value => {
    if (value) return true

    return 'Preencha este campo obrigatório.'
  },
  value => {
    if (/[^0-9]/.test(value)) return true

    return 'O nome não pode conter dígitos.'
  },
])

const phoneRules = ref([
  value => {
    if (value) return true

    return 'Preencha este campo obrigatório.'
  },

  value => {
    if (/^[0-9]+$/.test(value)) return true;

    return 'Por favor, insira um número de telefone válido (apenas dígitos).';
  },

  value => {
    if (value?.length >= 11) return true

    return 'O telefone deve conter 11 dígitos'
  },
])

const cepRules  = ref([
  value => {
    if (value) return true

    return 'Preencha este campo obrigatório.'
  },

  value => {
    if (value?.length >= 8) return true

    return 'O CEP deve conter 8 dígitos'
  },

  value => {
    if (/^[0-9]+$/.test(value)) return true;

    return 'Por favor, insira um cep válido (apenas dígitos).';
  },
])

const selectedGeolocationPosition = ({lat, lng}) => {
  registerStore.setCoordinates(lat, lng)
}

const title = computed(() => {
  switch (step.value) {
    case 1: return "Escolha o seu perfil"
    case 2: return "Preencha os dados"
    case 3: return "Crie as suas credenciais de acesso"
    default: return "Conta criada"
  }
})

const createRecycler = (uid) => {
  const db = getDatabase();
  const { latitude, longitude, isVisible } = user
  set(firebaseRef(db, `/recyclers/${uid}`), {
    uid,
    latitude,
    longitude,
    isVisible,
  })
}

const registerUser = (currentUser) => {
  /* check if user allowed the geolocation */

  const db = getDatabase();
  const { uid, refreshToken, email} = currentUser;

  const data = {
    uid,
    name: user.name,
    cellphone: user.cellphone,
    uf: user.uf,
    city: user.city,
    cep: user.cep,
    number: user.number,
    street: user.street,
    district: user.district,
    complement: user.complement,
    email,
    photoUrl: null,
    refreshToken,
    latitude: user.latitude,
    longitude: user.longitude,
    isVisible: user.isVisible,
    isRecycler: user.isRecycler,
  }

  data["residue"] = user.isRecycler ? user.residues : null

  set(firebaseRef(db, `/users/${uid}`), data)
}

const signUpWithEmailAndPassword = () => {
  loading.value = true;
  createUserWithEmailAndPassword(auth, user.email, user.password)
    .then((userCredential) => {
      const currentUser = userCredential.user;
      registerUser(currentUser);

      if(user.isRecycler){
        createRecycler(currentUser.uid)
      }

      goToSuccessPage()
    }).catch((error) => {
      console.log(error)
    }).finally(() => {
      loading.value = false;
    })
}

const advanceStep = async () => {
  if (step.value == 2){
    const {valid} = await form.value.validate()
    if (valid) {
      step.value++
      return
    }

    const text = "Preencha todos os campos obrigatórios!"
    openSnackbarError(text)
    return
  }

  if (step.value == 3){
    const { valid } = await authForm.value.validate()

    if (valid) {
      signUpWithEmailAndPassword()
      return
    }

    const text = "Verifique seu e-mail e senha!"
    openSnackbarError(text)
    return
  }

  step.value++
}

const goToSuccessPage = () => {
  loading.value = false
  router.push("/success")
}

const openSnackbarError = (text) => {
  feedbackStore.setSnackbarText(text)
  feedbackStore.setSnackbarColor("error")
  feedbackStore.openSnackbar()
}
</script>

<style scoped>
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

.form-max-width{
  max-width: 600px;
}
</style>