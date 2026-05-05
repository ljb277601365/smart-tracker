import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useItemStore = defineStore('items', () => {
  const items = ref([])
  const lastId = ref(0)

  const ITEMS_KEY = 'smart_tracker_items'

  function loadItems() {
    try {
      const result = localStorage.getItem(ITEMS_KEY)
      if (result) {
        const data = JSON.parse(result)
        items.value = data.items || []
        lastId.value = data.lastId || 0
      }
    } catch (e) {
      console.error('Failed to load items:', e)
    }
  }

  function saveItems() {
    try {
      localStorage.setItem(
        ITEMS_KEY,
        JSON.stringify({ items: items.value, lastId: lastId.value })
      )
    } catch (e) {
      console.error('Failed to save items:', e)
    }
  }

  function addItem(name, required = false) {
    lastId.value++
    const newItem = {
      id: lastId.value,
      name,
      required,
      createdAt: new Date().toISOString()
    }
    items.value.push(newItem)
    saveItems()
    return newItem
  }

  function updateItem(id, name, required) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.name = name
      item.required = required
      saveItems()
    }
  }

  function deleteItem(id) {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      saveItems()
    }
  }

  function getItemById(id) {
    return items.value.find(i => i.id === id)
  }

  const requiredItems = computed(() => items.value.filter(item => item.required))

  return {
    items,
    requiredItems,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    getItemById
  }
})