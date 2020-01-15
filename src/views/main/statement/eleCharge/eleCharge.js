import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import moment from 'moment'
import { download } from '@/utils/file'
import apiUrl from '@/api/apiUrl'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  tabIndex: 1,
  searchData: {
    room: null,
    date: new Date(),
    dateType: 2
  },
  isLoadingRoomList: false,
  searchRoomList: [],
  isLoadingRoomReport: false,
  reportTotal: {},
  reportList: [],
  pieData: []
}

const getters = {
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  getSearchRoomList ({ state, getters, rootState, commit, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId
    }
    let groupId = getters.currentNodeId
    if (!isEmpty(groupId) && groupId !== rootState.areaId) {
      postData.GroupId = groupId
    }
    let getSearchRoomListReq = api.group.getRoomList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSearchRoomListReq', value: getSearchRoomListReq.cancel })
    getSearchRoomListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'searchRoomList', value: data })
      commit(types.UPDATE_OBJ_DATA, { obj: 'searchData', item: 'room', value: data[0] ? data[0].Id : null })
      dispatch('getRoomReport')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: false })
    })
  },
  getRoomReport ({ state, getters, rootState, commit }) {
    let searchData = state.searchData
    let postData = {
      ProjectId: rootState.areaId,
      Form: searchData.dateType,
      StaticTime: moment(searchData.date).format('YYYY-MM-DD')
    }
    let groupId = searchData.room
    if (!isEmpty(groupId)) {
      postData.GroupId = groupId
    } else {
      commit(types.SET_DATA, { item: 'reportTotal', value: {} })
      commit(types.SET_DATA, { item: 'reportList', value: [] })
      commit(types.SET_DATA, { item: 'pieData', value: [] })
      ElAlert('请选择房间！', '提示')
      return
    }
    let getRoomReportReq = api.frozen.getEleReportRoom(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomReport', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomReportReq', value: getRoomReportReq.cancel })
    getRoomReportReq.request.then(res => {
      let data = res.Data || {}
      let reportList = data.Datas || []
      let dateType = postData.Form
      reportList.forEach(r => {
        r.Date = moment(r.Date).format(dateType === 1 ? 'YYYY-MM' : 'MM-DD')
        r.DateTime = r.DataTime ? moment(r.DataTime).format('YYYY-MM-DD HH:mm:ss') : ''
        r.FullName = state.searchRoomList.find(room => room.Id === groupId).FullName
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
      commit(types.SET_DATA, { item: 'reportTotal', value: data })
      commit(types.SET_DATA, { item: 'pieData', value: pieData })
      commit(types.SET_DATA, { item: 'reportList', value: data.Datas || [] })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomReport', value: false })
    })
  },
  exportExcel ({ state, getters, rootState, commit }) {
    let searchData = state.searchData
    let postData = {
      ProjectId: rootState.areaId,
      Form: searchData.dateType,
      StaticTime: moment(searchData.date).format('YYYY-MM-DD')
    }
    let groupId = searchData.room
    if (!isEmpty(groupId)) {
      postData.GroupId = groupId
    } else {
      return
    }
    let exportExcelReq = api.frozen.exportFrozen(postData)
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
