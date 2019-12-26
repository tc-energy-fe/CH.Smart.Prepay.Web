import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'
import moment from 'moment'

const OFF_IMMEDIATE = 0
const OFF_DELAY = 1

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
    [OFF_IMMEDIATE]: '立即拉闸',
    [OFF_DELAY]: '延时拉闸'
  },
  editData: {
    Name: '',
    Id: null,
    Status: 0,
    GroupIds: [],
    WarnValue: '',
    SNS: false,
    OffType: 0,
    OffRange: [new Date(), new Date()]
  },
  editTreeData: []
}

const getters = {
  offTypeList: (state, getters) => (Object.entries(state.offTypeText).map(([id, text]) => ({
    label: text,
    value: parseInt(id)
  }))),
  offTypeIsDelay: (state, getters) => {
    return state.editData.OffType === OFF_DELAY
  }
}

const actions = {
  ...Actions,
  showEdit ({ commit, state, getters, dispatch }, { isShow = true, row } = { isShow: true }) {
    if (!isShow) {
      commit(types.SET_DATA, {
        item: 'editData',
        value: {
          Name: '',
          Id: null,
          Status: 0,
          GroupIds: [],
          WarnValue: '',
          SNS: false,
          OffType: 0,
          OffRange: [new Date(), new Date()]
        }
      })
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
        dispatch('getGroupListEdit', row.Id)
        dispatch('getSingleScheme', row.Id)
      } else {
        // 添加模式
        commit(types.SET_DATA, { item: 'isModify', value: false })
        dispatch('getGroupListEdit')
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
  },
  getGroupListEdit ({ commit, state, rootState, getters, dispatch }, configId = null) {
    let params = {
      projectId: rootState.areaId,
      schemeType: 1
    }
    if (!isEmpty(configId)) {
      params.configId = configId
    }
    let getGroupListEditReq = !isEmpty(configId) ? api.group.getRoomConfigEditList(params) : api.group.getRoomConfigAddList(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGroupListEditReq', value: getGroupListEditReq.cancel })
    getGroupListEditReq.request.then(res => {
      let data = res.Data || []
      let editTreeData = initTree(data, { rootLevel: 1 })
      commit(types.SET_DATA, { item: 'editTreeData', value: editTreeData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getSingleScheme ({ commit, state, rootState, getters, dispatch }, id) {
    let getSingleSchemeReq = api.scheme.getSchemeDetail(id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSingleSchemeReq', value: getSingleSchemeReq.cancel })
    getSingleSchemeReq.request.then(res => {
      let data = res.Data || {}
      console.log(data)
      commit(types.SET_DATA, {
        item: 'editData',
        value: {
          Name: data.Name,
          Id: data.Id,
          Status: data.Status,
          GroupIds: data.GroupIds,
          WarnValue: data.BalanceContent.WarnValue,
          SNS: data.BalanceContent.SNS,
          OffType: data.BalanceContent.OffType,
          OffRange: [moment(`2019-12-26 ${data.BalanceContent.OffRangeStart}`).toDate(), moment(`2019-12-26 ${data.BalanceContent.OffRangeEnd}`).toDate()]
        }
      })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  editSchemeData ({ commit, state, rootState, getters, dispatch }) {
    let editData = state.editData
    let postData = {
      ProjectId: rootState.areaId,
      Name: editData.Name,
      SchemeType: 1,
      GroupIds: editData.GroupIds,
      Status: editData.Status,
      BalanceContent: {
        WarnValue: editData.WarnValue,
        SNS: editData.SNS,
        OffType: editData.OffType
      }
    }
    if (editData.OffType === OFF_DELAY) {
      postData.BalanceContent = Object.assign({}, postData.BalanceContent, {
        OffRangeStart: moment(editData.OffRange[0]).format('HH:mm'),
        OffRangeEnd: moment(editData.OffRange[1]).format('HH:mm')
      })
    }
    if (state.isModify) {
      postData.Id = editData.Id
    }
    let editSchemeDataReq = state.isModify ? api.scheme.modifyScheme(postData) : api.scheme.addScheme(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'editSchemeDataReq', value: editSchemeDataReq.cancel })
    editSchemeDataReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getWarnSchemeList')
      dispatch('getRoomList')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
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
