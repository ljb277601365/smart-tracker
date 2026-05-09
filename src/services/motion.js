import { Motion } from '@capacitor/motion'

let accelerometerHandler = null
let lastAcceleration = { x: 0, y: 0, z: 0 }
let isStationary = false
let stationaryStartTime = null
const STATIONARY_THRESHOLD = 0.3
const MIN_STATIONARY_TIME = 3 * 60 * 1000

export function startMotionDetection(onStartMoving) {
  stopMotionDetection()

  Motion.addListener('accel', (event) => {
    const { x, y, z } = event.acceleration
    const deltaX = Math.abs(x - lastAcceleration.x)
    const deltaY = Math.abs(y - lastAcceleration.y)
    const deltaZ = Math.abs(z - lastAcceleration.z)
    const totalDelta = deltaX + deltaY + deltaZ

    if (totalDelta < STATIONARY_THRESHOLD) {
      if (!isStationary) {
        isStationary = true
        stationaryStartTime = Date.now()
      } else {
        const stationaryDuration = Date.now() - stationaryStartTime
        if (stationaryDuration >= MIN_STATIONARY_TIME) {
          if (accelerometerHandler) {
            accelerometerHandler.isReadyToTrigger = true
          }
        }
      }
    } else {
      if (isStationary && stationaryStartTime) {
        const stationaryDuration = Date.now() - stationaryStartTime
        if (stationaryDuration >= MIN_STATIONARY_TIME) {
          if (accelerometerHandler?.isReadyToTrigger) {
            onStartMoving()
            accelerometerHandler.isReadyToTrigger = false
          }
        }
      }
      isStationary = false
      stationaryStartTime = null
    }

    lastAcceleration = { x, y, z }
  })
}

export function stopMotionDetection() {
  if (accelerometerHandler) {
    Motion.removeAllListeners()
    accelerometerHandler = null
  }
  isStationary = false
  stationaryStartTime = null
}

export function isInStationaryState() {
  return isStationary && stationaryStartTime !== null
}

export function getStationaryDuration() {
  if (!isStationary || !stationaryStartTime) return 0
  return Date.now() - stationaryStartTime
}