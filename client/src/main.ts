import './index.css'

import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

export const state = reactive({
  count: 0
})

app.use(router)

app.mount('#app')
