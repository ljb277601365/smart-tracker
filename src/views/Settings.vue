<template>
  <div class="settings-page">
    <div class="header">
      <h1>设置</h1>
    </div>

    <div class="section">
      <h3>权限管理</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-icon">📍</span>
          <div>
            <span class="setting-label">定位权限</span>
            <span class="setting-status" :class="{ granted: hasLocationPermission }">
              {{ hasLocationPermission ? '已开启' : '未开启' }}
            </span>
          </div>
        </div>
        <button class="btn-setting" @click="requestLocation">
          {{ hasLocationPermission ? '查看' : '开启' }}
        </button>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-icon">🔔</span>
          <div>
            <span class="setting-label">通知权限</span>
            <span class="setting-status" :class="{ granted: hasNotificationPermission }">
              {{ hasNotificationPermission ? '已开启' : '未开启' }}
            </span>
          </div>
        </div>
        <button class="btn-setting" @click="requestNotification">
          {{ hasNotificationPermission ? '查看' : '开启' }}
        </button>
      </div>
    </div>

    <div class="section">
      <h3>隐私说明</h3>
      <div class="privacy-info">
        <p>⚠️ 重要提示</p>
        <p>所有物品记录、行程轨迹数据仅保存在您的手机本地，不会上传至任何云端服务器。</p>
        <p>数据默认保存7天后自动清除。</p>
      </div>
    </div>

    <div class="section">
      <h3>版本信息</h3>
      <div class="version-info">
        <span>智能防丢助手</span>
        <span class="version-number">v{{ settingsStore.version }}</span>
      </div>
    </div>

    <div class="nav-bar">
      <button class="nav-btn" @click="$router.push('/')">🏠</button>
      <button class="nav-btn" @click="$router.push('/items')">🎒</button>
      <button class="nav-btn" @click="$router.push('/trips')">📍</button>
      <button class="nav-btn" @click="$router.push('/settings')">⚙️</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { requestLocationPermission } from '../services/location'
import { requestNotificationPermission } from '../services/notification'
import { Capacitor } from '@capacitor/core'

const settingsStore = useSettingsStore()

const hasLocationPermission = ref(false)
const hasNotificationPermission = ref(false)

onMounted(async () => {
  await settingsStore.loadSettings()
  hasLocationPermission.value = settingsStore.locationPermission
  hasNotificationPermission.value = settingsStore.notificationPermission
})

async function requestLocation() {
  if (Capacitor.isNativePlatform()) {
    const granted = await requestLocationPermission()
    hasLocationPermission.value = granted
    await settingsStore.setLocationPermission(granted)
  }
}

async function requestNotification() {
  if (Capacitor.isNativePlatform()) {
    const granted = await requestNotificationPermission()
    hasNotificationPermission.value = granted
    await settingsStore.setNotificationPermission(granted)
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 80px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section h3 {
  font-size: 14px;
  color: #999;
  margin: 0 0 15px;
  font-weight: normal;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  font-size: 24px;
}

.setting-label {
  display: block;
  font-size: 16px;
  color: #333;
}

.setting-status {
  display: block;
  font-size: 12px;
  color: #ff3b30;
}

.setting-status.granted {
  color: #34c759;
}

.btn-setting {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.privacy-info {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.privacy-info p {
  margin: 0;
}

.privacy-info p:first-child {
  color: #ff9500;
  font-weight: bold;
  margin-bottom: 10px;
}

.version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.version-number {
  color: #999;
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