import { Motion } from '@capacitor/motion'

let lastAcceleration = { x: 0, y: 0, z: 0 }
let isStationary = false
let stationaryStartTime = null
let isReadyToTrigger = false
let onDebugLog = null
let onAccelUpdate = null
let isInitialized = false

const STATIONARY_THRESHOLD = 0.5
const MIN_STATIONARY_TIME = 30 * 1000

export function setDebugLogCallback(callback) {
  onDebugLog = callback
}

export function setAccelUpdateCallback(callback) {
  onAccelUpdate = callback
}

function addLog(msg) {
  console.log('[Motion]', msg)
  if (onDebugLog) {
    onDebugLog(msg)
  }
}

export function startMotionDetection(onStartMoving) {
  stopMotionDetection()
  addLog('运动检测已启动（经典稳定版）')

  Motion.addListener('accel', (event) => {
    const { x, y, z } = event.acceleration
    if (onAccelUpdate) {
      onAccelUpdate({ x, y, z })
    }
    
    if (!isInitialized) {
      lastAcceleration = { x, y, z }
      isInitialized = true
      return
    }
    
    const deltaX = Math.abs(x - lastAcceleration.x)
    const deltaY = Math.abs(y - lastAcceleration.y)
    const deltaZ = Math.abs(z - lastAcceleration.z)
    const totalDelta = deltaX + deltaY + deltaZ

    if (totalDelta < STATIONARY_THRESHOLD) {
      if (!isStationary) {
        isStationary = true
        if (!stationaryStartTime) {
          stationaryStartTime = Date.now()
        }
        addLog('✅ 检测到静止')
      } else {
        const stationaryDuration = Date.now() - stationaryStartTime
        if (stationaryDuration >= MIN_STATIONARY_TIME && !isReadyToTrigger) {
          isReadyToTrigger = true
          addLog('⏰ 静止满30秒，就绪！')
        }
      }
    } else {
      addLog(`⚡ 大动作！Delta=${totalDelta.toFixed(2)}`)
      isStationary = false
      stationaryStartTime = null
      if (isReadyToTrigger) {
        addLog('🎉 触发提醒！！！')
        onStartMoving()
        isReadyToTrigger = false
      }
    }

    lastAcceleration = { x, y, z }
  })
}

export function stopMotionDetection() {
  Motion.removeAllListeners()
  isReadyToTrigger = false
  addLog('运动检测已停止')
}

export function isInStationaryState() {
  return isStationary
}

export function getStationaryDuration() {
  if (!isStationary || !stationaryStartTime) return 0
  return Date.now() - stationaryStartTime
}
