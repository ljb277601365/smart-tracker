<template>
  <div class="reminder-overlay" v-if="visible">
    <div class="reminder-modal">
      <h2 class="reminder-title">请核对随身物品</h2>
      <p class="reminder-subtitle">确认您的必带物品是否已全部携带</p>
      
      <div class="items-list">
        <label v-for="item in items" :key="item.id" class="item-checkbox">
          <input type="checkbox" v-model="checkedItems" :value="item.id" />
          <span>{{ item.name }}</span>
        </label>
      </div>

      <div class="reminder-buttons">
        <button class="btn-later" @click="handleLater">稍后提醒</button>
        <button class="btn-confirm" @click="handleConfirm">已确认带齐</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['confirm', 'later', 'update:show'])

const visible = ref(false)
const checkedItems = ref([])
let laterTimer = null

watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal) {
    checkedItems.value = []
  }
})

async function handleConfirm() {
  if (laterTimer) clearTimeout(laterTimer)
  emit('confirm')
  visible.value = false
  emit('update:show', false)
}

function handleLater() {
  if (laterTimer) clearTimeout(laterTimer)
  visible.value = false
  emit('update:show', false)
  emit('later')
}
</script>

<style scoped>
.reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.reminder-modal {
  background: white;
  border-radius: 20px;
  padding: 30px 25px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.reminder-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 0 0 8px;
}

.reminder-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0 0 25px;
}

.items-list {
  margin-bottom: 25px;
}

.item-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 10px;
  background: #f5f5f5;
  margin-bottom: 10px;
  cursor: pointer;
}

.item-checkbox input[type="checkbox"] {
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #007aff;
}

.item-checkbox span {
  font-size: 16px;
  color: #333;
}

.reminder-buttons {
  display: flex;
  gap: 12px;
}

.btn-later, .btn-confirm {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
}

.btn-later {
  background: #e5e5e5;
  color: #333;
}

.btn-confirm {
  background: #007aff;
  color: white;
  font-weight: 600;
}
</style>
