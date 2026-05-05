import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Items from '../views/Items.vue'
import ItemEdit from '../views/ItemEdit.vue'
import Trips from '../views/Trips.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/items', name: 'Items', component: Items },
  { path: '/items/edit/:id?', name: 'ItemEdit', component: ItemEdit },
  { path: '/trips', name: 'Trips', component: Trips },
  { path: '/settings', name: 'Settings', component: Settings }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router