import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import moment from 'moment'

const TOTAL_OPTION = null

const state = {
  reqCancels: new Map(),
  currentNode: {},
  searchName: '',
  searchEMeterState: TOTAL_OPTION,
  searchFrozenState: TOTAL_OPTION,
  searchEMeterStateOptions: [
    { label: '全部', value: TOTAL_OPTION },
    { label: '合闸', value: true },
    { label: '断闸/开闸', value: false }
  ],
  searchFrozenStateOptions: [
    { label: '全部', value: TOTAL_OPTION },
    { label: '正常', value: true },
    { label: '异常', value: false }
  ],
  emeterList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isLoadingEMeterList: false,
  emeterStaticData: {
    Total: 0,
    ON: 0,
    OFF: 0,
    FrozenException: 0
  }
}

const getters = {
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  getEMeterStatusList ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      Name: state.searchName,
      PageIndex: state.currentPageKeep,
      PageSize: state.pageSizeKeep
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      postData.GroupId = groupId
    }
    if (!(state.searchEMeterState === TOTAL_OPTION || isEmpty(state.searchEMeterState))) {
      postData.IsOn = state.searchEMeterState
    }
    if (!(state.searchFrozenState === TOTAL_OPTION || isEmpty(state.searchFrozenState))) {
      postData.FrozenState = state.searchFrozenState
    }
    let getEMeterStatusListReq = api.status.postStatusEMeter(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEMeterList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEMeterStatusListReq', value: getEMeterStatusListReq.cancel })
    getEMeterStatusListReq.request.then(res => {
      let data = res.Data || []
      let emeterList = data.map(item => {
        return Object.assign({}, item, {
          EMeterStateText: isEmpty(item.SwitchState) ? '未知' : (item.SwitchState ? '合闸' : '开闸'),
          KeepStateText: isEmpty(item.KeepState) ? '未知' : (item.KeepState ? '保电' : '未保电'),
          FrozenStateText: isEmpty(item.FrozenState) ? '--' : state.searchFrozenStateOptions.find(option => option.value === item.FrozenState).label,
          DataTimeText: isEmpty(item.DataTime) ? '--' : moment(item.DataTime).format('YYYY-MM-DD HH:mm:ss')
        })
      })
      commit(types.SET_DATA, { item: 'emeterList', value: emeterList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count || 0 })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEMeterList', value: false })
    })
  },
  getEMeterStatic ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let projectId = rootState.areaId
    let groupId = getters.currentNodeId
    let params = {
      projectId: projectId
    }
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      params.groupId = groupId
    }
    let getEMeterStaticReq = api.status.getStatusEMeterStatic(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEMeterStaticReq', value: getEMeterStaticReq.cancel })
    getEMeterStaticReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'emeterStaticData', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
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
