import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
// import * as types from '@/store/mutation-types'
// import api from '@/api/analysis'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'
// import moment from 'moment'

const state = {
  reqCancels: new Map(),
  searchName: '',
  priceList: [],
  isLoadingPriceList: false
}

const getters = {
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId
}

const actions = {
  ...Actions,
  getPriceList ({ state, getters, commit }) {
    let postData = {
      ProjectId: getters.projectId,
      Name: state.searchName,
      SchemeType: 0 // 电价方案
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
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingPriceList', value: false })
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
