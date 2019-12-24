import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'

const state = {
  reqCancels: new Map(),
  searchNameWarn: '',
  searchNameRoom: '',
  searchWarnScheme: '',
  currentPageWarn: 1,
  currentPageRoom: 1,
  pageSize: 5,
  warnList: [],
  roomList: [],
  totalCountWarn: 1,
  totalCountRoom: 1,
  isLoadingWarnList: false,
  isLoadingRoomList: false,
  isShowEdit: false,
  isModify: false,
  offTypeText: {
    0: '立即拉闸',
    1: '延时拉闸'
  }
}

const getters = {
  offTypeList: (state, getters) => (Object.entries(state.offTypeText).map(([id, text]) => ({
    label: text,
    key: id
  })))
}

const actions = {
  ...Actions,
  showEdit ({ commit, state, getters, dispatch }, { isShow = true, row } = { isShow: true }) {
    if (!isShow) {
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
      } else {
        // 添加模式
        commit(types.SET_DATA, { item: 'isModify', value: false })
      }
    }
    commit(types.SET_DATA, { item: 'isShowEdit', value: isShow })
  },
  getWarnSchemeList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      Name: state.searchNameWarn,
      SchemeType: 1,
      PageIndex: state.currentPageWarn,
      PageSize: state.pageSize
    }
    let getWarnSchemeListReq = api.scheme.getSchemeList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getWarnSchemeListReq', value: getWarnSchemeListReq.cancel })
    getWarnSchemeListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(item => {
        item.StatusText = item.Status === 0 ? '启用' : (item.Status === 3 ? '停用' : '其他')
        item.OffTypeText = item.BalanceContent ? state.offTypeText[item.BalanceContent.OffType] : '--'
        item.WarnValueText = item.BalanceContent ? item.BalanceContent.WarnValue : '--'
      })
      commit(types.SET_DATA, { item: 'warnList', value: data })
      commit(types.SET_DATA, { item: 'totalCountWarn', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingWarnList', value: false })
    })
  },
  getRoomList ({ commit, state, rootState, getters, dispatch }) {
    let postData = {
      ProjectId: rootState.areaId,
      RoomNo: state.searchNameRoom,
      Name: state.searchWarnScheme,
      SchemeType: 1,
      PageIndex: state.currentPageRoom,
      PageSize: state.pageSize
    }
    let getRoomSchemeListReq = api.scheme.getRoomSchemeList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomSchemeListReq', value: getRoomSchemeListReq.cancel })
    getRoomSchemeListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'roomList', value: data })
      commit(types.SET_DATA, { item: 'totalCountRoom', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: false })
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
