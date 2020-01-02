import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'
import moment from 'moment'

const OFF_IMMEDIATE = 0
const OFF_DELAY = 1

const state = {
  reqCancels: new Map(),
  searchNameSwitch: '',
  searchNameRoom: '',
  searchNameTask: '',
  currentPageSwitch: 1,
  currentPageRoom: 1,
  pageSize: 5,
  switchList: [],
  roomList: [],
  totalCountSwitch: 1,
  totalCountRoom: 1,
  isLoadingSwitchList: false,
  isLoadingRoomList: false,
  isShowEdit: false,
  isModify: false,
  offTypeText: {
    [OFF_IMMEDIATE]: '立即拉闸',
    [OFF_DELAY]: '延时拉闸'
  },
  editData: {
    Name: '',
    Id: null,
    Status: 0,
    GroupIds: [],
    WarnValue: '',
    SNS: false,
    OffType: 0,
    OffRange: [new Date(), new Date()]
  },
  editTreeData: [],
  editSearchRoomName: ''
}

const getters = {
  offTypeList: (state, getters) => (Object.entries(state.offTypeText).map(([id, text]) => ({
    label: text,
    value: parseInt(id)
  }))),
  offTypeIsDelay: (state, getters) => {
    return state.editData.OffType === OFF_DELAY
  }
}

const actions = {
  ...Actions,
  showEdit ({ commit, state, getters, dispatch }, { isShow = true, row } = { isShow: true }) {
    if (!isShow) {
      commit(types.SET_DATA, {
        item: 'editData',
        value: {
          Name: '',
          Id: null,
          Status: 0,
          GroupIds: [],
          WarnValue: '',
          SNS: false,
          OffType: 0,
          OffRange: [new Date(), new Date()]
        }
      })
      commit(types.SET_DATA, { item: 'editSearchRoomName', value: '' })
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
        dispatch('getGroupListEdit', row.Id)
        dispatch('getSingleTask', row.Id)
      } else {
        // 添加模式
        commit(types.SET_DATA, { item: 'isModify', value: false })
        dispatch('getGroupListEdit')
      }
    }
    commit(types.SET_DATA, { item: 'isShowEdit', value: isShow })
  },
  getSwitchTaskList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      TaskType: 0,
      Name: state.searchNameSwitch,
      PageIndex: state.currentPageSwitch,
      PageSize: state.pageSize
    }
    let getSwitchTaskListReq = api.task.getTaskList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingSwitchList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSwitchTaskListReq', value: getSwitchTaskListReq.cancel })
    getSwitchTaskListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(item => {
        item.StatusText = item.Status === 0 ? '启用' : (item.Status === 3 ? '停用' : '其他')
        item.ContentText = ''
      })
      commit(types.SET_DATA, { item: 'switchList', value: data })
      commit(types.SET_DATA, { item: 'totalCountSwitch', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingSwitchList', value: false })
    })
  },
  getRoomList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      RoomNo: state.searchNameRoom,
      Name: state.searchNameTask,
      TaskType: 0,
      PageIndex: state.currentPageRoom,
      PageSize: state.pageSize
    }
    let getRoomSchemeListReq = api.task.getRoomTaskList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomSchemeListReq', value: getRoomSchemeListReq.cancel })
    getRoomSchemeListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'roomList', value: data })
      commit(types.SET_DATA, { item: 'totalCountRoom', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: false })
    })
  },
  getGroupListEdit ({ commit, state, rootState, getters, dispatch }, configId = null) {
    let params = {
      projectId: rootState.areaId,
      taskType: 0
    }
    if (!isEmpty(configId)) {
      params.configId = configId
    }
    let getGroupListEditReq = !isEmpty(configId) ? api.group.getRoomConfigEditList(params) : api.group.getRoomConfigAddList(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGroupListEditReq', value: getGroupListEditReq.cancel })
    getGroupListEditReq.request.then(res => {
      let data = res.Data || []
      let editTreeData = initTree(data, { rootLevel: 1 })
      commit(types.SET_DATA, { item: 'editTreeData', value: editTreeData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getSingleTask ({ commit, state, rootState, getters, dispatch }, id) {
    let getSingleTaskReq = api.task.getTaskDetail(id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSingleTaskReq', value: getSingleTaskReq.cancel })
    getSingleTaskReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, {
        item: 'editData',
        value: {
          Name: data.Name,
          Id: data.Id,
          Status: data.Status,
          GroupIds: data.GroupIds
        }
      })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  validateForm ({ commit, state, rootState, getters, dispatch }) {
    let editData = state.editData
    if (editData.Name.trim() === '') {
      ElAlert('方案名称为空！', '提示').then(() => {})
      return false
    }
    return true
  },
  editSchemeData ({ commit, state, rootState, getters, dispatch }) {
    dispatch('validateForm').then(result => {
      if (result) {
        let editData = state.editData
        let postData = {
          ProjectId: rootState.areaId,
          Name: editData.Name,
          SchemeType: 1,
          GroupIds: editData.GroupIds,
          Status: editData.Status,
          BalanceContent: {
            WarnValue: editData.WarnValue,
            SNS: editData.SNS,
            OffType: editData.OffType
          }
        }
        if (editData.OffType === OFF_DELAY) {
          postData.BalanceContent = Object.assign({}, postData.BalanceContent, {
            OffRangeStart: moment(editData.OffRange[0]).format('HH:mm'),
            OffRangeEnd: moment(editData.OffRange[1]).format('HH:mm')
          })
        }
        if (state.isModify) {
          postData.Id = editData.Id
        }
        let editSchemeDataReq = state.isModify ? api.task.modifyTask(postData) : api.task.addTask(postData)
        commit(types.ADD_REQUEST_CANCEL, { item: 'editSchemeDataReq', value: editSchemeDataReq.cancel })
        editSchemeDataReq.request.then(res => {
          commit(types.CHECKOUT_SUCCEED, res.State)
          dispatch('getSwitchTaskList')
          dispatch('getRoomList')
          dispatch('showEdit', { isShow: false })
        }).catch(err => {
          commit(types.CHECKOUT_FAILURE, err)
        })
      }
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
