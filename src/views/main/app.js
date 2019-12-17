import Actions from '@/store/actions.js'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'

const state = {
  reqCancels: new Map(),
  userAreas: [],
  userMenus: [],
  userId: null,
  areaId: null,
  account: {
    Name: '管理员'
  },
  mainGroupList: [],
  mainGroupTree: [],
  mainGroupTreeHasRoot: [],
  isLoadingMainGroupList: false
}

const getters = {
  project: (state, getters) => {
    if (state.areaId && state.userAreas.length) {
      return state.userAreas.find(a => a.value === state.areaId)
    }
    return null
  },
  projectId (state, getters) {
    return getters.project ? getters.project.Id : null
  }
}

const actions = {
  ...Actions,
  getUserManage ({ state, commit, dispatch }) {
    let getUserManageAuthReq = api.user.getUserManageAuth()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getUserManageAuthReq', value: getUserManageAuthReq.cancel })
    getUserManageAuthReq.request.then(res => {
      let data = res.Data || {}
      let areas = data.Areas || []
      let menus = data.Menus || []
      // 保存用户UserID
      commit(types.SET_DATA, { item: 'userId', value: data.UserId || null })
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
        let menusTree = initTree(menus, { customProps, rootLevel: 1 })
        commit(types.SET_DATA, { item: 'userMenus', value: menusTree })
      } else {
        commit(types.SET_DATA, { item: 'userMenus', value: [] })
      }
      dispatch('getGroupList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally()
  },
  getGroupList ({ state, getters, commit }) {
    let postData = {
      ProjectId: getters.projectId
    }
    let getUserManageAuthReq = api.group.getGroupList(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getUserManageAuthReq', value: getUserManageAuthReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingMainGroupList', value: true })
    getUserManageAuthReq.request.then(res => {
      let groups = res.Data
      let project = getters.project || {}
      let mainGroupTree = initTree(groups, { rootLevel: 1 }) || []
      let mainGroupTreeHasRoot = [{
        value: project.Id,
        label: project.Name,
        children: mainGroupTree
      }]
      commit(types.SET_DATA, { item: 'mainGroupList', value: groups })
      commit(types.SET_DATA, { item: 'mainGroupTree', value: mainGroupTree })
      commit(types.SET_DATA, { item: 'mainGroupTreeHasRoot', value: mainGroupTreeHasRoot })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingMainGroupList', value: false })
    })
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
