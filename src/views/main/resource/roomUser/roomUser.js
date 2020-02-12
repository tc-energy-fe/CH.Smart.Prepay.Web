import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  stateList: [
    { value: -1, label: '全部' },
    { value: true, label: '已开户' },
    { value: false, label: '未开户' }
  ],
  searchStateId: null,
  currentPage: 1,
  pageSize: 10,
  roomList: [],
  editData: {
    Id: null,
    HostName: '',
    HostPhone: '',
    FullName: ''
  },
  searchData: {
    Name: '',
    RoomNo: ''
  },
  totalCount: 0,
  isShowEdit: false,
  isAddAccount: false,
  isLoadingRoomAccountList: false,
  shareList: [],
  isLoadingShareList: false
}

const getters = {
  mainGroupList: (state, getters, rootState) => rootState.mainGroupList,
  groupTree: (state, getters, rootState) => rootState.mainGroupTreeHasRoot,
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId,
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  showEdit ({ state, commit, dispatch }, { isShow, row }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    commit(types.SET_DATA, {
      item: 'editData',
      value: {
        Id: null,
        FullName: '',
        HostName: '',
        HostPhone: '',
        ShareNum: 0
      }
    })
    if (row) {
      commit(types.SET_DATA, { item: 'isAddAccount', value: !row.AccountState })
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: row[k] })
      })
    } else {
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getRoomAccountList ({ state, getters, commit, dispatch }) {
    let groupId = getters.currentNodeId
    let accountState = state.searchStateId
    let postData = Object.assign({
      ProjectId: getters.projectId,
      PageIndex: state.currentPage,
      PageSize: state.pageSize
    }, state.searchData)
    if (!isEmpty(groupId) && groupId !== getters.projectId) postData.GroupId = groupId
    if (!isEmpty(accountState) && accountState !== -1) postData.AccountState = accountState
    let getRoomAccountListReq = api.group.getRoomAccountList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomAccountList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomAccountListReq', value: getRoomAccountListReq.cancel })
    getRoomAccountListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(room => {
        room.StateText = state.stateList.find(s => s.value === room.AccountState).label
      })
      commit(types.SET_DATA, { item: 'roomList', value: data })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomAccountList', value: false })
    })
  },
  editAccount ({ state, getters, commit, dispatch }) {
    let isAddAccount = state.isAddAccount
    let editData = state.editData
    let postData = {
      Id: editData.Id
    }
    if (isAddAccount) {
      postData.HostName = editData.HostName
      postData.HostPhone = editData.HostPhone
      if (isEmpty(editData.HostName) || editData.HostName.trim() === '') {
        ElAlert('请填写开户人名称！', '提示').then()
        return
      }
      if (isEmpty(editData.HostPhone)) {
        ElAlert('请填写开户人手机号！', '提示').then()
        return
      } else if (!(/^1[345789]\d{9}$/gi.test(editData.HostPhone))) {
        ElAlert('开户人手机号不正确！', '提示').then()
        return
      }
    }
    console.log(postData)

    commit(types.SET_LOADING_STATUS, { item: 'isEditingAccount', value: true })
    if (!isAddAccount) {
      ElConfirm('是否确认销户？', '提示').then(res => {
        let editAccountReq = api.group.deleteRoomAccount(postData)
        commit(types.ADD_REQUEST_CANCEL, { item: 'editAccountReq', value: editAccountReq.cancel })
        editAccountReq.request.then(res => {
          commit(types.CHECKOUT_SUCCEED, res.State)
          dispatch('showEdit', { isShow: false })
          dispatch('getRoomAccountList')
        }).catch(err => {
          commit(types.CHECKOUT_FAILURE, err)
        }).finally(() => {
          commit(types.SET_LOADING_STATUS, { item: 'isEditingAccount', value: false })
        })
      })
    } else {
      let editAccountReq = api.group.addRoomAccount(postData)
      commit(types.ADD_REQUEST_CANCEL, { item: 'editAccountReq', value: editAccountReq.cancel })
      editAccountReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('showEdit', { isShow: false })
        dispatch('getRoomAccountList')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isEditingAccount', value: false })
      })
    }
  },
  getShareList ({ state, getters, commit }, roomId) {
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingShareList', value: true })
    let getShareListReq = api.group.getRoomShareList(roomId)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getShareListReq', value: getShareListReq.cancel })
    getShareListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'shareList', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingShareList', value: false })
    })
  },
  shareOnHide ({ state, commit }) {
    let getShareListReq = state.reqCancels.get('getShareListReq')
    if (getShareListReq) {
      getShareListReq()
    }
    commit(types.SET_DATA, { item: 'shareList', value: [] })
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
