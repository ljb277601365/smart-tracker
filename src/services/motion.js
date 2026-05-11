import { Motion } from '@capacitor/motion'

const BUFFER_SIZE = 25
const STATIONARY_VARIANCE_THRESHOLD = 0.15
const MIN_STATIONARY_TIME = 30 * 1000
const TRIGGER_MOVE_COUNT = 10

let accelBuffer = []
let isStationary = false
let stationaryStartTime = null
let isReadyToTrigger = false
let moveCounter = 0

export function startMotionDetection(onStartMoving) {
  stopMotionDetection()
  console.log('[Motion] 方差检测运动检测已启动')

  Motion.addListener('accel', (event) => {
    const { x, y, z } = event.acceleration
    accelBuffer.push({ x, y, z })
    if (accelBuffer.length > BUFFER_SIZE) {
      accelBuffer.shift()
    }

    if (accelBuffer.length < 10) return

    let sumX = 0, sumY = 0, sumZ = 0
    for (const p of accelBuffer) {
      sumX += p.x
      sumY += p.y
      sumZ += p.z
    }
    const avgX = sumX / accelBuffer.length
    const avgY = sumY / accelBuffer.length
    const avgZ = sumZ / accelBuffer.length

    let varSumX = 0, varSumY = 0, varSumZ = 0
    for (const p of accelBuffer) {
      varSumX += Math.pow(p.x - avgX, 2)
      varSumY += Math.pow(p.y - avgY, 2)
      varSumZ += Math.pow(p.z - avgZ, 2)
    }
    const varX = varSumX / accelBuffer.length
    const varY = varSumY / accelBuffer.length
    const varZ = varSumZ / accelBuffer.length
    const totalVariance = varX + varY + varZ

    console.log('[Motion] 总方差:', totalVariance.toFixed(3))

    if (totalVariance < STATIONARY_VARIANCE_THRESHOLD) {
      moveCounter = 0
      if (!isStationary) {
        isStationary = true
        if (!stationaryStartTime) {
          stationaryStartTime = Date.now()
          console.log('[Motion] 方差极小，确认静止！')
        }
      } else {
        const dur = Date.now() - stationaryStartTime
        if (dur >= MIN_STATIONARY_TIME && !isReadyToTrigger) {
          isReadyToTrigger = true
          console.log('[Motion] 静止满30秒，准备触发提醒')
        }
      }
    } else {
      if (isReadyToTrigger) {
        moveCounter++
        console.log('[Motion] 方差大，检测到动作，计数', moveCounter)
        if (moveCounter >= TRIGGER_MOVE_COUNT) {
          console.log('[Motion] 确认移动！触发提醒！')
          onStartMoving()
          isReadyToTrigger = false
          isStationary = false
          stationaryStartTime = null
          moveCounter = 0
        }
      }
    }
  })
}

export function stopMotionDetection() {
  Motion.removeAllListeners()
  accelBuffer = []
  isStationary = false
  stationaryStartTime = null
  isReadyToTrigger = false
  moveCounter = 0
  console.log('[Motion] 运动检测已停止')
}

export function isInStationaryState() {
  return isStationary
}

export function getStationaryDuration() {
  if (!isStationary || !stationaryStartTime) return 0
  return Date.now() - stationaryStartTime
}
