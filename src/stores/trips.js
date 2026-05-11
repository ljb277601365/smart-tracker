import { defineStore } from 'pinia'
import { ref } from 'vue'

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const useTripStore = defineStore('trips', () => {
  const trips = ref([])
  const pendingStay = ref(null)

  const TRIPS_KEY = 'smart_tracker_trips'
  const MAX_TRIPS_DAYS = 7
  const NEW_STAY_DISTANCE_THRESHOLD = 500
  const MIN_STAY_DURATION_TO_SAVE = 10 * 60 * 1000

  function loadTrips() {
    try {
      const result = localStorage.getItem(TRIPS_KEY)
      if (result) {
        trips.value = JSON.parse(result)
        cleanOldTrips()
      }
    } catch (e) {
      console.error('Failed to load trips:', e)
    }
  }

  function saveTrips() {
    try {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(trips.value))
    } catch (e) {
      console.error('Failed to save trips:', e)
    }
  }

  function cleanOldTrips() {
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - MAX_TRIPS_DAYS * 24 * 60 * 60 * 1000)
    trips.value = trips.value.filter(trip => new Date(trip.startTime) > cutoffDate)
  }

  function confirmPendingStay() {
    if (!pendingStay.value) return

    const duration = Date.now() - pendingStay.value.startTimestamp
    if (duration >= MIN_STAY_DURATION_TO_SAVE) {
      const trip = {
        id: Date.now().toString(),
        startTime: new Date(pendingStay.value.startTimestamp).toISOString(),
        endTime: new Date().toISOString(),
        location: pendingStay.value.address,
        latitude: pendingStay.value.latitude,
        longitude: pendingStay.value.longitude,
        duration: Math.round(duration / 60000)
      }
      trips.value.push(trip)
      saveTrips()
      console.log('[TripStore] 确认保存停留点:', trip)
    }
    pendingStay.value = null
  }

  function updateOrCreateStay(location) {
    if (!pendingStay.value) {
      pendingStay.value = {
        startTimestamp: Date.now(),
        address: location.address || '未知位置',
        latitude: location.latitude,
        longitude: location.longitude
      }
      console.log('[TripStore] 开始新的待确认停留点')
      return
    }

    const distance = calculateDistance(
      pendingStay.value.latitude,
      pendingStay.value.longitude,
      location.latitude,
      location.longitude
    )

    console.log('[TripStore] 与当前停留点距离:', Math.round(distance), '米')

    if (distance >= NEW_STAY_DISTANCE_THRESHOLD) {
      confirmPendingStay()
      pendingStay.value = {
        startTimestamp: Date.now(),
        address: location.address || '未知位置',
        latitude: location.latitude,
        longitude: location.longitude
      }
      console.log('[TripStore] 移动超过阈值，开始新的待确认停留点')
    } else {
      pendingStay.value.address = location.address || pendingStay.value.address
      pendingStay.value.latitude = location.latitude
      pendingStay.value.longitude = location.longitude
    }
  }

  function getAllTrips() {
    return [...trips.value].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }

  function getTripsByDate(date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return trips.value.filter(trip => {
      const tripDate = new Date(trip.startTime)
      return tripDate >= startOfDay && tripDate <= endOfDay
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }

  return {
    trips,
    pendingStay,
    loadTrips,
    updateOrCreateStay,
    confirmPendingStay,
    getAllTrips,
    getTripsByDate
  }
})
