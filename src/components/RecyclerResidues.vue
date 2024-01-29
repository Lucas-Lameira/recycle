<template>
  <v-row :class="`mb-6 mt-3 ${style}`">
    <v-card
      v-for="(residue, index) in residues" :key="index"
      max-width="100px"
      :color="residue.selected ? residue.color : 'white' "
      class="ma-1"
      @click="updateResidues(index)"
    >
      <v-card-text class="d-flex flex-column align-center">
        <v-icon x-large :color="residue.selected ? 'white': 'grey'">mdi-recycle</v-icon>
        <strong class="font-weight-bold mt-1">{{ residue.name }}</strong>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script setup> 
import { ref }  from "vue"
import { useRegisterStore } from "@/stores/register"
const registerStore = useRegisterStore()

defineProps({
  style: String
})

const residues = ref([
  {name: 'Metal', color: 'yellow', selected: false},
  {name: 'Vidro', color: 'green', selected: false},
  {name: 'Papel', color: 'blue', selected: false},
  {name: 'Plástico', color: 'red', selected: false},
])

const updateResidues = (index) => {
  residues.value[index].selected = !residues.value[index].selected
  registerStore.setResidues(residues)
}
</script>