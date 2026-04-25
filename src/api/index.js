import { api } from './client'

// Auth
export const authApi = {
  discordLogin: (code, redirectUri) =>
    api.post('/auth/discord', { code, redirect_uri: redirectUri }),
  mockLogin: (discordId) =>
    api.post('/auth/discord', { code: `mock:${discordId}` }),
}

// Player
export const playerApi = {
  getProfile:   () => api.get('/me/profile'),
  getInventory: () => api.get('/me/inventory'),
  equipItem:    (uuid, slot) => {
    const query = slot ? `?slot=${encodeURIComponent(slot)}` : ''
    const body = slot ? { slot, targetSlot: slot, equipSlot: slot } : undefined
    return api.post(`/me/inventory/equip/${uuid}${query}`, body)
  },
  unequipItem:  (slot) => api.post(`/me/inventory/unequip/${slot}`),
  useItem:      (uuid) => api.post(`/me/inventory/use/${uuid}`),
  discardItem:  (uuid) => api.post(`/me/inventory/discard/${uuid}`),
  sellItem:     (uuid) => api.post(`/me/inventory/sell/${uuid}`),
}

// Enhance
export const enhanceApi = {
  getInfo:  (uuid) => api.get(`/me/enhance/${uuid}`),
  doEnhance:(uuid) => api.post(`/me/enhance/${uuid}`),
}

// Shop
export const shopApi = {
  listItems: () => api.get('/shop/items'),
  buyItem:   (itemId) => api.post(`/shop/buy/${itemId}`),
}

// Combat
export const combatApi = {
  quickBattle: (zone) => api.post('/combat/quick-battle', { zone }),
  getZones:    () => api.get('/combat/zones'),
}

// Mission Center
export const missionApi = {
  getCenter: async (category = 'daily') => {
    const cat = String(category || 'daily').toLowerCase()
    const endpointFromEnv = import.meta.env?.VITE_MISSION_CENTER_ENDPOINT || '/quests'
    const categoryParamFromEnv = import.meta.env?.VITE_MISSION_CATEGORY_PARAM || 'cadence'
    const query = `${encodeURIComponent(categoryParamFromEnv)}=${encodeURIComponent(cat)}`
    try {
      return await api.get(`${endpointFromEnv}?${query}`)
    } catch (err) {
      if (err?.message?.includes('404')) {
        throw new Error('任務中心接口不存在（404），目前預設是 /api/quests')
      }
      throw err
    }
  },
  claimQuest: (questId) => api.post(`/quests/${encodeURIComponent(questId)}/claim`),
}
