import Store from '../store'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'home',
    component: (resolve) => {
      Store.registerModule('home', {})
      return import('../views/home/index')
    }
  },
  // 404Page
  {
    path: '*',
    name: '404'
  }
]

export default routes
