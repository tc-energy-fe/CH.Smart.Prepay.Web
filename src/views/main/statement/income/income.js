import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import moment from 'moment'
import * as types from '@/store/mutation-types'
import api from '@/api'
import { download } from '@/utils/file'
import apiUrl from '@/api/apiUrl'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  searchData: {
    date: new Date(),
    dateType: 3
  },
  totalTableData: [],
  pieData: [],
  reportList: [],
  isLoadingPayData: false,
  detailBarData: []
}

const getters = {
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  getPayData ({ state, getters, rootState, commit }) {
    let searchData = state.searchData
    let postData = {
      ProjectId: rootState.areaId,
      Form: searchData.dateType,
      StaticTime: moment(searchData.date).format('YYYY-MM-DD')
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      postData.GroupId = groupId
    }
    let getPayDataReq = api.payHistory.getPayReport(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingPayData', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getPayDataReq', value: getPayDataReq.cancel })
    getPayDataReq.request.then(res => {
      let data = res.Data || {}
      let reportList = data.Datas || []
      let dateType = postData.Form
      reportList.forEach(r => {
        r.DateText = moment(r.Date).format(dateType === 1 ? 'YYYY-MM' : dateType === 2 ? 'MM-DD' : 'HH:mm')
      })
      let totalData = Object.keys(data) || []
      let pieData = []
      let totalTableData = []
      let detailBarData = []
      if (totalData.length) {
        pieData = [
          { name: '微信收入', value: data.WeixinTotal },
          { name: '支付宝收入', value: data.AlipayTotal },
          { name: '现金收入', value: data.CashTotal }
        ]
        totalTableData = [{ name: '总收入', value: data.Total }].concat(pieData, [{ name: '退费金额', value: data.RefundTotal }])
        if (reportList && reportList.length) {
          detailBarData = [
            { name: '微信支付', data: [] },
            { name: '支付宝收入', data: [] },
            { name: '现金收入', data: [] }
          ]
          let weixin = detailBarData[0].data
          let alipay = detailBarData[1].data
          let cash = detailBarData[2].data
          reportList.forEach(r => {
            let date = moment(r.Date).format(dateType === 1 ? 'M' : dateType === 2 ? 'M.D' : 'H')
            let label = moment(r.Date).format(dateType === 1 ? 'YYYY.MM' : dateType === 2 ? 'YYYY.MM.DD' : 'YYYY.MM.DD H时')
            weixin.push({
              label: label,
              value: r.Weixin,
              xAxis: date
            })
            alipay.push({
              label: label,
              value: r.Alipay,
              xAxis: date
            })
            cash.push({
              label: label,
              value: r.Cash,
              xAxis: date
            })
          })
        }
      }
      commit(types.SET_DATA, { item: 'totalTableData', value: totalTableData })
      commit(types.SET_DATA, { item: 'pieData', value: pieData })
      commit(types.SET_DATA, { item: 'reportList', value: reportList || [] })
      commit(types.SET_DATA, { item: 'detailBarData', value: detailBarData || [] })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingPayData', value: false })
    })
  },
  exportExcel ({ state, getters, rootState, commit }) {
    let searchData = state.searchData
    let postData = {
      ProjectId: rootState.areaId,
      Form: searchData.dateType,
      StaticTime: moment(searchData.date).format('YYYY-MM-DD')
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      postData.GroupId = groupId
    }
    let exportExcelReq = api.payHistory.exportReport(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingExcel', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'exportExcelReq', value: exportExcelReq.cancel })
    exportExcelReq.request.then(res => {
      let data = res.Data || null
      if (data) {
        download(`${apiUrl}/File?fid=${data}&filename=${encodeURIComponent('收入明细报表.xlsx')}`, '收入明细报表.xlsx')
      } else {
      }
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingExcel', value: false })
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
