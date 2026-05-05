import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const locationPermission = ref(false)
  const notificationPermission = ref(false)
  const version = ref('1.0.0')

  const SETTINGS_KEY = 'smart_tracker_settings'

  function loadSettings() {
    try {
      const result = localStorage.getItem(SETTINGS_KEY)
      if (result) {
        const data = JSON.parse(result)
        locationPermission.value = data.locationPermission || false
        notificationPermission.value = data.notificationPermission || false
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          locationPermission: locationPermission.value,
          notificationPermission: notificationPermission.value
        })
      )
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  function setLocationPermission(granted) {
    locationPermission.value = granted
    saveSettings()
  }

  function setNotificationPermission(granted) {
    notificationPermission.value = granted
    saveSettings()
  }

  return {
    locationPermission,
    notificationPermission,
    version,
    loadSettings,
    setLocationPermission,
    setNotificationPermission
  }
})