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
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    })
    
    const lat = position.coords.latitude
    const lng = position.coords.longitude
    
    const address = await reverseGeocode(lat, lng)
    
    return {
      latitude: lat,
      longitude: lng,
      accuracy: position.coords.accuracy,
      address: address
    }
  } catch (e) {
    console.error('Failed to get current location:', e)
    return null
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=zh-CN`,
      { 
        headers: { 
          'User-Agent': 'SmartTrackerApp/1.0',
          'Referer': 'https://example.com'
        } 
      }
    )
    
    if (!response.ok) {
      throw new Error('Geocode request failed')
    }
    
    const data = await response.json()
    
    if (data.address) {
      const addr = data.address
      
      if (addr.road) {
        let parts = []
        if (addr.house_number) parts.push(addr.house_number)
        parts.push(addr.road)
        if (addr.suburb) parts.push(addr.suburb)
        if (addr.neighbourhood) parts.push(addr.neighbourhood)
        if (addr.village) parts.push(addr.village)
        if (addr.town) parts.push(addr.town)
        
        if (parts.length > 0) {
          return parts.join(' · ')
        }
      }
      
      if (addr.pedestrian) return addr.pedestrian
      if (addr.footway) return addr.footway
      if (addr.highway) return addr.highway
      
      let displayName = data.display_name || ''
      
      const parts = displayName.split(',').map(p => p.trim()).filter(p => p.length > 0)
      if (parts.length >= 3) {
        return parts.slice(0, 4).join(' · ')
      }
      
      return displayName.substring(0, 60)
    }
    
    if (data.display_name) {
      return data.display_name.substring(0, 60)
    }
    
    return `位置 ${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (e) {
    console.error('Reverse geocode failed:', e)
    return `坐标 ${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

export function startLocationWatch(callback) {
  stopLocationWatch()
  watchId = Geolocation.watchPosition(
    { 
      enableHighAccuracy: true, 
      timeout: 15000,
      maximumAge: 0
    },
    async (position, err) => {
      if (err) {
        console.error('Watch position error:', err)
        return
      }
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
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
