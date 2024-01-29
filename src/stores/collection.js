import { defineStore } from 'pinia'

export const useCollectionStore = defineStore("collection", {
  state: () => {
    return {
      currentRecycler: null
    }
  },

  actions: {
    setCurrentRecycler(newData) {
      this.currentRecycler = structuredClone(newData);
    },

    clearCurrentRecycler() {
      this.currentRecycler = null;
    },
  },
})
