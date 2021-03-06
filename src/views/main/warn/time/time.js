import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import moment from 'moment'

const TOTAL_OPTION = null

const state = {
  currentNode: {},
  reqCancels: new Map(),
  searchName: '',
  searchWarnType: TOTAL_OPTION,
  searchWarnTypeOptions: [],
  searchWarnObject: '',
  warnTypeList: [],
  warnList: [],
  currentPage: 1,
  pageSize: 10,
  isLoadingWarnList: false,
  warnStaticData: {
    GatewayOffline: 0,
    FrozenErr: 0
  }
}

const getters = {
  currentNodeId: state => state.currentNode.value,
  warnListPagination: state => {
    return state.warnList.slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize)
  }
}

const actions = {
  ...Actions,
  getWarnTypeList ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let getWarnTypeListReq = api.warn.getWarnType()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getWarnTypeListReq', value: getWarnTypeListReq.cancel })
    getWarnTypeListReq.request.then(res => {
      let data = res.Data || {}
      let warnTypeList = Object.entries(data).map(([key, value]) => {
        return {
          value: parseInt(key),
          label: value
        }
      })
      commit(types.SET_DATA, { item: 'warnTypeList', value: warnTypeList })
      let searchWarnTypeOptions = [...warnTypeList]
      commit(types.SET_DATA, { item: 'searchWarnTypeOptions', value: searchWarnTypeOptions })
      commit(types.SET_DATA, { item: 'searchWarnType', value: TOTAL_OPTION })
      dispatch('getWarnList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
    })
  },
  getWarnList ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let groupId = getters.currentNodeId
    let projectId = rootState.areaId
    let postData = {
      ProjectId: projectId,
      OwnName: state.searchWarnObject,
      WarnName: state.searchName
    }
    if (!isEmpty(groupId) && groupId !== projectId) {
      postData.GroupId = groupId
    }
    if (!(state.searchWarnType === TOTAL_OPTION || isEmpty(state.searchWarnType))) {
      postData.Type = state.searchWarnType
    }
    let getWarnListReq = api.warn.postWarnRealTime(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getWarnListReq', value: getWarnListReq.cancel })
    getWarnListReq.request.then(res => {
      let data = res.Data || []
      let warnList = data.map(item => {
        let warnTypeItem = state.searchWarnTypeOptions.find(option => option.value === item.Type)
        return Object.assign({}, item, {
          TypeText: isEmpty(item.Type) ? '--' : (warnTypeItem ? warnTypeItem.label : '--'),
          ProduceTimeText: isEmpty(item.ProduceTime) ? '--' : moment(item.ProduceTime).format('YYYY-MM-DD HH:mm')
        })
      })
      commit(types.SET_DATA, { item: 'warnList', value: warnList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnList', value: false })
    })
  },
  getWarnStaticData ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    let projectId = rootState.areaId
    let groupId = getters.currentNodeId
    let params = {
      projectId: projectId
    }
    if (!isEmpty(groupId) && groupId !== projectId) {
      params.groupId = groupId
    }
    let getWarnStaticDataReq = api.warn.getWarnStatic(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getWarnStaticDataReq', value: getWarnStaticDataReq.cancel })
    getWarnStaticDataReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'warnStaticData', value: data })
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
