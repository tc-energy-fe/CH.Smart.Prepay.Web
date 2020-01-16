import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'

const TOTAL_OPTION = null

const state = {
  reqCancels: new Map(),
  currentNode: {},
  searchName: '',
  searchState: TOTAL_OPTION,
  searchStateOptions: [
    { label: '全部状态', value: TOTAL_OPTION },
    { label: '在线', value: true },
    { label: '离线', value: false }
  ],
  gatewayList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isLoadingGatewayList: false,
  gatewayStaticData: {
    Total: 0,
    Online: 0,
    Offline: 0
  },
  isLoadingGatewayStatic: false
}

const getters = {
}

const actions = {
  ...Actions,
  getGatewayStatusList ({ commit, state, getters, rootState }) {
    let postData = {
      ProjectId: rootState.areaId,
      Name: state.searchName,
      PageIndex: state.currentPageKeep,
      PageSize: state.pageSizeKeep
    }
    if (!(state.searchState === TOTAL_OPTION || isEmpty(state.searchState))) {
      postData.Status = state.searchState
    }
    let getEMeterStatusListReq = api.status.postStatusGateway(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEMeterStatusListReq', value: getEMeterStatusListReq.cancel })
    getEMeterStatusListReq.request.then(res => {
      let data = res.Data || []
      let gatewayList = data.map(item => {
        return Object.assign({}, item, {
          StatusText: isEmpty(item.Status) ? '' : (item.Status ? '在线' : '离线')
        })
      })
      commit(types.SET_DATA, { item: 'gatewayList', value: gatewayList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count || 0 })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: false })
    })
  },
  getGatewayStatic ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let projectId = rootState.areaId
    let getGatewayStaticReq = api.status.getStatusGatewayStaticById(projectId)
    commit(types.SET_DATA, { item: 'isLoadingGatewayStatic', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayStaticReq', value: getGatewayStaticReq.cancel })
    getGatewayStaticReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'gatewayStaticData', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_DATA, { item: 'isLoadingGatewayStatic', value: false })
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
