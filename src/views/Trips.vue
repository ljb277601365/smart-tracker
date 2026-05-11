<template>
  <div class="trips-page">
    <div class="header">
      <h1>行程记录</h1>
      <button v-if="hasRequiredItems" class="btn-trace" @click="showTraceModal = true">
        🔍 丢失溯源
      </button>
    </div>

    <div class="date-tabs">
      <button
        v-for="day in dateOptions"
        :key="day.value"
        :class="{ active: selectedDate === day.value }"
        @click="selectedDate = day.value"
      >
        {{ day.label }}
      </button>
    </div>

    <div class="trips-list" v-if="filteredTrips.length > 0">
      <div v-for="trip in filteredTrips" :key="trip.id" class="trip-card">
        <div class="trip-time">
          <span class="time-range">{{ formatTime(trip.startTime) }}</span>
          <span class="trip-duration" v-if="trip.duration">
            {{ trip.duration }}分钟
          </span>
        </div>
        <div class="trip-info">
          <span class="trip-location">{{ trip.location }}</span>
          <span class="trip-date">{{ formatDate(trip.startTime) }}</span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <span class="empty-icon">📍</span>
      <p>暂无行程记录</p>
    </div>

    <div class="nav-bar">
      <button class="nav-btn" @click="$router.push('/')">🏠</button>
      <button class="nav-btn" @click="$router.push('/items')">🎒</button>
      <button class="nav-btn" @click="$router.push('/trips')">📍</button>
      <button class="nav-btn" @click="$router.push('/settings')">⚙️</button>
    </div>

    <div class="modal" v-if="showTraceModal">
      <div class="modal-content">
        <h3>丢失溯源</h3>
        <p>选择丢失的物品</p>
        <div class="trace-items">
          <button
            v-for="item in itemStore.requiredItems"
            :key="item.id"
            class="trace-item"
            @click="traceItem(item)"
          >
            {{ item.name }}
          </button>
        </div>
        <button class="btn-close" @click="showTraceModal = false">关闭</button>
      </div>
    </div>

    <div class="modal" v-if="showTraceResult">
      <div class="modal-content">
        <h3>溯源结果</h3>
        <div class="trace-result" v-if="traceResult">
          <p><strong>物品：</strong>{{ traceResult.item.name }}</p>
          <p><strong>最后出现时间：</strong>{{ formatDateTime(traceResult.trip.startTime) }}</p>
          <p><strong>最后停留位置：</strong>{{ traceResult.trip.location }}</p>
          <p style="margin-top: 12px; font-size: 13px; color: #666;">
            💡 该位置是这件物品被标记为必带后，停留超过10分钟的最后一个地点
          </p>
        </div>
        <p v-else>暂未找到该物品的行程记录，可能是因为该物品标记为必带后，还没有生成超过10分钟的停留行程</p>
        <button class="btn-close" @click="showTraceResult = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useItemStore } from '../stores/items'
import { useTripStore } from '../stores/trips'

const itemStore = useItemStore()
const tripStore = useTripStore()

const selectedDate = ref('all')
const showTraceModal = ref(false)
const showTraceResult = ref(false)
const traceResult = ref(null)

const dateOptions = computed(() => {
  const options = [{ label: '全部', value: 'all' }]
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    options.push({
      label: i === 0 ? '今天' : i === 1 ? '昨天' : `${i}天前`,
      value: date.toISOString().split('T')[0]
    })
  }
  return options
})

const hasRequiredItems = computed(() => itemStore.requiredItems.length > 0)

const filteredTrips = computed(() => {
  if (selectedDate.value === 'all') {
    return tripStore.getAllTrips()
  }
  return tripStore.getTripsByDate(new Date(selectedDate.value))
})

onMounted(async () => {
  await itemStore.loadItems()
  await tripStore.loadTrips()
})

function formatTime(isoString) {
  const date = new Date(isoString)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatDateTime(isoString) {
  const date = new Date(isoString)
  return `${formatDate(isoString)} ${formatTime(isoString)}`
}

function traceItem(item) {
  const foundTrip = tripStore.findLastTripForItem(item.id)
  if (foundTrip) {
    traceResult.value = {
      item,
      trip: foundTrip
    }
  } else {
    traceResult.value = null
  }
  showTraceModal.value = false
  showTraceResult.value = true
}
</script>

<style scoped>
.trips-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.btn-trace {
  background: #ff9500;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.date-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.date-tabs button {
  background: white;
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
}

.date-tabs button.active {
  background: #007aff;
  color: white;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trip-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.trip-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.time-range {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.trip-duration {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.trip-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.trip-location {
  font-size: 14px;
  color: #333;
}

.trip-date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 300px;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 15px;
  font-size: 18px;
}

.modal-content p {
  margin: 0 0 15px;
  color: #666;
}

.trace-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 15px;
}

.trace-item {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.trace-result {
  text-align: left;
  margin-bottom: 15px;
}

.trace-result p {
  margin: 8px 0;
  font-size: 14px;
}

.btn-close {
  background: #e0e0e0;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>