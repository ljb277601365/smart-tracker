<template>
  <div class="home">
    <div class="header">
      <h1>智能防丢助手</h1>
      <p class="subtitle">让出行更安心</p>
    </div>

    <div class="permission-banner" v-if="!hasPermissions">
      <div class="permission-content">
        <span>⚠️ 请开启定位和通知权限以正常使用</span>
        <button @click="$router.push('/settings')" class="btn-primary">去设置</button>
      </div>
    </div>

    <div class="status-card">
      <div class="status-icon" :class="{ active: isTracking }">
        {{ isTracking ? '🟢' : '🔴' }}
      </div>
      <div class="status-text">
        <h3>{{ isTracking ? '行程记录中' : '未在记录' }}</h3>
        <p v-if="currentLocation">{{ currentLocation }}</p>
        <p v-else-if="locationLoading">正在获取位置...</p>
        <div class="motion-status">
          <span class="motion-badge" :class="{ moving: !isStationary && stationaryDuration === 0, stationary: isStationary }">
            {{ isStationary ? '🧘 静止中' : '🚶 移动中' }}
          </span>
          <span v-if="stationaryDuration > 0" class="stationary-info">
            ⏱️ 已静止 {{ formatStationaryTime(stationaryDuration) }}
          </span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-card" @click="$router.push('/items')">
        <span class="action-icon">🎒</span>
        <span class="action-label">物品管理</span>
        <span class="action-count">{{ itemStore.items.length }}件</span>
      </div>
      <div class="action-card" @click="$router.push('/trips')">
        <span class="action-icon">📍</span>
        <span class="action-label">行程记录</span>
        <span class="action-count">{{ tripStore.trips.length }}条</span>
      </div>
    </div>

    <div class="required-items" v-if="itemStore.requiredItems.length > 0">
      <h3>必带物品</h3>
      <div class="item-tags">
        <span
          v-for="item in itemStore.requiredItems"
          :key="item.id"
          class="item-tag"
        >
          {{ item.name }}
        </span>
      </div>
    </div>

    <div class="nav-bar">
      <button class="nav-btn" @click="$router.push('/')">🏠</button>
      <button class="nav-btn" @click="$router.push('/items')">🎒</button>
      <button class="nav-btn" @click="$router.push('/trips')">📍</button>
      <button class="nav-btn" @click="$router.push('/settings')">⚙️</button>
    </div>

    <ReminderModal 
      v-model:show="showReminder" 
      :items="itemStore.requiredItems"
      @confirm="onReminderConfirm"
      @later="onReminderLater"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '../stores/items'
import { useTripStore } from '../stores/trips'
import { useSettingsStore } from '../stores/settings'
import { getCurrentLocation, startLocationWatch, stopLocationWatch } from '../services/location'
import { startMotionDetection, stopMotionDetection, getStationaryDuration, isInStationaryState } from '../services/motion'
import { showReminderNotification } from '../services/notification'
import ReminderModal from '../components/ReminderModal.vue'

const router = useRouter()
const itemStore = useItemStore()
const tripStore = useTripStore()
const settingsStore = useSettingsStore()

const isTracking = ref(false)
const currentLocation = ref('')
const locationLoading = ref(false)
const hasPermissions = ref(false)
const showReminder = ref(false)
const stationaryDuration = ref(0)
const isStationary = ref(false)
let laterTimeout = null
let updateTimer = null

function formatStationaryTime(ms) {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

onMounted(async () => {
  await itemStore.loadItems()
  await tripStore.loadTrips()
  await settingsStore.loadSettings()

  hasPermissions.value = settingsStore.locationPermission && settingsStore.notificationPermission

  if (settingsStore.locationPermission) {
    await startTracking()
  }

  startMotionDetection(() => {
    triggerReminder()
  })

  updateTimer = setInterval(() => {
    stationaryDuration.value = getStationaryDuration()
    isStationary.value = isInStationaryState()
  }, 1000)
})

onUnmounted(() => {
  stopLocationWatch()
  stopMotionDetection()
  if (laterTimeout) clearTimeout(laterTimeout)
  if (updateTimer) clearInterval(updateTimer)
})

async function startTracking() {
  locationLoading.value = true
  const location = await getCurrentLocation()
  locationLoading.value = false
  
  if (location) {
    tripStore.updateOrCreateStay(location)
    currentLocation.value = location.address
    isTracking.value = true

    startLocationWatch(async (newLocation) => {
      const loc = await getCurrentLocation()
      if (loc) {
        tripStore.updateOrCreateStay(loc)
        currentLocation.value = loc.address
      }
    })
  }
}

async function triggerReminder() {
  if (itemStore.requiredItems.length === 0) return
  
  showReminder.value = true
  
  await showReminderNotification(
    '请核对随身物品',
    `您有 ${itemStore.requiredItems.length} 件必带物品请检查`,
    itemStore.requiredItems
  )
}

function onReminderConfirm() {
  if (laterTimeout) clearTimeout(laterTimeout)
}

function onReminderLater() {
  laterTimeout = setTimeout(() => {
    triggerReminder()
  }, 3 * 60 * 1000)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 80px;
}

.header {
  text-align: center;
  padding: 20px 0;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.permission-banner {
  background: #fff3cd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.permission-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.btn-primary {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-icon {
  font-size: 40px;
}

.status-text h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.status-text p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #666;
}

.motion-status {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.motion-badge {
  font-size: 14px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-block;
}

.motion-badge.moving {
  background: #fff3e0;
  color: #f57c00;
}

.motion-badge.stationary {
  background: #e8f5e9;
  color: #2e7d32;
}

.stationary-info {
  font-size: 14px;
  color: #007aff;
  font-weight: 500;
  background: #e3f2fd;
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
}

.action-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
}

.action-label {
  font-size: 14px;
  color: #333;
  display: block;
}

.action-count {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  display: block;
}

.required-items {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.required-items h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #333;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
}

.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.nav-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
</style>
