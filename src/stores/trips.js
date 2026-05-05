import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTripStore = defineStore('trips', () => {
  const trips = ref([])
  const isTracking = ref(false)
  const currentStayId = ref(null)

  const TRIPS_KEY = 'smart_tracker_trips'
  const MAX_TRIPS_DAYS = 7

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

  function startTrip(location) {
    const trip = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      endTime: null,
      location: location.address || location.name || '未知位置',
      latitude: location.latitude,
      longitude: location.longitude,
      duration: 0
    }
    trips.value.push(trip)
    currentStayId.value = trip.id
    saveTrips()
    return trip
  }

  function endTrip(tripId) {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      trip.endTime = new Date().toISOString()
      trip.duration = Math.round((new Date(trip.endTime) - new Date(trip.startTime)) / 60000)
      currentStayId.value = null
      saveTrips()
    }
  }

  function updateTripLocation(tripId, location) {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      trip.location = location.address || location.name || trip.location
      trip.latitude = location.latitude
      trip.longitude = location.longitude
      saveTrips()
    }
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

  function getAllTrips() {
    return [...trips.value].sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }

  return {
    trips,
    isTracking,
    currentStayId,
    loadTrips,
    startTrip,
    endTrip,
    updateTripLocation,
    getTripsByDate,
    getAllTrips
  }
})