import { Motion } from '@capacitor/motion'

const WINDOW_SIZE = 30
const STATIONARY_THRESHOLD = 0.3
const MIN_STATIONARY_TIME = 30 * 1000
const TRIGGER_MOVE_THRESHOLD = 8

let windowBuffer = []
let isStationary = false
let stationaryStartTime = null
let isReadyToTrigger = false
let recentBigMoveCount = 0

export function startMotionDetection(onStartMoving) {
  stopMotionDetection()
  console.log('[Motion] 滑动窗口滤波运动检测已启动')

  Motion.addListener('accel', (event) => {
    const { x, y, z } = event.acceleration

    windowBuffer.push({ x, y, z })
    if (windowBuffer.length > WINDOW_SIZE) {
      windowBuffer.shift()
    }

    if (windowBuffer.length < 2) return

    let allStationaryPoints = 0
    for (let i = 1; i < windowBuffer.length; i++) {
      const prev = windowBuffer[i - 1]
      const curr = windowBuffer[i]
      const dx = Math.abs(curr.x - prev.x)
      const dy = Math.abs(curr.y - prev.y)
      const dz = Math.abs(curr.z - prev.z)
      const totalD = dx + dy + dz

      if (totalD < STATIONARY_THRESHOLD) {
        allStationaryPoints++
      }
    }

    const stationaryRatio = allStationaryPoints / (windowBuffer.length - 1)

    if (stationaryRatio >= 0.8) {
      recentBigMoveCount = 0
      if (!isStationary) {
        isStationary = true
        if (!stationaryStartTime) {
          stationaryStartTime = Date.now()
          console.log('[Motion] 窗口内80%点静止，开始累计停留时间')
        }
      } else {
        const duration = Date.now() - stationaryStartTime
        if (duration >= MIN_STATIONARY_TIME && !isReadyToTrigger) {
          isReadyToTrigger = true
          console.log('[Motion] 静止满30秒，准备触发提醒')
        }
      }
    } else {
      if (isReadyToTrigger) {
        recentBigMoveCount++
        console.log('[Motion] 检测到大动作，计数', recentBigMoveCount)
        if (recentBigMoveCount >= TRIGGER_MOVE_THRESHOLD) {
          console.log('[Motion] 稳定的大动作！触发提醒！')
          onStartMoving()
          isReadyToTrigger = false
          isStationary = false
          stationaryStartTime = null
          recentBigMoveCount = 0
        }
      }
    }
  })
}

export function stopMotionDetection() {
  Motion.removeAllListeners()
  windowBuffer = []
  isStationary = false
  stationaryStartTime = null
  isReadyToTrigger = false
  recentBigMoveCount = 0
  console.log('[Motion] 运动检测已停止')
}

export function isInStationaryState() {
  return isStationary
}

export function getStationaryDuration() {
  if (!isStationary || !stationaryStartTime) return 0
  return Date.now() - stationaryStartTime
}
