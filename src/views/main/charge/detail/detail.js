import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import moment from 'moment'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  searchData: {
    RoomFullName: '',
    ChargeType: -1,
    PayClient: -1
  },
  chargeTypeList: [
    { value: 0, label: '预存' },
    { value: 1, label: '退费' },
    { value: 2, label: '补助' }
  ],
  payClientList: [
    { value: 0, label: 'web端' },
    { value: 1, label: '小程序' }
  ],
  payTypeList: { 1: '现金', 2: '微信', 3: '支付宝' },
  isLoadingDetailList: false,
  detailList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  searchPeriod: [moment(new Date()).subtract(1, 'month').toDate(), new Date()]
}

const getters = {
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  getDetailList ({ state, getters, rootState, commit }) {
    let searchData = state.searchData
    let postData = {
      ProjectId: rootState.areaId,
      PageIndex: state.currentPage,
      PageSize: state.pageSize,
      RoomFullName: searchData.RoomFullName,
      Start: moment(state.searchPeriod[0]).format('YYYY-MM-DD'),
      End: moment(state.searchPeriod[1]).format('YYYY-MM-DD')
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) postData.GroupId = groupId
    if (!isEmpty(searchData.ChargeType) && searchData.ChargeType !== -1) postData.ChargeType = searchData.ChargeType
    if (!isEmpty(searchData.PayClient) && searchData.PayClient !== -1) postData.PayClient = searchData.PayClient
    let cancel = state.reqCancels.get('getBalanceListReq')
    if (cancel) cancel()
    let getDetailListReq = api.payHistory.getPayHistory(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getDetailListReq', value: getDetailListReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingDetailList', value: true })
    getDetailListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(item => {
        item.PayTimeText = item.PayTime ? moment(item.PayTime).format('YYYY-MM-DD HH:mm:ss') : ''
        item.ChargeTypeText = isEmpty(item.ChargeType) ? '' : state.chargeTypeList.find(w => w.value === item.ChargeType).label
        item.PayClientText = isEmpty(item.PayClient) ? '' : state.payClientList.find(w => w.value === item.PayClient).label
        item.PayTypeText = isEmpty(item.PayType) ? '' : state.payTypeList[item.PayType]
      })
      commit(types.SET_DATA, { item: 'detailList', value: data })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count || 0 })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingDetailList', value: false })
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
