import { Motion } from '@capacitor/motion'

let lastAcceleration = { x: 0, y: 0, z: 0 }
let isStationary = false
let stationaryStartTime = null
let isReadyToTrigger = false
let consecutiveMoveCount = 0

const STATIONARY_THRESHOLD = 0.5
const MIN_STATIONARY_TIME = 30 * 1000
const REQUIRED_MOVE_COUNT_TO_TRIGGER = 5

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
      consecutiveMoveCount = 0
      
      if (!isStationary) {
        isStationary = true
        if (!stationaryStartTime) {
          stationaryStartTime = Date.now()
        }
        console.log('[Motion] 检测到设备开始静止')
      } else {
        const stationaryDuration = Date.now() - stationaryStartTime
        if (stationaryDuration >= MIN_STATIONARY_TIME && !isReadyToTrigger) {
          isReadyToTrigger = true
          console.log('[Motion] 设备静止时间已超过阈值，准备触发提醒')
        }
      }
    } else {
      consecutiveMoveCount++
      console.log('[Motion] 检测到移动帧，连续移动计数:', consecutiveMoveCount)

      if (isReadyToTrigger && consecutiveMoveCount >= REQUIRED_MOVE_COUNT_TO_TRIGGER) {
        console.log('[Motion] 确认稳定移动，触发提醒！')
        onStartMoving()
        isReadyToTrigger = false
        isStationary = false
        stationaryStartTime = null
        consecutiveMoveCount = 0
      }
    }

    lastAcceleration = { x, y, z }
  })
}

export function stopMotionDetection() {
  Motion.removeAllListeners()
  isStationary = false
  stationaryStartTime = null
  isReadyToTrigger = false
  consecutiveMoveCount = 0
  console.log('[Motion] 运动检测已停止')
}

export function isInStationaryState() {
  return isStationary
}

export function getStationaryDuration() {
  if (!isStationary || !stationaryStartTime) return 0
  return Date.now() - stationaryStartTime
}
