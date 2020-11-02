/** 第三方模块 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios' // axios相关
import VueAxios from 'vue-axios' // axios相关
import './assets/fonts/iconfont.css' // 引入阿里图标库
import TreeTable from 'vue-table-with-tree-grid' // vue-table-with-tree-grid组件
// import ZkTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor' // 导入vue-quill-editor组件
// 导入vue-quill-editor组件的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

/** 自定义模块 */
import './assets/css/global.css'
Vue.use(VueAxios, axios)
// Vue.use(ZkTable)
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 给每个axios请求头的Authorization字段添加token令牌
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
axios.interceptors.response.use(config => {
  return config
})
// 日期过滤器
Vue.filter('dateFormat', function (originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0') // 格式化月份
  const d = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
