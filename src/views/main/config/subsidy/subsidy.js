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
  editData: {},
  pricePeriods: [{
    Monney: null,
    Days_1: [],
    Days_2: [],
    Days_3: []
  }],
  editRoomTree: [],
  isLoadingEditRoomList: false,
  isLoadingTaskDetail: false,
  isLoadingTaskDic: false,
  editDic: []
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
    commit(types.SET_DATA,
      {
        item: 'editData',
        value: {
          Id: null,
          Name: '',
          SubType: 1,
          IsClear: true,
          Status: 0,
          GroupIds: []
        }
      })
    commit(types.SET_DATA,
      {
        item: 'pricePeriods',
        value: [{
          Monney: null,
          Days_1: [],
          Days_2: [],
          Days_3: []
        }]
      })
    commit(types.SET_DATA, { item: 'springTerm', value: { Type: 1, StartMonth: null, EndMonth: null } })
    commit(types.SET_DATA, { item: 'autumnTerm', value: { Type: 2, StartMonth: null, EndMonth: null } })
    if (row) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      dispatch('getEditRoomList', row.Id)
      dispatch('getTaskDetail', row.Id)
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
      dispatch('getTaskDic')
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
  getTaskDic ({ state, getters, commit }) {
    let getTaskDicReq = api.task.getTaskDic({
      type: 1,
      subType: state.editData.SubType
    })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskDic', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getTaskDicReq', value: getTaskDicReq.cancel })
    getTaskDicReq.request.then(res => {
      let data = res.Data || []
      let list = Object.entries(data).map(item => ({
        value: Number(item[0]),
        name: item[1]
      })).sort((a, b) => a.value - b.value)
      commit(types.SET_DATA, { item: 'editDic', value: list })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskDic', value: false })
    })
  },
  getTaskDetail ({ state, rootState, commit, dispatch }, id) {
    let getTaskDetailReq = api.task.getTaskDetail(id)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskDetail', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getTaskDetailReq', value: getTaskDetailReq.cancel })
    getTaskDetailReq.request.then(res => {
      let data = res.Data || []
      let editData = {}
      let pricePeriods = []
      Object.keys(state.editData).forEach(item => {
        editData[item] = data[item]
      })
      pricePeriods = data.Periods.map(p => {
        let period = {
          Monney: p.Monney,
          Days_1: [],
          Days_2: [],
          Days_3: []
        }
        period[`Days_${data.SubType}`] = p.Days
        return period
      })
      commit(types.SET_DATA, { item: 'editData', value: editData })
      commit(types.SET_DATA, { item: 'pricePeriods', value: pricePeriods })
      if (data.SubType === 3) {
        commit(types.SET_DATA, { item: 'springTerm', value: data.Semesters[0] })
        commit(types.SET_DATA, { item: 'autumnTerm', value: data.Semesters[1] })
      }
      dispatch('getTaskDic')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskDetail', value: false })
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
  },
  addPricePeriod ({ commit }) {
    commit('ADD_PRICE_PERIOD')
  },
  deletePricePeriod ({ commit }, index) {
    commit('DELETE_PRICE_PERIOD', index)
  },
  validateData ({ state, rootState }) {
    let editData = state.editData
    let periods = []
    let subType = editData.SubType
    let springTerm = state.springTerm
    let autumnTerm = state.autumnTerm
    let postData = {
      ProjectId: rootState.areaId,
      Type: 1,
      Name: editData.Name,
      GroupIds: editData.GroupIds,
      Status: editData.Status,
      SubType: subType,
      IsClear: editData.IsClear
    }
    if (isEmpty(postData.Name) || postData.Name === '') {
      ElAlert('请填写 方案名称！', '提示')
      return null
    }
    if (subType === 3) {
      if (isEmpty(springTerm.StartMonth) || isEmpty(springTerm.EndMonth)) {
        ElAlert('请选择 春季学期', '提示')
        return null
      }
      if (isEmpty(autumnTerm.StartMonth) || isEmpty(autumnTerm.EndMonth)) {
        ElAlert('请选择 秋季学期！', '提示')
        return null
      }
      postData.Semesters = [springTerm, autumnTerm]
    }
    // 验证补助金额时段
    let periodValid = state.pricePeriods.some((p, index) => {
      let period = {
        Monney: p.Monney,
        Days: p[`Days_${subType}`]
      }
      if (isEmpty(period.Days) || !period.Days.length) {
        ElAlert(`请选择 补助金额：时段${index + 1} - 时段！`, '提示')
        return true
      }
      if (isEmpty(period.Monney) || period.Monney === '') {
        ElAlert(`请填写 补助金额：时段${index + 1} - 金额！`, '提示')
        return true
      }
      periods.push(period)
      return false
    })
    if (periodValid) {
      return null
    }
    if (isEmpty(postData.GroupIds) || !postData.GroupIds.length) {
      ElAlert('请选择 执行房间！', '提示')
      return null
    }
    if (state.isModify) {
      postData.Id = editData.Id
    }
    postData.periods = periods
    return postData
  },
  editSubsidy ({ state, rootState, getters, commit, dispatch }) {
    dispatch('validateData').then(postData => {
      if (!postData) return
      console.log(postData)
      let editSubsidyReq = state.isModify ? api.task.modifyTask(postData) : api.task.addTask(postData)
      commit(types.SET_LOADING_STATUS, { item: 'isEditingSubsidy', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'editSubsidyReq', value: editSubsidyReq.cancel })
      editSubsidyReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        commit(types.SET_DATA, { item: 'currentPageTask', value: 1 })
        commit(types.SET_DATA, { item: 'currentPageRoom', value: 1 })
        dispatch('getTaskList')
        dispatch('getRoomList')
        dispatch('showEdit', { isShow: false })
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isEditingSubsidy', value: false })
      })
    })
  },
  modifySubsidyStatus ({ state, getters, commit, dispatch }, { row, status }) {
    ElConfirm(`是否${status === 0 ? '启用' : '停用'}方案 ${row.Name} ？`).then(res => {
      let postData = {
        Id: row.Id,
        Status: status
      }
      let modifySubsidyStatusReq = api.task.modifyTaskStatus(postData)
      commit(types.SET_LOADING_STATUS, { item: 'isModingSubsidyStatus', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'modifySubsidyStatusReq', value: modifySubsidyStatusReq.cancel })
      modifySubsidyStatusReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        commit(types.SET_DATA, { item: 'currentPageTask', value: 1 })
        commit(types.SET_DATA, { item: 'currentPageRoom', value: 1 })
        dispatch('getTaskList')
        dispatch('getRoomList')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isModingSubsidyStatus', value: false })
      })
    })
  }
}

const mutations = {
  ...Mutations,
  UPDATE_PRICE_CONTENT (state, { index, key, value }) {
    state.pricePeriods[index][key] = value
  },
  ADD_PRICE_PERIOD (state) {
    state.pricePeriods.push({
      Monney: null,
      Days_1: [],
      Days_2: [],
      Days_3: []
    })
  },
  DELETE_PRICE_PERIOD (state, index) {
    state.pricePeriods.splice(index, 1)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
