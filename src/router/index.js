import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const Auth = sessionStorage.getItem('Auth')
  console.log('to => ' + to.path)
  if (Auth) {
    next()
  } else {
    location.replace(location.origin + '/login')
  }
})

export default router
