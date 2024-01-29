<template>
  <v-form>
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
          placeholder="(xx) xxxxx-xxxx"
          maxlength="11"
          :rules="phoneRules"
        />

        <span class="pb-2 d-block">
          <span class="text-red pb-2">*</span>
          indica um campo obrigatório
        </span>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Endereço</v-card-title>
      <v-card-text>
        <TextFieldLabel label="UF" :required="true" />
        <v-autocomplete
          v-model="user.uf"
          :items="UF_STATES"
          
          item-title="sigla"
          item-value="sigla"
          variant="outlined"
        />

        <TextFieldLabel label="Cidade" :required="true" />
        <v-autocomplete 
          no-data-text="Cidade não encontrada"
          v-model="user.city"
          :items="cities"          
          variant="outlined"
        />

        <TextFieldLabel label="CEP" :required="true" />
        <v-text-field
          v-model="user.cep"
          maxlength="8"
          type
          variant="outlined"
          :rule="cepRules"
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
        <span class="pb-2 d-block">
          <span class="text-red pb-2">*</span>
          indica um campo obrigatório
        </span>
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
        <RecyclerResidues @setResidues="setResidues" center/>
      </v-card-text>
    </v-card>
  </v-form>
</template>
<script setup>
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import { useRegisterStore } from "@/stores/register"
import { UF_STATES } from "@/utils/uf"
import { CITIES } from "@/utils/cities"
//import { cleanCEPregex, validateCEP, onlyNumbers } from "@/utils/utils";
import RecyclerResidues from "../components/RecyclerResidues.vue"
import TextFieldLabel from "../components/TextFieldLabel.vue"
import LeafMap from "@/components/LeafMap.vue"

const registerStore = useRegisterStore()
const { user } = registerStore
const { personaChoice } = storeToRefs(registerStore)

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
])

const setResidues = (residues) => {
  user.residues = residues
}

const selectedGeolocationPosition = ({lat, lng}) => {
  registerStore.setCoordinates(lat, lng)
}

const cities = computed(() => {
  return user.uf ? CITIES[user.uf] : []
})
</script>
