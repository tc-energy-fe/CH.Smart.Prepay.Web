import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import { upload } from '@/utils/file'

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchDeviceTypeId: null,
  deviceTypeList: [],
  currentPage: 1,
  pageSize: 10,
  gatewayList: [],
  isLoadingGatewayList: false,
  totalCount: 0,
  isShowEdit: false,
  editData: {
    GatewaySN: '',
    Name: '',
    TypeId: null,
    Address: ''
  }
}

const getters = {
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId
}

const actions = {
  ...Actions,
  showAddEdit ({ state, commit, dispatch }, isShow) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    let editData = {
      GatewaySN: '',
      Name: '',
      TypeId: state.deviceTypeList[0].value || null,
      Address: ''
    }
    commit(types.SET_DATA, { item: 'editData', value: editData })
    commit(types.SET_DATA, { item: 'isShowEdit', value: isShow })
  },
  getGatewayType ({ state, getters, commit, dispatch }) {
    let getGatewayTypeReq = api.gateway.getGatewayType()
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayTypes', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayTypeReq', value: getGatewayTypeReq.cancel })
    getGatewayTypeReq.request.then(res => {
      let data = res.Data || []
      let typeList = Object.entries(data).map(item => ({
        value: item[0],
        label: item[1]
      }))
      commit(types.SET_DATA, { item: 'deviceTypeList', value: typeList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayTypes', value: false })
    })
  },
  getGatewayList ({ state, getters, commit }) {
    let postData = {
      ProjectId: getters.projectId,
      Name: state.searchName,
      PageIndex: state.currentPage,
      PageSize: state.pageSize
    }
    // let type = state.searchDeviceTypeId
    // if (!isEmpty(type) && type !== -1) postData.TypeId = type
    let getGatewayListReq = api.gateway.getGatewayList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayListReq', value: getGatewayListReq.cancel })
    getGatewayListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'gatewayList', value: data })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: false })
    })
  },
  validateData ({ state, getters, commit }) {
    let postData = Object.assign({
      ProjectId: getters.projectId
    }, state.editData)
    if (isEmpty(postData.GatewaySN) || postData.GatewaySN === '') {
      ElAlert('请填写设备编码！', '提示')
      return null
    }
    if (isEmpty(postData.Name) || postData.Name === '') {
      ElAlert('请填写设备名称！', '提示')
      return null
    }
    // if (isEmpty(postData.TypeId)) {
    //   ElAlert('请选择设备类型！', '提示')
    //   return null
    // }
    return postData
  },
  addGateway ({ state, getters, commit, dispatch }) {
    dispatch('validateData').then(res => {
      if (!res) {
        return
      }
      let addGatewayListReq = api.gateway.addGateway(res)
      commit(types.SET_LOADING_STATUS, { item: 'isAddingGateway', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'addGatewayListReq', value: addGatewayListReq.cancel })
      addGatewayListReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('showAddEdit', false)
        dispatch('getGatewayList')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isAddingGateway', value: false })
      })
    })
  },
  uploadFile ({ state, commit, dispatch }) {
    upload().then(res => {
      let uploadFileReq = api.file.uploadFile(res)
      commit(types.SET_LOADING_STATUS, { item: 'isUploadingFile', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'uploadFileReq', value: uploadFileReq.cancel })
      uploadFileReq.request.then(res => {
        dispatch('importGateway', res.Data)
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isUploadingFile', value: false })
      })
    })
  },
  importGateway ({ state, getters, commit, dispatch }, fileId) {
    let importGatewayReq = api.gateway.importGateway({
      fileId: fileId,
      projectId: getters.projectId
    })
    commit(types.SET_LOADING_STATUS, { item: 'isImportGateway', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'importGatewayReq', value: importGatewayReq.cancel })
    importGatewayReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getGatewayList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isImportGateway', value: false })
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
