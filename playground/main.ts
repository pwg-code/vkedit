import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import VueKonva from 'vue-konva'

const app = createApp(App)

app.use(createPinia())
app.use(VueKonva)
app.mount('#app')
