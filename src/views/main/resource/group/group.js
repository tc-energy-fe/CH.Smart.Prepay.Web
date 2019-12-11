import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
// import initTree from '@/utils/tree'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  groupList: [],
  isModify: false,
  searchName: '',
  editParentId: null,
  editData: {
    Id: null,
    Name: ''
  },
  currentPage: 1,
  isShowEdit: false,
  isLoadingGroupList: false
}

const getters = {
  mainGroupList: (state, getters, rootState) => rootState.mainGroupList,
  groupTree: (state, getters, rootState, rootGetters) => {
    let rootTree = rootState.mainGroupTree || []
    let project = rootGetters.project || {}
    return [{
      value: -1,
      label: project.Name || '全部区域',
      children: rootTree
    }]
  },
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId,
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  nodeOnChange ({ state, commit, dispatch }, val) {
    commit(types.SET_DATA, { item: 'currentNode', value: val })
    dispatch('getGroupList')
  },
  showEdit ({ state, commit, dispatch }, { data, isShow = true }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    commit(types.SET_DATA, { item: 'editData', value: { Id: null, Name: '' } })
    commit(types.SET_DATA, { item: 'editParentId', value: null })
    if (data) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: data[k] })
      })
      commit(types.SET_DATA, { item: 'editParentId', value: data.ParentId })
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getGroupList ({ state, getters, commit, dispatch }) {
    dispatch('currentPageOnChange', 1)
    let params = {
      ProjectId: getters.projectId,
      Name: state.searchName
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== -1) {
      params.GroupId = getters.currentNodeId
    }
    let getGroupListReq = api.group.getGroupList(params)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGroupList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGroupListReq', value: getGroupListReq.cancel })
    getGroupListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'groupList', value: data })
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGroupList', value: false })
    })
  },
  editGroup ({ state, getters, commit, dispatch }) {
    let editData = state.editData
    let postData = {
      ProjectId: getters.projectId,
      Name: editData.Name
    }
    if (!postData.Name || postData.Name === '') {
      alert('区域名称不能为空！')
      return
    }
    if (state.isModify) {
      postData.Id = editData.Id
    }
    if (!isEmpty(state.editParentId) && state.editParentId !== -1) {
      postData.ParentId = state.editParentId
    }
    let editGroupReq = state.isModify ? api.group.modifyGroup(postData) : api.group.addGroup(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'editGroupReq', value: editGroupReq.cancel })
    editGroupReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getGroupList', null, { root: true })
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {})
  },
  deleteGroup ({ state, commit, dispatch }, data) {
    ElConfirm(`确定要删除区域 ${data.Name} 吗？`, '提示').then(() => {
      let deleteGroupReq = api.group.deleteGroup(data.Id)
      commit(types.ADD_REQUEST_CANCEL, { item: 'deleteGroupReq', value: deleteGroupReq.cancel })
      deleteGroupReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('getGroupList', null, { root: true })
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {})
    }).catch(() => {
    })
  }
}

const mutations = {
  ...Mutations
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
