import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import moment from 'moment'
import { taskCode } from '@/utils/staticType'

const TOTAL_OPTION_VALUE = 'total'
const LOG_TYPE_OPERATION = 0
const LOG_TYPE_RUN = 1

const state = {
  reqCancels: new Map(),
  logType: LOG_TYPE_OPERATION,
  searchOperator: '',
  searchOperateId: null,
  searchOperateTypeList: [],
  searchDateRangeOperate: [new Date(), new Date()],
  searchTaskName: '',
  searchTaskType: null,
  searchTaskTypeList: [],
  searchDateRangeTask: [new Date(), new Date()],
  searchTaskResult: null,
  searchTaskResultList: [
    { label: '成功', value: true },
    { label: '失败', value: false }
  ],
  operateLogList: [],
  currentPageOperate: 1,
  pageSizeOperate: 10,
  totalCountOperate: 0,
  isLoadingOperateLogList: false,
  taskLogList: [],
  currentPageTask: 1,
  pageSizeTask: 10,
  totalCountTask: 0,
  isLoadingTaskLogList: false
}

const getters = {
  logTypeIsOperation: (state) => state.logType === LOG_TYPE_OPERATION,
  logTypeIsRun: (state) => state.logType === LOG_TYPE_RUN
}

const actions = {
  ...Actions,
  getLogOperateType ({ commit, state, getters, dispatch }) {
    let getLogOperateTypeReq = api.log.getLogManageType()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getLogOperateTypeReq', value: getLogOperateTypeReq.cancel })
    getLogOperateTypeReq.request.then(res => {
      let data = res.Data || {}
      let operateTypeList = Object.entries(data).map(([key, value]) => {
        return {
          label: value,
          value: parseInt(key)
        }
      })
      let searchOperateTypeList = [...operateTypeList]
      commit(types.SET_DATA, { item: 'searchOperateTypeList', value: searchOperateTypeList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getLogTaskType ({ commit, state, getters, dispatch }) {
    let getLogTaskTypeReq = api.log.getLogManageTaskType()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getLogTaskTypeReq', value: getLogTaskTypeReq.cancel })
    getLogTaskTypeReq.request.then(res => {
      let data = res.Data || {}
      let taskTypeList = Object.entries(data).map(([key, value]) => {
        return {
          label: value,
          value: parseInt(key)
        }
      })
      commit(types.SET_DATA, { item: 'searchTaskTypeList', value: taskTypeList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getOperateLogList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      LogType: state.logType,
      OperatorName: state.searchOperator,
      Start: moment(state.searchDateRangeOperate[0]).format('YYYY-MM-DD'),
      End: moment(state.searchDateRangeOperate[1]).format('YYYY-MM-DD'),
      OperateType: state.searchOperateId,
      PageSize: state.pageSizeOperate,
      PageIndex: state.currentPageOperate
    }
    if (state.searchOperateId === TOTAL_OPTION_VALUE || isEmpty(state.searchOperateId)) {
      delete postData.OperateType
    }
    let getOperateLogListReq = api.log.postLogManage(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getOperateLogListReq', value: getOperateLogListReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingOperateLogList', value: true })
    getOperateLogListReq.request.then(res => {
      let data = res.Data || []
      let searchOperateTypeList = state.searchOperateTypeList
      let operateLogList = data.map(item => {
        return Object.assign({}, item, {
          OTypeText: searchOperateTypeList.find(type => (type.value === item.OType)).label,
          TimeText: moment(item.Time).format('YYYY-MM-DD HH:mm')
        })
      })
      commit(types.SET_DATA, { item: 'operateLogList', value: operateLogList })
      commit(types.SET_DATA, { item: 'totalCountOperate', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingOperateLogList', value: false })
    })
  },
  getTaskLogList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      LogType: state.logType,
      OperatorObj: state.searchTaskName,
      Start: moment(state.searchDateRangeTask[0]).format('YYYY-MM-DD'),
      End: moment(state.searchDateRangeTask[1]).format('YYYY-MM-DD'),
      OperateType: state.searchTaskType,
      IsSuccess: state.searchTaskResult,
      PageSize: state.pageSizeTask,
      PageIndex: state.currentPageTask
    }
    if (state.searchTaskType === TOTAL_OPTION_VALUE || isEmpty(state.searchTaskType)) {
      delete postData.OperateType
    }
    if (state.searchTaskResult === TOTAL_OPTION_VALUE || isEmpty(state.searchTaskResult)) {
      delete postData.IsSuccess
    }
    let getTaskLogListReq = api.log.postLogManage(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getTaskLogListReq', value: getTaskLogListReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskLogList', value: true })
    getTaskLogListReq.request.then(res => {
      let data = res.Data || []
      let searchTaskTypeList = state.searchTaskTypeList
      let taskLogList = data.map(item => {
        return Object.assign({}, item, {
          OTypeText: searchTaskTypeList.find(type => (type.value === item.OType)).label,
          TimeText: moment(item.Time).format('YYYY-MM-DD HH:mm'),
          ControlResultText: taskCode[item.ControlResult]
        })
      })
      commit(types.SET_DATA, { item: 'taskLogList', value: taskLogList })
      commit(types.SET_DATA, { item: 'totalCountTask', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingTaskLogList', value: false })
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
