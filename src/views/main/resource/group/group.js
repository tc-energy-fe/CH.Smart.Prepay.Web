import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  groupList: [],
  isModify: false,
  searchName: '',
  editData: {
    Id: null,
    Name: '',
    Desc: ''
  },
  isShowEdit: false,
  isLoadingGroupList: false
}

const getters = {
  groupTree: (state, getters, rootState) => initTree(rootState.mainGroupList, { rootLevel: 1 }) || [],
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId,
  currentNodeId: state => state.currentNode.value,
  isLoadingMainGroupList: (state, getters, rootState) => rootState.isLoadingMainGroupList
}

const actions = {
  ...Actions,
  nodeOnChange ({ state, commit }, val) {
    commit(types.SET_DATA, { item: 'currentNode', value: val })
  },
  showEdit ({ state, commit, dispatch }, { data, isShow = true }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    commit(types.SET_DATA, { item: 'editData', value: { Id: null, Name: '', Desc: '' } })
    if (data) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: data[k] })
      })
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getGroupList ({ state, getters, commit }) {
    let getGroupListReq = api.group.getGroupList({
      ProjectId: getters.projectId,
      GroupId: getters.currentNodeId,
      Name: state.searchName
    })
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
  editProject ({ state, getters, commit, dispatch }) {
    let editData = state.editData
    let postData = {
      Name: editData.Name,
      Desc: editData.Desc || ''
    }
    if (!postData.Name || postData.Name === '') {
      alert('项目名称不能为空！')
    } else if (postData.Type === null || postData.Type === undefined) {
      alert('项目类型不能为空！')
    }
    if (state.isModify) {
      postData.Id = editData.Id
    }
    let addProjectReq = state.isModify ? api.project.modifyProject(postData) : api.project.addProject(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectListReq', value: addProjectReq.cancel })
    addProjectReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getUserManage', null, { root: true })
      dispatch('getProjectList')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {})
  },
  deleteProject ({ state, commit, dispatch }, id) {
    let deleteProjectReq = api.project.deleteProject(id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'deleteProjectReq', value: deleteProjectReq.cancel })
    deleteProjectReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getUserManage', null, { root: true })
      dispatch('getProjectList')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {})
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
