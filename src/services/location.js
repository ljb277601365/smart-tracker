import { Geolocation } from '@capacitor/geolocation'

let watchId = null

export async function requestLocationPermission() {
  try {
    const status = await Geolocation.requestPermissions()
    return status.location === 'granted'
  } catch (e) {
    console.error('Failed to request location permission:', e)
    return false
  }
}

export async function getCurrentLocation() {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
    })
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      address: await reverseGeocode(position.coords.latitude, position.coords.longitude)
    }
  } catch (e) {
    console.error('Failed to get current location:', e)
    return null
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'SmartTrackerApp/1.0' } }
    )
    const data = await response.json()
    if (data.address) {
      const { city, town, village, suburb, street } = data.address
      if (street) return street
      if (suburb) return suburb
      if (city || town || village) return city || town || village
    }
    return data.display_name?.substring(0, 30) || '未知位置'
  } catch (e) {
    console.error('Reverse geocode failed:', e)
    return '未知位置'
  }
}

export function startLocationWatch(callback) {
  stopLocationWatch()
  watchId = Geolocation.watchPosition(
    { enableHighAccuracy: true, timeout: 10000 },
    (position, err) => {
      if (err) {
        console.error('Watch position error:', err)
        return
      }
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      }
    }
  )
}

export function stopLocationWatch() {
  if (watchId !== null) {
    Geolocation.clearWatch({ id: watchId })
    watchId = null
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
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