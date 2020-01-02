import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'

const state = {
  reqCancels: new Map(),
  searchTaskName: '',
  currentPageTask: 1,
  pageSize: 5,
  taskList: [],
  totalCountTask: 0,
  isLoadingTaskList: false,
  searchNameRoom: '',
  searchTaskType: '',
  roomList: [],
  totalCountRoom: 0,
  currentPageRoom: 1,
  isLoadingRoomList: false,
  isShowEdit: false,
  isModify: false,
  springTerm: {
    Type: 1,
    StartMonth: null,
    EndMonth: null
  },
  autumnTerm: {
    Type: 2,
    StartMonth: null,
    EndMonth: null
  },
  subType: [
    { value: 1, label: '按月' },
    { value: 2, label: '按季度' },
    { value: 3, label: '按学期' }
  ],
  editData: {
    Id: null,
    Name: '',
    SubType: 1,
    IsClear: true,
    Status: 0
  },
  pricePeriods: [{
    Monney: null,
    Days: []
  }],
  editRoomTree: [],
  isLoadingEditRoomList: false
}

const getters = {
}

const actions = {
  ...Actions,
  showEdit ({ state, commit, dispatch }, { isShow, row }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    if (row) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      dispatch('getEditRoomList', row.Id)
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
      dispatch('getEditRoomList')
    }
    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getTaskList ({ state, rootState, commit }) {
    let params = {
      projectId: rootState.areaId,
      name: state.searchTaskName,
      type: 1,
      PageIndex: state.currentPageTask,
      PageSize: state.pageSize
    }
    let getTaskListReq = api.task.getTaskList(params)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getTaskListReq', value: getTaskListReq.cancel })
    getTaskListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(d => {
        d.SubTypeText = state.subType.find(t => t.value === d.SubType).label
        d.StatusText = d.Status === 0 ? '启用' : '停用'
        d.IsClearText = d.IsClear ? '是' : '否'
      })
      commit(types.SET_DATA, { item: 'taskList', value: data })
      commit(types.SET_DATA, { item: 'totalCountTask', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskList', value: false })
    })
  },
  getRoomList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      RoomNo: state.searchNameRoom,
      Name: state.searchTaskType,
      TaskType: 1,
      PageIndex: state.currentPageRoom,
      PageSize: state.pageSize
    }
    let getRoomTaskListReq = api.task.getRoomTaskList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomTaskListReq', value: getRoomTaskListReq.cancel })
    getRoomTaskListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'roomList', value: data })
      commit(types.SET_DATA, { item: 'totalCountRoom', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: false })
    })
  },
  getEditRoomList ({ state, rootState, getters, commit }, id) {
    let params = {
      projectId: rootState.areaId,
      taskType: 1
    }
    if (state.isModify) params.configId = id

    let getEditRoomListReq = state.isModify ? api.group.getRoomConfigEditList(params) : api.group.getRoomConfigAddList(params)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEditRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEditRoomListReq', value: getEditRoomListReq.cancel })
    getEditRoomListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'editRoomTree', value: initTree(data, { rootLevel: 1 }) })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEditRoomList', value: false })
    })
  },
  editPricePeriodDataOnChange ({ commit }, params) {
    commit('UPDATE_PRICE_CONTENT', params)
  }
}

const mutations = {
  ...Mutations,
  UPDATE_PRICE_CONTENT (state, { index, key, value }) {
    state.pricePeriods[index][key] = value
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
