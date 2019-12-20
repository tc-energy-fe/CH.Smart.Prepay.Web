import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import initTree from '@/utils/tree'
import moment from 'moment'

const state = {
  reqCancels: new Map(),
  searchPriceName: '',
  searchRoomName: '',
  searchSchemeType: '',
  priceList: [],
  isLoadingPriceList: false,
  currentPricePage: 1,
  totalPriceCount: 0,
  currentRoomPage: 1,
  totalRoomCount: 0,
  isLoadingRoomList: false,
  roomList: [],
  isShowEdit: false,
  isModify: false,
  editData: {
    Id: null,
    Name: '',
    Status: 0,
    GroupIds: []
  },
  editPriceContent: [{
    DateStart: new Date(),
    DateEnd: new Date(),
    PriceType: 1,
    StepPrice: false,
    SettlDay: null,
    PricePeriod: [{}, {}, {}]
  }],
  editRoomTree: [],
  schemeDetail: {},
  isLoadingEditRoomList: false,
  isLoadingSchemeDetail: false
}

const getters = {
  projectId: (state, getters, rootState) => rootState.areaId
}

const actions = {
  ...Actions,
  showEdit ({ state, getters, commit, dispatch }, { isShow, row }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    commit(types.SET_DATA, { item: 'editData',
      value: {
        Id: null,
        Name: '',
        Status: 0,
        GroupIds: []
      }
    })
    commit(types.SET_DATA, { item: 'editPriceContent',
      value: [{
        DateStart: new Date(),
        DateEnd: new Date(),
        PriceType: 1,
        StepPrice: false,
        SettlDay: null,
        PricePeriod: Array.apply(null, Array(3)).map(() => ({
          EleUpLine: null,
          AvgPrice: null,
          EleDownLine: null,
          Point: null,
          Peak: null,
          Flat: null,
          Valley: null
        }))
      }]
    })
    commit(types.SET_DATA, { item: 'editRoomTree', value: [] })
    if (row) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      dispatch('getSchemeDetail', row.Id)
      dispatch('getEditRoomList', row.Id)
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
      dispatch('getEditRoomList')
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  editPriceContentPeriodDataOnChange ({ commit }, { pCIndex, pIndex, key, value }) {
    commit('UPDATE_PRICE_CONTENT_PERIOD', { pCIndex, pIndex, key, value })
  },
  editPriceContentDataOnChange ({ commit }, { index, key, value }) {
    commit('UPDATE_PRICE_CONTENT', { index, key, value })
  },
  addEditPriceContentItem ({ commit }) {
    commit('ADD_PRICE_CONTENT')
  },
  removeEditPriceContentItem ({ commit }, index) {
    commit('REMOVE_PRICE_CONTENT', index)
  },
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
      Name: state.searchSchemeType,
      RoomNo: state.searchRoomName,
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
  },
  getSchemeDetail ({ state, getters, commit }, id) {
    let getSchemeDetailReq = api.scheme.getSchemeDetail(id)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingSchemeDetail', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSchemeDetailReq', value: getSchemeDetailReq.cancel })
    getSchemeDetailReq.request.then(res => {
      let data = res.Data || []
      let priceContent = data.PriceContent || []
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: data[k] })
      })
      priceContent = priceContent.map((pC, index) => {
        let period = pC.PricePeriod || []
        let PricePeriod = Array.apply(null, Array(3)).map((p, index) => {
          let periodItem = period[index + 1] || {}
          console.log(periodItem)
          return Object.assign({
            EleUpLine: null,
            AvgPrice: null,
            EleDownLine: null,
            Point: null,
            Peak: null,
            Flat: null,
            Valley: null
          }, periodItem)
        })
        return {
          DateStart: moment().toDate(),
          DateEnd: moment().toDate(),
          PriceType: pC.PriceType,
          StepPrice: pC.StepPrice,
          SettlDay: pC.SettlDay || null,
          PricePeriod
        }
      })
      commit(types.SET_DATA, { item: 'schemeDetail', value: data })
      commit(types.SET_DATA, { item: 'editPriceContent', value: priceContent })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingSchemeDetail', value: false })
    })
  },
  getEditRoomList ({ state, getters, commit }, id) {
    let params = {
      projectId: getters.projectId,
      schemeType: 0
    }
    if (state.isModify) params.configId = id

    let getEditRoomListReq = state.isModify ? api.group.getRoomConfigEditList(params) : api.group.getRoomConfigAddList(params)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEditRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEditRoomListReq', value: getEditRoomListReq.cancel })
    getEditRoomListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'editRoomTree', value: initTree(data, { rootLevel: 1 }) })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEditRoomList', value: false })
    })
  }
}

const mutations = {
  ...Mutations,
  UPDATE_PRICE_CONTENT (state, { index, key, value }) {
    state.editPriceContent[index][key] = value
  },
  UPDATE_PRICE_CONTENT_PERIOD (state, { pCIndex, pIndex, key, value }) {
    state.editPriceContent[pCIndex].PricePeriod[pIndex][key] = value
  },
  ADD_PRICE_CONTENT (state) {
    state.editPriceContent.push({
      DateStart: new Date(),
      DateEnd: new Date(),
      PriceType: 1,
      StepPrice: false,
      SettlDay: null,
      PricePeriod: Array.apply(null, Array(3)).map(() => ({
        EleUpLine: null,
        AvgPrice: null,
        EleDownLine: null,
        Point: null,
        Peak: null,
        Flat: null,
        Valley: null
      }))
    })
  },
  REMOVE_PRICE_CONTENT (state, index) {
    state.editPriceContent.splice(index, 1)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
