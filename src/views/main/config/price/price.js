import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'

const state = {
  reqCancels: new Map(),
  searchPriceName: '',
  searchRoomName: '',
  searchRoomNo: '',
  searchSchemeType: '',
  priceList: [],
  isLoadingPriceList: false,
  currentPricePage: 1,
  totalPriceCount: 0,
  currentRoomPage: 1,
  totalRoomCount: 0,
  isLoadingRoomList: false,
  roomList: []
}

const getters = {
  projectId: (state, getters, rootState) => rootState.areaId
}

const actions = {
  ...Actions,
  getPriceList ({ state, getters, commit }) {
    let postData = {
      ProjectId: getters.projectId,
      Name: state.searchPriceName,
      SchemeType: 0, // 电价方案
      PageIndex: state.currentPricePage,
      PageSize: 5
    }
    let getPriceListReq = api.scheme.getSchemeList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingPriceList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getPriceListReq', value: getPriceListReq.cancel })
    getPriceListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(item => {
        item.StatusText = item.Status ? '启用' : '停用'
      })
      commit(types.SET_DATA, { item: 'priceList', value: data })
      commit(types.SET_DATA, { item: 'totalPriceCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingPriceList', value: false })
    })
  },
  getRoomList ({ state, getters, commit }) {
    let postData = {
      ProjectId: getters.projectId,
      Name: state.searchRoomName,
      RoomNo: state.searchRoomNo,
      SchemeType: 0, // 电价方案
      PageIndex: state.currentRoomPage,
      PageSize: 5
    }
    let getRoomListReq = api.scheme.getRoomSchemeList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomListReq', value: getRoomListReq.cancel })
    getRoomListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'roomList', value: data })
      commit(types.SET_DATA, { item: 'totalRoomCount', value: res.Count })
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
