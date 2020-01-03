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
      commit(types.ABORT_REQUEST, { item: 'getSchemeDetailReq' })
      commit(types.ABORT_REQUEST, { item: 'getEditRoomListReq' })
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
        DateStart: moment().startOf('year').toDate(),
        DateEnd: moment().endOf('year').toDate(),
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
        item.StatusText = item.Status === 0 ? '启用' : '停用'
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
          DateStart: moment(`${new Date().getFullYear()}/${pC.DateStart}`).toDate(),
          DateEnd: moment(`${new Date().getFullYear()}/${pC.DateEnd}`).toDate(),
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
  },
  modifySchemeStatus ({ state, getters, commit, dispatch }, { row, status }) {
    ElConfirm(`是否${status === 0 ? '启用' : '停用'}方案 ${row.Name} ？`).then(res => {
      let postData = {
        Id: row.Id,
        Status: status
      }
      let modifySchemeStatusReq = api.scheme.modifySchemeStatus(postData)
      commit(types.SET_LOADING_STATUS, { item: 'isModingSchemeStatus', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'modifySchemeStatusReq', value: modifySchemeStatusReq.cancel })
      modifySchemeStatusReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        commit(types.SET_DATA, { item: 'currentPricePage', value: 1 })
        commit(types.SET_DATA, { item: 'currentRoomPage', value: 1 })
        this.getPriceList()
        this.getRoomList()
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isModingSchemeStatus', value: false })
      })
    })
  },
  editScheme ({ state, getters, commit, dispatch }) {
    dispatch('validateData').then(res => {
      if (!res) {
        return
      }
      let editSchemeReq = state.isModify ? api.scheme.modifyScheme(res) : api.scheme.addScheme(res)
      commit(types.SET_LOADING_STATUS, { item: 'isEditingScheme', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'editSchemeReq', value: editSchemeReq.cancel })
      editSchemeReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('showEdit', { isShow: false })
        commit(types.SET_DATA, { item: 'currentPricePage', value: 1 })
        commit(types.SET_DATA, { item: 'currentRoomPage', value: 1 })
        dispatch('getPriceList')
        dispatch('getRoomList')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isEditingScheme', value: false })
      })
    })
  },
  validateData ({ state, getters }) {
    let editData = state.editData
    let editPriceContent = state.editPriceContent
    let postData = {
      ProjectId: getters.projectId,
      Name: editData.Name,
      SchemeType: 0,
      GroupIds: editData.GroupIds,
      Status: editData.Status
    }
    if (state.isModify) postData.Id = editData.Id
    // 方案名称验证
    if (isEmpty(postData.Name) || postData.Name.trim() === '') {
      ElAlert('请填写 方案名称！', '提示')
      return null
    }
    // 电价设置验证
    let PriceContent = editPriceContent.map((pc, pcIndex) => {
      let item = {
        DateStart: moment(pc.DateStart).format('M/D'),
        DateEnd: moment(pc.DateEnd).format('M/D'),
        PriceType: pc.PriceType,
        StepPrice: pc.StepPrice
      }
      if (pc.StepPrice) {
        // 阶梯电价
        if (isEmpty(pc.SettlDay)) {
          ElAlert(`请选择 电价设置：时段${pcIndex + 1} - 结算日！`, '提示')
          return null
        } else {
          item.SettlDay = pc.SettlDay
        }
        let periods = {}
        let periodsValid = pc.PricePeriod.some((p, index, arr) => {
          let period = periods[index + 1] = {}
          // 判断电价方式
          if (pc.PriceType) {
            // 统一电价
            if (isEmpty(p.AvgPrice)) {
              ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 总电价！`, '提示')
              return true
            } else {
              period.AvgPrice = p.AvgPrice
            }
          } else {
            // 分时电价
            if (index === arr.length - 1) {
              if (isEmpty(p.EleDownLine)) {
                ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 电量上限！`, '提示')
                return true
              }
              period.EleDownLine = p.EleDownLine
            } else {
              if (isEmpty(p.EleUpLine)) {
                ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 电量下限！`, '提示')
                return true
              }
              period.EleUpLine = p.EleUpLine
            }
            if (isEmpty(p.Point)) {
              ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 尖电价！`, '提示')
              return true
            }
            if (isEmpty(p.Peak)) {
              ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 峰电价！`, '提示')
              return true
            }
            if (isEmpty(p.Flat)) {
              ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 平电价！`, '提示')
              return true
            }
            if (isEmpty(p.Valley)) {
              ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 第${index + 1}阶梯 - 谷电价！`, '提示')
              return true
            }
            period.Point = p.Point
            period.Peak = p.Peak
            period.Flat = p.Flat
            period.Valley = p.Valley
          }
        })
        if (periodsValid) {
          return null
        } else {
          item.PricePeriod = periods
        }
      } else {
        // 非阶梯电价
        let period = {}
        let p = pc.PricePeriod[0]
        // 判断电价方式
        if (pc.PriceType) {
          // 统一电价
          let avg = p.AvgPrice
          if (isEmpty(avg)) {
            ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 总电价！`, '提示')
            return null
          } else {
            period.AvgPrice = avg
          }
        } else {
          // 分时电价
          if (isEmpty(p.Point)) {
            ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 尖电价！`, '提示')
            return null
          }
          if (isEmpty(p.Peak)) {
            ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 峰电价！`, '提示')
            return null
          }
          if (isEmpty(p.Flat)) {
            ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 平电价！`, '提示')
            return null
          }
          if (isEmpty(p.Valley)) {
            ElAlert(`请填写 电价设置：时段${pcIndex + 1} - 谷电价！`, '提示')
            return null
          }
          period.Point = p.Point
          period.Peak = p.Peak
          period.Flat = p.Flat
          period.Valley = p.Valley
        }
        item.PricePeriod = { 1: period }
      }
      return item
    })
    if (PriceContent.some(p => isEmpty(p))) {
      return null
    }
    postData.PriceContent = PriceContent
    // 执行房间验证
    if (isEmpty(postData.GroupIds) || !postData.GroupIds.length) {
      ElAlert('请选择 执行房间！', '提示')
      return null
    }
    return postData
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
      DateStart: moment().startOf('year').toDate(),
      DateEnd: moment().endOf('year').toDate(),
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
