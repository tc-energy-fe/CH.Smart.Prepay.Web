import Actions from '@/store/actions.js'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api/user'
import tree from '@/utils/tree'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'
// import moment from 'moment'

const state = {
  reqCancels: new Map(),
  userAreas: [],
  userMenus: [],
  areaId: null,
  account: {
    Name: '管理员'
  }
}

const getters = {
  project: (state, getters) => {
    if (state.areaId && state.userAreas.length) {
      return state.userAreas.find(a => a.value === state.areaId)
    }
    return null
  }
}

const actions = {
  ...Actions,
  getUserManage ({ state, commit }) {
    let getUserManageAuthReq = api.getUserManageAuth()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getUserManageAuthReq', value: getUserManageAuthReq.cancel })
    getUserManageAuthReq.request.then(res => {
      let data = res.Data || {}
      let areas = data.Areas || []
      let menus = data.Menus || []
      // 保存用户名
      commit(types.SET_DATA, { item: 'account', value: { Name: data.Name, AccountType: data.AccountType } })
      // 保存用户管理的项目
      if (areas.length) {
        areas.forEach(area => {
          area.value = area.Id
          area.label = area.Name
        })
      }
      commit(types.SET_DATA, { item: 'userAreas', value: areas })
      commit(types.SET_DATA, { item: 'areaId', value: areas[0].value || null })
      // 保存用户可访问的页面
      if (menus.length) {
        let customProps = {
          Id: 'Id',
          Name: 'Name'
        }
        let menusTree = tree(menus, { customProps, rootLevel: 1 })
        commit(types.SET_DATA, { item: 'userMenus', value: menusTree })
      } else {
        commit(types.SET_DATA, { item: 'userMenus', value: [] })
      }
    }).catch(err => {
      console.log(err)
    }).finally()
  }
}

const mutations = {
  ...Mutations
}

export default {
  state,
  getters,
  actions,
  mutations
}
