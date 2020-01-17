import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import moment from 'moment'

const state = {
  currentNode: {},
  reqCancels: new Map(),
  searchName: '',
  searchWarnType: null,
  searchWarnTypeOptions: [],
  searchWarnObject: '',
  searchDateRange: [moment().subtract(1, 'weeks').toDate(), new Date()],
  warnTypeList: [],
  warnList: [],
  currentPage: 1,
  pageSize: 10,
  isLoadingWarnList: false
}

const getters = {
  currentNodeId: state => state.currentNode.value,
  warnListPagination: state => {
    return state.warnList.slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize)
  },
  dateRangeString: state => {
    return {
      Start: moment(state.searchDateRange[0]).format('YYYY-MM-DD HH:mm:ss'),
      End: moment(state.searchDateRange[1]).format('YYYY-MM-DD HH:mm:ss')
    }
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
      commit(types.SET_DATA, { item: 'searchWarnType', value: searchWarnTypeOptions[0].value })
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
      Start: getters.dateRangeString.Start,
      End: getters.dateRangeString.End,
      ProjectId: projectId,
      OwnName: state.searchWarnObject,
      WarnName: state.searchName,
      Type: state.searchWarnType
    }
    if (!isEmpty(groupId) && groupId !== projectId) {
      postData.GroupId = groupId
    }
    let getWarnListReq = api.warn.postWarnHistory(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getWarnListReq', value: getWarnListReq.cancel })
    getWarnListReq.request.then(res => {
      let data = res.Data || []
      let warnList = data.map(item => {
        let warnTypeItem = state.searchWarnTypeOptions.find(option => option.value === item.Type)
        return Object.assign({}, item, {
          TypeText: isEmpty(item.Type) ? '--' : (warnTypeItem ? warnTypeItem.label : '--'),
          ProduceTimeText: isEmpty(item.ProduceTime) ? '--' : moment(item.ProduceTime).format('YYYY-MM-DD HH:mm:ss'),
          EndTimeText: isEmpty(item.EndTime) ? '--' : moment(item.EndTime).format('YYYY-MM-DD HH:mm:ss')
        })
      })
      commit(types.SET_DATA, { item: 'warnList', value: warnList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnList', value: false })
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
