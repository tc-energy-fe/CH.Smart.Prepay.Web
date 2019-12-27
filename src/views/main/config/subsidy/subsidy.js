import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'

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
  ]
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
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
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
