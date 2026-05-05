<template>
  <div class="edit-page">
    <div class="header">
      <button class="btn-back" @click="$router.back()">←</button>
      <h1>{{ isEdit ? '编辑物品' : '添加物品' }}</h1>
      <button class="btn-save" @click="saveItem">保存</button>
    </div>

    <div class="form">
      <div class="form-group">
        <label>物品名称</label>
        <input
          v-model="itemName"
          type="text"
          placeholder="请输入物品名称"
          class="input"
        />
      </div>

      <div class="preset-items">
        <label>快捷添加</label>
        <div class="preset-tags">
          <button
            v-for="preset in presets"
            :key="preset"
            class="preset-tag"
            @click="itemName = preset"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input v-model="isRequired" type="checkbox" class="checkbox" />
          <span>标记为必带物品</span>
        </label>
        <p class="hint">开启后，离场提醒将显示此物品</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useItemStore } from '../stores/items'

const router = useRouter()
const route = useRoute()
const itemStore = useItemStore()

const presets = ['钥匙', '钱包', '耳机', '手机', '身份证']
const itemName = ref('')
const isRequired = ref(false)

const isEdit = computed(() => !!route.params.id)

onMounted(() => {
  if (isEdit.value) {
    const item = itemStore.getItemById(parseInt(route.params.id))
    if (item) {
      itemName.value = item.name
      isRequired.value = item.required
    }
  }
})

async function saveItem() {
  if (!itemName.value.trim()) {
    alert('请输入物品名称')
    return
  }

  if (isEdit.value) {
    await itemStore.updateItem(parseInt(route.params.id), itemName.value.trim(), isRequired.value)
  } else {
    await itemStore.addItem(itemName.value.trim(), isRequired.value)
  }

  router.back()
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.btn-back {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.header h1 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.btn-save {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #007aff;
}

.preset-items {
  margin-bottom: 20px;
}

.preset-items label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-tag {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
}

.preset-tag:hover {
  background: #bbdefb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>