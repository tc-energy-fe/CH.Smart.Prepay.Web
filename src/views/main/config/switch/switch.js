import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'
import moment from 'moment'

const STATUS_ENABLED_VALUE = 0
const STATUS_DISABLED_VALUE = 3

const state = {
  reqCancels: new Map(),
  searchNameSwitch: '',
  searchNameRoom: '',
  searchNameTask: '',
  currentPageSwitch: 1,
  switchPageSize: 10,
  currentPageRoom: 1,
  roomPageSize: 10,
  switchList: [],
  roomList: [],
  totalCountSwitch: 1,
  totalCountRoom: 1,
  taskDaysDic: {},
  isLoadingSwitchList: false,
  isLoadingRoomList: false,
  isShowEdit: false,
  isModify: false,
  editData: {
    Name: '',
    Id: null,
    Status: STATUS_ENABLED_VALUE,
    GroupIds: []
  },
  editPeriodList: [
    {
      SwitchParam: true,
      Time: moment(moment().format('YYYY-MM-DD 06:00:00')).toDate(),
      Days: [1, 2, 3, 4, 5, 6, 7]
    }
  ],
  editTreeData: [],
  editTaskDays: [],
  editSearchRoomName: '',
  isLoadingTaskPeriod: false,
  isLoadingEditTree: false
}

const getters = {
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
          Status: STATUS_ENABLED_VALUE,
          GroupIds: []
        }
      })
      commit(types.SET_DATA, {
        item: 'editPeriodList',
        value: [
          {
            SwitchParam: true,
            Time: moment(moment().format('YYYY-MM-DD 06:00:00')).toDate(),
            Days: [1, 2, 3, 4, 5, 6, 7]
          }
        ]
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
      PageSize: state.switchPageSize
    }
    let getSwitchTaskListReq = api.task.getTaskList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingSwitchList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSwitchTaskListReq', value: getSwitchTaskListReq.cancel })
    getSwitchTaskListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(item => {
        item.StatusText = item.Status === STATUS_ENABLED_VALUE ? '启用' : (item.Status === STATUS_DISABLED_VALUE ? '停用' : '其他')
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
      PageSize: state.roomPageSize
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
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEditTree', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGroupListEditReq', value: getGroupListEditReq.cancel })
    getGroupListEditReq.request.then(res => {
      let data = res.Data || []
      let editTreeData = initTree(data, { rootLevel: 1 })
      commit(types.SET_DATA, { item: 'editTreeData', value: editTreeData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEditTree', value: false })
    })
  },
  getTaskPeriodList ({ commit, state, rootState, getters, dispatch }) {
    let params = {
      type: 0
    }
    let getTaskPeriodListReq = api.task.getTaskDic(params)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskPeriod', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getTaskPeriodListReq', value: getTaskPeriodListReq.cancel })
    getTaskPeriodListReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'taskDaysDic', value: data })
      let editTaskDays = Object.entries(data).map(([key, value]) => ({
        label: parseInt(key),
        text: value
      }))
      commit(types.SET_DATA, { item: 'editTaskDays', value: editTaskDays })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskPeriod', value: false })
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
      let periodsList = data.Periods.map(period => (
        Object.assign({}, period, {
          Time: moment(`2020-01-01 ${period.Time}`).toDate()
        })
      ))
      commit(types.SET_DATA, { item: 'editPeriodList', value: periodsList })
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
    if (editData.GroupIds.length === 0) {
      ElAlert('勾选房间列表为空！', '提示').then(() => {})
      return false
    }
    return true
  },
  editTaskData ({ commit, state, rootState, getters, dispatch }) {
    dispatch('validateForm').then(result => {
      if (result) {
        let editData = state.editData
        let postData = {
          ProjectId: rootState.areaId,
          Name: editData.Name,
          Type: 0,
          GroupIds: editData.GroupIds,
          Status: editData.Status,
          Periods: state.editPeriodList.map(item => {
            item.Time = moment(item.Time).format('HH:mm:ss')
            return item
          })
        }
        if (state.isModify) {
          postData.Id = editData.Id
        }
        let editTaskDataReq = state.isModify ? api.task.modifyTask(postData) : api.task.addTask(postData)
        commit(types.ADD_REQUEST_CANCEL, { item: 'editTaskDataReq', value: editTaskDataReq.cancel })
        editTaskDataReq.request.then(res => {
          commit(types.CHECKOUT_SUCCEED, res.State)
          dispatch('getSwitchTaskList')
          dispatch('getRoomList')
          dispatch('showEdit', { isShow: false })
        }).catch(err => {
          commit(types.CHECKOUT_FAILURE, err)
        })
      }
    })
  },
  editTaskStatus ({ commit, state, rootState, getters, dispatch }, { row, status = STATUS_ENABLED_VALUE }) {
    ElConfirm(`确认要${status === STATUS_ENABLED_VALUE ? '启用' : (status === STATUS_DISABLED_VALUE ? '停用' : '停用')}此任务${row.Name}`, '提示').then(() => {
      let postData = {
        Id: row.Id,
        Status: status
      }
      let editTaskStatusReq = api.task.modifyTaskStatus(postData)
      commit(types.ADD_REQUEST_CANCEL, { item: 'editTaskStatusReq', value: editTaskStatusReq.cancel })
      editTaskStatusReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('getSwitchTaskList')
        dispatch('getRoomList')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      })
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
