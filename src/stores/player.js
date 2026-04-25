import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playerApi } from '@/api'

export const usePlayerStore = defineStore('player', () => {
  const profile   = ref(null)
  const inventory = ref([])
  const equipped  = ref({})
  const loading   = ref(false)

  async function fetchProfile() {
    loading.value = true
    try {
      const res = await playerApi.getProfile()
      profile.value = res.data ?? res
    } finally {
      loading.value = false
    }
  }

  async function fetchInventory() {
    const res = await playerApi.getInventory()
    const data = res.data ?? res
    inventory.value = data.inventory ?? []
    equipped.value  = data.equipped  ?? {}
  }

  async function refresh() {
    await Promise.all([fetchProfile(), fetchInventory()])
  }

  return { profile, inventory, equipped, loading, fetchProfile, fetchInventory, refresh }
})
