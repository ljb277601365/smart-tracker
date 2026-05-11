<template>
  <div class="items-page">
    <div class="header">
      <h1>物品管理</h1>
      <button class="btn-add" @click="$router.push('/items/edit')">+ 添加物品</button>
    </div>

    <div class="items-list" v-if="itemStore.items.length > 0">
      <div
        v-for="item in itemStore.items"
        :key="item.id"
        class="item-card"
        :class="{ required: item.required }"
      >
        <div class="item-info" @click="editItem(item)">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-badge" v-if="item.required">必带</span>
        </div>
        <div class="item-actions">
          <button
            class="btn-toggle"
            :class="{ active: item.required }"
            @click.stop="toggleRequired(item)"
          >
            {{ item.required ? '✓' : '○' }}
          </button>
          <button class="btn-delete" @click.stop="confirmDelete(item)">🗑️</button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <span class="empty-icon">🎒</span>
      <p>暂无物品</p>
      <button class="btn-primary" @click="$router.push('/items/edit')">添加第一个物品</button>
    </div>

    <div class="nav-bar">
      <button class="nav-btn" @click="$router.push('/')">🏠</button>
      <button class="nav-btn" @click="$router.push('/items')">🎒</button>
      <button class="nav-btn" @click="$router.push('/trips')">📍</button>
      <button class="nav-btn" @click="$router.push('/settings')">⚙️</button>
    </div>

    <div class="toast" v-if="toast.show" :class="toast.type">
      {{ toast.message }}
    </div>

    <div class="modal" v-if="showDeleteModal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>确定要删除「{{ itemToDelete?.name }}」吗？</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">取消</button>
          <button class="btn-confirm" @click="deleteItem">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '../stores/items'

const router = useRouter()
const itemStore = useItemStore()

const toast = reactive({ show: false, message: '', type: '' })
const showDeleteModal = ref(false)
const itemToDelete = ref(null)

function editItem(item) {
  router.push(`/items/edit/${item.id}`)
}

async function toggleRequired(item) {
  const oldRequired = item.required
  await itemStore.updateItem(item.id, item.name, !item.required)
  showToast(oldRequired ? '已取消必带' : '已标记为必带', 'success')
}

function confirmDelete(item) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

async function deleteItem() {
  if (itemToDelete.value) {
    await itemStore.deleteItem(itemToDelete.value.id)
    showToast('删除成功', 'success')
  }
  showDeleteModal.value = false
  itemToDelete.value = null
}

function showToast(message, type = 'info') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2000)
}
</script>

<style scoped>
.items-page {
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

.btn-add {
  background: #007aff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.item-card.required {
  border-left: 4px solid #007aff;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
}

.item-name {
  font-size: 16px;
  color: #333;
}

.item-badge {
  background: #007aff;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.item-actions {
  display: flex;
  gap: 10px;
}

.btn-toggle {
  background: #e0e0e0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
}

.btn-toggle.active {
  background: #007aff;
  color: white;
}

.btn-delete {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
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
  margin-bottom: 20px;
}

.btn-primary {
  background: #007aff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
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

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 100;
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
  width: 280px;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.modal-content p {
  margin: 0 0 20px;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel {
  background: #e0e0e0;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
}

.btn-confirm {
  background: #ff3b30;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
}
</style>