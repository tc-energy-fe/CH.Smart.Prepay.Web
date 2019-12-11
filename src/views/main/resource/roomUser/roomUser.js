import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'
// import moment from 'moment'

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
    FullName: ''
  },
  searchData: {
    Name: '',
    RoomNo: ''
  },
  totalCount: 0,
  isShowEdit: false,
  isAddAccount: false
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
      console.error(err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomAccountList', value: false })
    })
  },
  editAccountState () {}
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