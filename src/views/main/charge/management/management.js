import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import moment from 'moment'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  searchData: {
    Name: '',
    HostInfo: '',
    IsOn: -1,
    WarnType: -1
  },
  warnTypeList: [
    { value: 0, label: '无' },
    { value: 1, label: '冻结异常' },
    { value: 2, label: '欠费' },
    { value: 3, label: '欠费且冻结异常' }
  ],
  isLoadingBalanceList: false,
  isLoadingBalanceWarnType: false,
  balanceList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isShowEdit: false,
  detailData: {},
  recentData: {},
  isLoadingRecent: false,
  sevenDayData: [],
  isLoadingSevenDayData: false,
  editChargeType: 0,
  editPayType: 1,
  editMoney: null
}

const getters = {
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  showEdit ({ state, commit, dispatch }, { isShow, data }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'detailData', value: {} })
    } else {
      commit(types.SET_DATA, {
        item: 'detailData',
        value: {
          Id: data.Id,
          room: data.FullName || '--',
          host: data.HostName || '-',
          phone: data.HostPhone || '-',
          balance: isEmpty(data.Balance) ? '-' : data.Balance,
          meter: data.EMeterSN || ''
        }
      })
      commit(types.SET_DATA, { item: 'editChargeType', value: 0 })
      commit(types.SET_DATA, { item: 'editMoney', value: null })
      // commit(types.SET_DATA, { item: 'editPayType', value: 1 })
      dispatch('getRecent')
      dispatch('getSevenDayData')
    }
    commit(types.SET_DATA, { item: 'isShowEdit', value: isShow })
  },
  getWarnType ({ state, commit, dispatch }) {
    let getBalanceWarnTypeReq = api.charge.getBalanceWarnType()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getBalanceWarnTypeReq', value: getBalanceWarnTypeReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingBalanceWarnType', value: true })
    getBalanceWarnTypeReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'warnTypeList', value: Object.entries(data).map(w => ({ value: Number(w[0]), label: w[1] })) })
      dispatch('getBalanceList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingBalanceWarnType', value: false })
    })
  },
  getBalanceList ({ state, getters, rootState, commit }) {
    let searchData = state.searchData
    let postData = {
      ProjectId: rootState.areaId,
      PageIndex: state.currentPage,
      PageSize: state.pageSize,
      Name: searchData.Name,
      HostInfo: searchData.HostInfo
    }
    let groupId = getters.currentNodeId
    let IsOn = searchData.IsOn
    let WarnType = searchData.WarnType
    if (!isEmpty(groupId) && groupId !== rootState.areaId) postData.GroupId = groupId
    if (!isEmpty(IsOn) && IsOn !== -1) postData.IsOn = IsOn
    if (!isEmpty(WarnType) && WarnType !== -1) postData.WarnType = WarnType
    let cancel = state.reqCancels.get('getBalanceListReq')
    if (cancel) cancel()
    let getBalanceListReq = api.charge.getBalanceList(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getBalanceListReq', value: getBalanceListReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingBalanceList', value: true })
    getBalanceListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(item => {
        item.SettleTimeText = item.SettleTime ? moment(item.SettleTime).format('YYYY-MM-DD') : ''
        item.IsOnText = isEmpty(item.IsOn) ? '' : (item.IsOn ? '合闸' : '开闸')
        item.WarnTypeText = isEmpty(item.WarnType) ? '' : state.warnTypeList.find(w => w.value === item.WarnType).label
      })
      commit(types.SET_DATA, { item: 'balanceList', value: data })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count || 0 })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingBalanceList', value: false })
    })
  },
  getRecent ({ state, commit }) {
    let getRecentReq = api.frozen.getRecent(state.detailData.Id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRecentReq', value: getRecentReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRecent', value: true })
    getRecentReq.request.then(res => {
      let data = res.Data || {}
      let detailData = state.detailData
      data.EMeterSN = detailData.meter
      data.FullName = detailData.room
      data.Date = data.Date ? moment(data.Date).format('YYYY-MM-DD HH:mm:ss') : ''
      commit(types.SET_DATA, { item: 'recentData', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRecent', value: false })
    })
  },
  getSevenDayData ({ state, commit }) {
    let getSevenDayDataReq = api.frozen.getPastSevenDay(state.detailData.Id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSevenDayDataReq', value: getSevenDayDataReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingSevenDayData', value: true })
    getSevenDayDataReq.request.then(res => {
      let data = res.Data || []
      let list = data.map(item => ({
        name: moment(item.Date).format('MM-DD'),
        value: isEmpty(item.DeltaTotal) ? '-' : item.DeltaTotal
      }))
      commit(types.SET_DATA, { item: 'sevenDayData', value: list })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingSevenDayData', value: false })
    })
  },
  balancePay ({ state, commit, dispatch }) {
    let postData = {
      GroupId: state.detailData.Id,
      ChargeType: state.editChargeType,
      Money: state.editMoney,
      PayClient: 0,
      PayType: state.editPayType
    }
    if (isEmpty(postData.Money) || postData.Money === 0) {
      ElAlert('请填写金额！', '提示')
      return
    }
    let balancePayReq = api.charge.balancePay(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'balancePayReq', value: balancePayReq.cancel })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingBalancePay', value: true })
    balancePayReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('showEdit', { isShow: false })
      dispatch('getBalanceList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingBalancePay', value: false })
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
