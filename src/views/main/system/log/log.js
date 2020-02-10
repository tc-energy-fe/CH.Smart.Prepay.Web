import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import moment from 'moment'

const TOTAL_OPTION_VALUE = 'total'

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchOperateId: null,
  searchOperateTypeList: [
    { label: '全部操作类型', value: TOTAL_OPTION_VALUE }
  ],
  searchDateRange: [new Date(), new Date()],
  logList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isLoadingLogList: false
}

const getters = {
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
      let initType = { label: '全部操作类型', value: TOTAL_OPTION_VALUE }
      let searchOperateTypeList = [initType, ...operateTypeList]
      commit(types.SET_DATA, { item: 'searchOperateTypeList', value: searchOperateTypeList })
      commit(types.SET_DATA, { item: 'searchOperateId', value: searchOperateTypeList[0].value })
      // dispatch('getLogListData')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getLogListData ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      OperatorName: state.searchName,
      Start: state.searchDateRange[0],
      End: state.searchDateRange[1],
      OperateType: state.searchOperateId,
      PageSize: state.pageSize,
      PageIndex: state.currentPage
    }
    if (state.searchOperateId === TOTAL_OPTION_VALUE) {
      delete postData.OperateType
    }
    let getLogListDataReq = api.log.postLogManage(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getLogListDataReq', value: getLogListDataReq.cancel })
    getLogListDataReq.request.then(res => {
      let data = res.Data || []
      let searchOperateTypeList = state.searchOperateTypeList
      let logList = data.map(item => {
        return Object.assign({}, item, {
          OTypeText: searchOperateTypeList.find(type => (type.value === item.OType)).label,
          TimeText: moment(item.Time).format('YYYY-MM-DD HH:mm:ss')
        })
      })
      commit(types.SET_DATA, { item: 'logList', value: logList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
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
