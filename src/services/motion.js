import { Motion } from '@capacitor/motion'

let lastAccelerationMagnitude = 0
let isStationary = false
let stationaryStartTime = null
let isReadyToTrigger = false
let consecutiveMoveCount = 0

const STATIONARY_MAGNITUDE_CHANGE_THRESHOLD = 2.0
const MOVE_MAGNITUDE_CHANGE_THRESHOLD = 3.0
const MIN_STATIONARY_TIME = 30 * 1000
const REQUIRED_MOVE_COUNT_TO_TRIGGER = 3

export function startMotionDetection(onStartMoving) {
  stopMotionDetection()
  console.log('[Motion] 运动检测已启动')

  Motion.addListener('accel', (event) => {
    const { x, y, z } = event.acceleration
    const magnitude = Math.sqrt(x * x + y * y + z * z)
    const magnitudeDelta = Math.abs(magnitude - lastAccelerationMagnitude)

    if (!isStationary && magnitudeDelta < STATIONARY_MAGNITUDE_CHANGE_THRESHOLD) {
      isStationary = true
      stationaryStartTime = Date.now()
      console.log('[Motion] 检测到设备开始静止')
    }

    if (isStationary) {
      const stationaryDuration = Date.now() - stationaryStartTime
      if (stationaryDuration >= MIN_STATIONARY_TIME && !isReadyToTrigger) {
        isReadyToTrigger = true
        console.log('[Motion] 设备静止满30秒，准备好触发提醒')
      }
    }

    if (isReadyToTrigger && magnitudeDelta >= MOVE_MAGNITUDE_CHANGE_THRESHOLD) {
      consecutiveMoveCount++
      console.log('[Motion] 检测到有效移动帧，计数', consecutiveMoveCount)

      if (consecutiveMoveCount >= REQUIRED_MOVE_COUNT_TO_TRIGGER) {
        console.log('[Motion] 连续3次有效移动！触发提醒！！')
        onStartMoving()
        isReadyToTrigger = false
        isStationary = false
        stationaryStartTime = null
        consecutiveMoveCount = 0
      }
    }

    if (isStationary && magnitudeDelta < STATIONARY_MAGNITUDE_CHANGE_THRESHOLD) {
      consecutiveMoveCount = 0
    }

    lastAccelerationMagnitude = magnitude
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
