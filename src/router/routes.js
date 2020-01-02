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
      },
      {
        path: 'room',
        component: (resolve) => {
          Store.registerModule(['resource', 'room'], require('@/views/main/resource/room/room').default)
          return import('@/views/main/resource/room/index')
        }
      },
      {
        path: 'roomUser',
        component: (resolve) => {
          Store.registerModule(['resource', 'roomUser'], require('@/views/main/resource/roomUser/roomUser').default)
          return import('@/views/main/resource/roomUser/index')
        }
      },
      {
        path: 'meter',
        component: (resolve) => {
          Store.registerModule(['resource', 'meter'], require('@/views/main/resource/meter/meter').default)
          return import('@/views/main/resource/meter/index')
        }
      },
      {
        path: 'gateway',
        component: (resolve) => {
          Store.registerModule(['resource', 'gateway'], require('@/views/main/resource/gateway/gateway').default)
          return import('@/views/main/resource/gateway/index')
        }
      }
    ]
  },
  {
    path: '/config',
    component: () => {
      Store.registerModule('config', { namespaced: true })
      return import('../views/main/config/index')
    },
    children: [
      { path: '', redirect: 'price' },
      {
        path: 'price',
        component: () => {
          Store.registerModule(['config', 'price'], require('@/views/main/config/price/price').default)
          return import('../views/main/config/price/index')
        }
      },
      {
        path: 'warn',
        component: () => {
          Store.registerModule(['config', 'warn'], require('@/views/main/config/warn/warn').default)
          return import('../views/main/config/warn/index')
        }
      },
      {
        path: 'subsidy',
        component: () => {
          Store.registerModule(['config', 'subsidy'], require('@/views/main/config/subsidy/subsidy').default)
          return import('../views/main/config/subsidy/index')
        }
      },
      {
        path: 'switch',
        component: () => {
          Store.registerModule(['config', 'switch'], require('@/views/main/config/switch/switch').default)
          return import('../views/main/config/switch/index')
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
      },
      {
        path: 'user',
        component: () => {
          Store.registerModule(['system', 'user'], require('@/views/main/system/user/user').default)
          return import('@/views/main/system/user/index')
        }
      },
      {
        path: 'log',
        component: () => {
          Store.registerModule(['system', 'log'], require('@/views/main/system/log/log').default)
          return import('@/views/main/system/log/index')
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
