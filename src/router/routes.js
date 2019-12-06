import Store from '@/store'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: (resolve) => {
      Store.registerModule('home', require('@/views/main/home/index').default)
      return import('../views/main/home/index')
    }
  },
  {
    path: '/resource',
    component: (resolve) => {
      Store.registerModule('resource', { namespaced: true })
      return import('../views/main/resource/index')
    },
    children: [
      { path: '', redirect: 'project' },
      {
        path: 'project',
        component: (resolve) => {
          Store.registerModule(['resource', 'project'], require('@/views/main/resource/project/project').default)
          return import('@/views/main/resource/project/index')
        }
      },
      {
        path: 'group',
        component: (resolve) => {
          Store.registerModule(['resource', 'group'], require('@/views/main/resource/group/group').default)
          return import('@/views/main/resource/group/index')
        }
      }
    ]
  },
  {
    path: '/system',
    component: () => {
      Store.registerModule('system', { namespaced: true })
      return import('../views/main/system/index')
    },
    children: [
      { path: '', redirect: 'role' },
      {
        path: 'role',
        component: () => {
          Store.registerModule(['system', 'role'], require('@/views/main/system/role/role').default)
          return import('@/views/main/system/role/index')
        }
      }
    ]
  },
  // 404Page
  {
    path: '*',
    name: '404'
  }
]

export default routes
