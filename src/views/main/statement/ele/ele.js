import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import moment from 'moment'
import { download } from '@/utils/file'
import apiUrl from '@/api/apiUrl'
import { currency } from '@/utils/currency'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  tabIndex: 1,
  searchData: {
    date: new Date(),
    dateType: 2
  },
  isLoadingEleReport: false,
  reportTotal: {},
  reportList: [],
  pieData: [],
  detailBarData: []
}

const getters = {
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  getEleReport ({ state, getters, rootState, commit }) {
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
    let getEleReportReq = api.frozen.getEleReport(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEleReport', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEleReportReq', value: getEleReportReq.cancel })
    getEleReportReq.request.then(res => {
      let data = res.Data || {}
      let reportList = data.Datas || []
      let dateType = postData.Form
      let detailBarData = []
      reportList.forEach(r => {
        r.DateText = moment(r.Date).format(dateType === 1 ? 'YYYY-MM' : 'MM-DD')
      })
      let pieData = Object.keys(data) || []
      if (pieData.length) {
        pieData = [
          { name: '尖电量', value: data.DeltaPointedSum },
          { name: '峰电量', value: data.DeltaPeakSum },
          { name: '平电量', value: data.DeltaFlatSum },
          { name: '谷电量', value: data.DeltaValleySum }
        ]
      }
      if (reportList && reportList.length) {
        detailBarData = [
          { name: '尖电量', data: [] },
          { name: '峰电量', data: [] },
          { name: '平电量', data: [] },
          { name: '谷电量', data: [] }
        ]
        let point = detailBarData[0].data
        let peak = detailBarData[1].data
        let flat = detailBarData[2].data
        let valley = detailBarData[3].data
        reportList.forEach(r => {
          let date = moment(r.Date).format(dateType === 1 ? 'M' : 'M.D')
          let label = moment(r.Date).format(dateType === 1 ? 'YYYY.MM' : 'YYYY.MM.DD')
          point.push({
            label: label,
            value: currency(r.DeltaPointed),
            xAxis: date
          })
          peak.push({
            label: label,
            value: currency(r.DeltaPeak),
            xAxis: date
          })
          flat.push({
            label: label,
            value: currency(r.DeltaFlat),
            xAxis: date
          })
          valley.push({
            label: label,
            value: currency(r.DeltaValley),
            xAxis: date
          })
        })
      }
      commit(types.SET_DATA, { item: 'reportTotal', value: data })
      commit(types.SET_DATA, { item: 'pieData', value: pieData })
      commit(types.SET_DATA, { item: 'reportList', value: data.Datas || [] })
      commit(types.SET_DATA, { item: 'detailBarData', value: detailBarData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEleReport', value: false })
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
    let exportExcelReq = api.frozen.exportEle(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingExcel', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'exportExcelReq', value: exportExcelReq.cancel })
    exportExcelReq.request.then(res => {
      let data = res.Data || null
      if (data) {
        download(`${apiUrl}/File?fid=${data}&filename=${encodeURIComponent('电表冻结报表.xlsx')}`, '电表冻结报表.xlsx')
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
