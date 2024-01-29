<template>
  <div v-for="(waste, type) in wastes" :key="type" class="d-flex align-center border mb-2 pt-2">
    <img class="mb-2 mx-4" width="50" :src="getTrashCan(type)"/>
    
    <div class="mx-4 full-size" >
      <div class="d-flex mb-4">
        <strong class="font-weight-medium">{{ type }}</strong>
        <v-spacer></v-spacer>
        <strong class="font-weight-medium">Sacolas: {{ waste.bags || 1 }}</strong>
      </div>
      
      <div class="d-flex">
        <v-chip
          v-for="residue in waste.residues"
          :key="residue"
          class="mr-2 mb-2 font-weight-bold text-capitalize"
          :color="`${residueColors[type]} lighten-2`"
          label
          size="small"
        >
          <span :class="type == 'Metal' ? 'text-grey-darken-4' : ''">{{ residue }}</span> 
        </v-chip>

        <v-spacer></v-spacer>

        <!-- <v-btn icon variant="text" @click="removeDiscardItem(type)">
          <v-icon color="red">mdi-trash-can-outline</v-icon>
        </v-btn> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { residueColors } from "@/utils/residues"
import glassTrashcan from "../assets/trashcan/glass-trashcan.png"
import metalTrashcan from "../assets/trashcan/metal-trashcan.png"
import paperTrashcan from "../assets/trashcan/paper-trashcan.png"
import plasticTrashcan from "../assets/trashcan/plastic-trashcan.png"

defineProps({
  wastes: Object
})


const getTrashCan = (type) => {
  const trashcans = {
    "Vidro": glassTrashcan,
    "Metal": metalTrashcan,
    "Papel": paperTrashcan,
    "Plástico": plasticTrashcan,
  }

  return trashcans[type]
}


</script>

<style scoped>
.border{
  border: 1px solid black;
}

.full-size{
  width: 100%;
}
</style>