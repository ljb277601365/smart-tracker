import { Motion } from '@capacitor/motion'

let lastAcceleration = { x: 0, y: 0, z: 0 }
let isStationary = false
let stationaryStartTime = null
let isReadyToTrigger = false
const STATIONARY_THRESHOLD = 0.5
const MIN_STATIONARY_TIME = 30 * 1000

export function startMotionDetection(onStartMoving) {
  stopMotionDetection()
  console.log('[Motion] 运动检测已启动')

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
        console.log('[Motion] 检测到设备开始静止')
      } else {
        const stationaryDuration = Date.now() - stationaryStartTime
        if (stationaryDuration >= MIN_STATIONARY_TIME && !isReadyToTrigger) {
          isReadyToTrigger = true
          console.log('[Motion] 设备静止时间已超过阈值，准备触发提醒')
        }
      }
    } else {
      if (isStationary && stationaryStartTime && isReadyToTrigger) {
        const stationaryDuration = Date.now() - stationaryStartTime
        console.log('[Motion] 检测到移动！静止时长:', stationaryDuration, 'ms')
        onStartMoving()
        isReadyToTrigger = false
      }
      isStationary = false
      stationaryStartTime = null
    }

    lastAcceleration = { x, y, z }
  })
}

export function stopMotionDetection() {
  Motion.removeAllListeners()
  isStationary = false
  stationaryStartTime = null
  isReadyToTrigger = false
  console.log('[Motion] 运动检测已停止')
}

export function isInStationaryState() {
  return isStationary
}

export function getStationaryDuration() {
  if (!isStationary || !stationaryStartTime) return 0
  return Date.now() - stationaryStartTime
}
