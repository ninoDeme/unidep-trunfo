import './index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import "vue3-toastify/dist/index.css";

const app = createApp(App)

app.use(router)
app.use(Vue3Toastify, {
  clearOnUrlChange: false,
  autoClose: 4000
} as ToastContainerOptions)

app.mount('#app')
