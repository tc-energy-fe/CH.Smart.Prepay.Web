import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import { taskCode } from '@/utils/staticType'

const SETTING_TYPE_POWER = 2
const SETTING_TYPE_KEEP = 0
const SETTING_TYPE_SWITCH = 1
const TOTAL_OPTION = null

const state = {
  reqCancels: new Map(),
  currentNode: {},
  settingType: SETTING_TYPE_SWITCH,
  settingTypeRadioList: [
    { label: SETTING_TYPE_SWITCH, text: '开合闸设置' },
    { label: SETTING_TYPE_KEEP, text: '保电设置' },
    { label: SETTING_TYPE_POWER, text: '超功率设置', disabled: true }
  ],
  searchNameKeep: '',
  searchKeepType: TOTAL_OPTION,
  searchKeepState: TOTAL_OPTION,
  searchKeepTypeOptions: [
    { label: '全部', value: TOTAL_OPTION },
    { label: '硬件保电', value: true },
    { label: '软件保电', value: false }
  ],
  searchKeepStateOptions: [
    { label: '全部', value: TOTAL_OPTION },
    { label: '保电', value: true },
    { label: '不保电', value: false }
  ],
  searchNameSwitch: '',
  searchSwitchState: TOTAL_OPTION,
  searchSwitchStateOptions: [
    { label: '全部', value: TOTAL_OPTION },
    { label: '断闸', value: false },
    { label: '合闸', value: true }
  ],
  keepList: [],
  switchList: [],
  currentPageKeep: 1,
  pageSizeKeep: 10,
  totalCountKeep: 0,
  currentPageSwitch: 1,
  pageSizeSwitch: 10,
  totalCountSwitch: 0,
  isLoadingSwitchList: false,
  isLoadingKeepList: false,
  dialogVisibleKeep: false,
  dialogVisibleSwitch: false,
  dialogVisibleSwitchBatch: false,
  dialogVisibleSwitchResult: false,
  keepControlSingleDeviceId: null,
  keepControlDeviceIds: [],
  keepControlState: false,
  switchControlSingleDeviceId: null,
  switchControlDeviceIds: [],
  switchControlState: false,
  isControlling: false,
  finishedNumberSwitch: 0,
  taskIdSwitch: null,
  switchControlSelectionDevices: [],
  switchBatchControlResult: []
}

const getters = {
  currentNodeId: (state) => state.currentNode.value,
  settingTypeIsPower: (state) => state.settingType === SETTING_TYPE_POWER,
  settingTypeIsKeep: (state) => state.settingType === SETTING_TYPE_KEEP,
  settingTypeIsSwitch: (state) => state.settingType === SETTING_TYPE_SWITCH,
  finishedPercentSwitch: (state, getters) => {
    let totalNumber = state.switchControlDeviceIds.length
    return totalNumber ? ((state.finishedNumberSwitch / totalNumber) * 100).toFixed(0) : 0
  },
  switchBatchResultNumber: (state, getters) => {
    return {
      successNumber: state.switchBatchControlResult.filter(item => item.ResultState === 0).length,
      failureNumber: state.switchBatchControlResult.filter(item => item.ResultState !== 0).length
    }
  }
}

const actions = {
  ...Actions,
  showDialogKeep ({ commit, state, getters, dispatch }, { isShow, row }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'keepControlSingleDeviceId', value: null })
      commit(types.SET_DATA, { item: 'keepControlState', value: false })
    } else {
      if (row) {
        commit(types.SET_DATA, { item: 'keepControlSingleDeviceId', value: row.DeviceId })
      }
    }
    commit(types.SET_DATA, { item: 'dialogVisibleKeep', value: isShow })
  },
  showDialogSwitch ({ commit, state, getters, dispatch }, { isShow, row }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'switchControlSingleDeviceId', value: null })
      commit(types.SET_DATA, { item: 'switchControlState', value: false })
    } else {
      if (row) {
        commit(types.SET_DATA, { item: 'switchControlSingleDeviceId', value: row.DeviceId })
      }
    }
    commit(types.SET_DATA, { item: 'dialogVisibleSwitch', value: isShow })
  },
  showDialogControlSwitch ({ commit, state, getters, dispatch }, { isShow, taskId }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'finishedNumberSwitch', value: 0 })
      commit(types.SET_DATA, { item: 'taskIdSwitch', value: null })
    } else {
      commit(types.SET_DATA, { item: 'taskIdSwitch', value: taskId })
    }
    commit(types.SET_DATA, { item: 'dialogVisibleSwitchBatch', value: isShow })
  },
  showDialogSwitchResult ({ commit, state, getters, dispatch }, { isShow, result }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'switchBatchControlResult', value: [] })
    } else {
      commit(types.SET_DATA, { item: 'switchBatchControlResult', value: result })
    }
    commit(types.SET_DATA, { item: 'dialogVisibleSwitchResult', value: isShow })
  },
  getDeviceCtrlKeepList ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      Name: state.searchNameKeep,
      DeviceContrlType: SETTING_TYPE_KEEP,
      PageIndex: state.currentPageKeep,
      PageSize: state.pageSizeKeep
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      postData.GroupId = groupId
    }
    if (!(state.searchKeepType === TOTAL_OPTION || isEmpty(state.searchKeepType))) {
      postData.KeepEleType = state.searchKeepType
    }
    if (!(state.searchKeepState === TOTAL_OPTION || isEmpty(state.searchKeepState))) {
      postData.KeepState = state.searchKeepState
    }
    let getDeviceCtrlKeepListReq = api.deviceCtrl.postDeviceCtrlList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingKeepList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getDeviceCtrlKeepListReq', value: getDeviceCtrlKeepListReq.cancel })
    getDeviceCtrlKeepListReq.request.then(res => {
      let data = res.Data || []
      let keepList = data.map(item => {
        return Object.assign({}, item, {
          KeepEleTypeText: isEmpty(item.KeepEleType) ? '--' : state.searchKeepTypeOptions.find(option => option.value === item.KeepEleType).label,
          KeepStateText: isEmpty(item.KeepState) ? '--' : state.searchKeepStateOptions.find(option => option.value === item.KeepState).label
        })
      })
      commit(types.SET_DATA, { item: 'keepList', value: keepList })
      commit(types.SET_DATA, { item: 'totalCountKeep', value: res.Count || 0 })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingKeepList', value: false })
    })
  },
  getDeviceCtrlSwitchList ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      Name: state.searchNameSwitch,
      DeviceContrlType: SETTING_TYPE_SWITCH,
      PageIndex: state.currentPageSwitch,
      PageSize: state.pageSizeSwitch
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      postData.GroupId = groupId
    }
    if (!(state.searchSwitchState === TOTAL_OPTION || isEmpty(state.searchSwitchState))) {
      postData.IsOn = state.searchSwitchState
    }
    let getDeviceCtrlSwitchListReq = api.deviceCtrl.postDeviceCtrlList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingSwitchList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getDeviceCtrlSwitchListReq', value: getDeviceCtrlSwitchListReq.cancel })
    getDeviceCtrlSwitchListReq.request.then(res => {
      let data = res.Data || []
      let switchList = data.map(item => {
        return Object.assign({}, item, {
          SwitchStateText: isEmpty(item.SwitchState) ? '未知' : state.searchSwitchStateOptions.find(option => option.value === item.SwitchState).label
        })
      })
      commit(types.SET_DATA, { item: 'switchList', value: switchList })
      commit(types.SET_DATA, { item: 'totalCountSwitch', value: res.Count || 0 })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingSwitchList', value: false })
    })
  },
  controlDeviceKeep ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let singleDeviceIdKeep = state.keepControlSingleDeviceId
    let postData = {
      DeviceIds: isEmpty(singleDeviceIdKeep) ? state.keepControlDeviceIds : [singleDeviceIdKeep],
      Param: state.keepControlState,
      Type: SETTING_TYPE_KEEP
    }
    let controlDeviceKeepReq = api.deviceCtrl.postDeviceCtrlSoftware(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'controlDeviceKeepReq', value: controlDeviceKeepReq.cancel })
    controlDeviceKeepReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getDeviceCtrlKeepList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      dispatch('showDialogKeep', { isShow: false })
    })
  },
  controlDeviceSwitch ({ commit, state, getters, rootState, rootGetters, dispatch }, { row }) {
    let singleDeviceIdSwitch = state.switchControlSingleDeviceId
    let postData = {
      DeviceIds: isEmpty(singleDeviceIdSwitch) ? (row ? [row.DeviceId] : state.switchControlDeviceIds) : [singleDeviceIdSwitch],
      Param: isEmpty(singleDeviceIdSwitch) ? (row ? !row.SwitchState : state.switchControlState) : state.switchControlState,
      Type: SETTING_TYPE_SWITCH
    }
    let controlDeviceSwitchReq = api.deviceCtrl.postDeviceCtrlHardware(postData)
    commit(types.SET_DATA, { item: 'isControlling', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'controlDeviceSwitchReq', value: controlDeviceSwitchReq.cancel })
    controlDeviceSwitchReq.request.then(res => {
      let data = res.Data || {}
      if (res.State === 0) {
        let isBatch = isEmpty(singleDeviceIdSwitch) && isEmpty(row)
        dispatch('showDialogControlSwitch', { isShow: true, taskId: data.Id })
        dispatch('handleSwitchTaskInfo', { resData: data, isBatch: isBatch })
      }
    }).catch(err => {
      commit(types.SET_DATA, { item: 'isControlling', value: false })
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      dispatch('showDialogSwitch', { isShow: false })
    })
  },
  getDeviceControlWait ({ commit, state, getters, rootState, rootGetters, dispatch }, { id, tracking = true, isBatch }) {
    let params = {
      id,
      tracking
    }
    let getDeviceControlWaitReq = api.deviceCtrl.getDeviceCtrlWait(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getDeviceControlWaitReq', value: getDeviceControlWaitReq.cancel })
    getDeviceControlWaitReq.request.then(res => {
      let data = res.Data || {}
      if (res.State === 0) {
        dispatch('handleSwitchTaskInfo', { resData: data, isBatch: isBatch })
      }
    }).catch(err => {
      commit(types.SET_DATA, { item: 'isControlling', value: false })
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
    })
  },
  handleSwitchTaskInfo ({ commit, state, getters, rootState, rootGetters, dispatch }, { resData, isBatch }) {
    if (resData.State !== 0) {
      // 任务执行结束
      commit(types.SET_DATA, { item: 'isControlling', value: false })
      if (resData.State === 1) {
        if (resData.Data.State === 0) {
          let devicesObject = resData.Data.Data
          let selectionDevices = state.switchControlSelectionDevices
          let deviceList = Object.entries(devicesObject).map(([key, value]) => {
            let DeviceId = parseInt(key)
            let ResultState = value.State
            if (value.State === 0) {
              ResultState = value['Ctl.SWITCH'].State
            } else {
              ResultState = value.State
            }
            let extraSwitchInfo = {
              Id: DeviceId,
              ResultState,
              ControlResult: taskCode[ResultState]
            }
            if (isBatch) {
              let deviceInfo = selectionDevices.find(item => item.DeviceId === DeviceId)
              Object.assign(extraSwitchInfo, {
                DeviceSN: deviceInfo.DeviceSN,
                RoomFullName: deviceInfo.RoomFullName
              })
            }
            return Object.assign({}, value, extraSwitchInfo)
          })
          commit(types.SET_DATA, { item: 'finishedNumberSwitch', value: deviceList.length })
          if (isBatch) {
            dispatch('showDialogSwitchResult', { isShow: true, result: deviceList })
          } else {
            ElAlert(deviceList[0].ControlResult, '提示').then(() => {})
          }
          dispatch('getDeviceCtrlSwitchList')
        } else {
          ElAlert(taskCode[resData.Data.State], '提示').then(() => {})
        }
        dispatch('showDialogControlSwitch', { isShow: false })
      } else if (resData.State === 2) {
        ElAlert('任务失败', '提示').then(() => {})
      } else if (resData.State === 3) {
        ElAlert('任务超时', '提示').then(() => {})
      } else if (resData.State === 4) {
        ElAlert('任务取消', '提示').then(() => {})
      } else if (resData.State === 5) {
        ElAlert('任务未找到', '提示').then(() => {})
      }
    } else {
      // 任务执行中继续查询
      if (resData.Data) {
        if (resData.Data.State === 0) {
          if (resData.Data.Data) {
            let devicesObject = resData.Data.Data
            let deviceList = Object.entries(devicesObject).map(([key, value]) => {
              return Object.assign({}, value, {
                Id: parseInt(key)
              })
            })
            commit(types.SET_DATA, { item: 'finishedNumberSwitch', value: deviceList.length })
          }
        }
      }
      dispatch('getDeviceControlWait', { id: resData.Id, isBatch })
    }
  },
  cancelDeviceControlTask ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let taskId = state.taskIdSwitch
    let cancelDeviceControlTaskReq = api.deviceCtrl.deleteDeviceCtrlCancel(taskId)
    commit(types.ADD_REQUEST_CANCEL, { item: 'cancelDeviceControlTaskReq', value: cancelDeviceControlTaskReq.cancel })
    cancelDeviceControlTaskReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      dispatch('showDialogControlSwitch', { isShow: false })
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
