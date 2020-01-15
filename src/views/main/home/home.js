import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import moment from 'moment'

const state = {
  reqCancels: new Map(),
  emeterStatus: {},
  gatewayStatus: {},
  incomeDateType: 3,
  incomeData: {},
  incomeEleData: {},
  incomeChartData: [],
  warnData: [],
  isLoadingWarnData: false
}

const getters = {}

const actions = {
  ...Actions,
  getGatewayStatus ({ state, rootState, commit }) {
    let getGatewayStatusReq = api.status.getStatusGatewayStaticById(rootState.areaId)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayStatus', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayStatusReq', value: getGatewayStatusReq.cancel })
    getGatewayStatusReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'gatewayStatus', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayStatus', value: false })
    })
  },
  getEmeterStatus ({ state, rootState, commit }) {
    let getEmeterStatusReq = api.status.getStatusEMeterStatic({
      projectId: rootState.areaId
    })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEmeterStatus', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEmeterStatusReq', value: getEmeterStatusReq.cancel })
    getEmeterStatusReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'emeterStatus', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEmeterStatus', value: false })
    })
  },
  getIncomeEle ({ state, rootState, commit }) {
    let getIncomeEleReq = api.frozen.getHomePage({
      projectId: rootState.areaId
    })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingIncomeEle', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getIncomeEleReq', value: getIncomeEleReq.cancel })
    getIncomeEleReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'incomeEleData', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingIncomeEle', value: false })
    })
  },
  getIncomeData ({ state, rootState, commit }) {
    let getIncomeDataReq = api.payHistory.getIncome({
      projectId: rootState.areaId,
      form: state.incomeDateType
    })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingIncomeData', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getIncomeDataReq', value: getIncomeDataReq.cancel })
    getIncomeDataReq.request.then(res => {
      let data = res.Data || {}
      let chartData = []
      commit(types.SET_DATA, { item: 'incomeData', value: data })
      if (Object.values(data).length) {
        let dateType = state.incomeDateType
        let dateFormat = dateType === 3 ? 'HH:00' : 'YYYY-MM-DD'
        chartData = [
          { name: '微信收入', value: data.WeixinTotal },
          { name: '支付宝收入', value: data.AlipayTotal },
          { name: '现金收入', value: data.CashTotal }
        ]
        data.Start = data.StartTime ? moment(data.StartTime).format(dateFormat) : ''
        data.End = data.EndTime ? moment(data.EndTime).format(dateFormat) : ''
      }
      commit(types.SET_DATA, { item: 'incomeChartData', value: chartData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingIncomeData', value: false })
    })
  },
  getWarnData ({ state, rootState, commit }) {
    let getWarnDataReq = api.warn.getHomeStatic(rootState.areaId)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnData', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getWarnDataReq', value: getWarnDataReq.cancel })
    getWarnDataReq.request.then(res => {
      let data = res.Data || {}
      let warnData = [
        { name: '余额不足', value: data.BalanceLow },
        { name: '欠费警告', value: data.BalanceOwe },
        { name: '冻结日常', value: data.FrozenErr }
      ]
      commit(types.SET_DATA, { item: 'warnData', value: warnData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnData', value: false })
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
