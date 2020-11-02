import Vue from 'vue'
import VueRouter from 'vue-router'

import NProgress from 'nprogress' // 导入NProgress

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "group-login" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "group-login" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "group-login" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
// import Roles from '../components/authority/Roles.vue'
// import Rights from '../components/authority/Rights.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users.vue')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/authority/Roles.vue')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/authority/Rights.vue')

// import Category from '../components/goods/Category.vue'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
const Category = () => import(/* webpackChunkName: "category_prams_list_Add" */ '../components/goods/Category.vue')
const Params = () => import(/* webpackChunkName: "category_prams_list_Add" */ '../components/goods/Params.vue')
const List = () => import(/* webpackChunkName: "category_prams_list_Add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "category_prams_list_Add" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' }, // 将根目录重定向到/login
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome', // 将首页重定向到欢迎界面
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Category },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载全局前置守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  NProgress.done()
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login') // 没有token值会返回到登录页面
  next()
})
export default router
// 防止重复点击路由报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
