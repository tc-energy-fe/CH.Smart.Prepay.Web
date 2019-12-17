import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'
import { upload } from '@/utils/file'
// import * as types from '@/store/mutation-types'
// import api from '@/api/analysis'
// import apiUrl from '@/api/analysis/apiUrl'
// import moment from 'moment'

const state = {
  reqCancels: new Map(),
  branchTypeList: [
    { value: -1, label: '全部分支类型' },
    { value: true, label: '总表' },
    { value: false, label: '分表' }
  ],
  settleTypeList: [
    { value: -1, label: '全部结算类型' },
    { value: true, label: '结算' },
    { value: false, label: '不结算' }
  ],
  searchName: '',
  searchBranchTypeId: null,
  searchSettleTypeId: null,
  currentPage: 1,
  pageSize: 10,
  deviceList: [],
  totalCount: 0,
  isLoadingDeviceList: false,
  isShowEdit: false,
  editData: {
    Id: null
  },
  isModify: false,
  editEleTypeList: [],
  editGatewayList: []
}

const getters = {
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId
}

const actions = {
  ...Actions,
  showEdit ({ state, commit, dispatch }, { isShow, data }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    dispatch('getEleType')
    dispatch('getGatewayList')
    commit(types.SET_DATA, {
      item: 'editData',
      value: {
        Id: null,
        PDeviceSN: '',
        PCategory: 1,
        LDeviceType: null, // 控费方式
        GatewayId: null,
        EMeterModel: null, // 电表模块
        IsSum: null, // 分支类型
        IsSettle: true, // 是否结算
        StartPointed: null,
        StartTotal: null,
        StartPeak: null,
        StartFlat: null,
        StartValley: null,
        Manufacturer: '',
        Address: '',
        Status: 0,
        Rate: null
      }
    })
    if (data) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: data[k] })
      })
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getEleType ({ state, getters, commit }) {
    let getEleTypeReq = api.device.getDeviceEleType()
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingEleType', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getEleTypeReq', value: getEleTypeReq.cancel })
    getEleTypeReq.request.then(res => {
      let data = res.Data || []
      let list = Object.entries(data).map(t => ({
        value: t[0],
        label: t[1]
      }))
      commit(types.SET_DATA, { item: 'editEleTypeList', value: list })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingEleType', value: false })
    })
  },
  getGatewayList ({ state, getters, commit }) {
    let getGatewayListReq = api.gateway.getGatewayList({
      ProjectId: getters.projectId
    })
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayListReq', value: getGatewayListReq.cancel })
    getGatewayListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'editGatewayList', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: false })
    })
  },
  getDeviceList ({ state, getters, commit }) {
    let postData = {
      ProjectId: getters.projectId,
      PCategory: 1, // 电
      Name: state.searchName,
      PageIndex: state.currentPage,
      PageSize: state.pageSize
    }
    let isSum = state.searchBranchTypeId
    let isSettle = state.searchSettleTypeId
    if (!isEmpty(isSum) && isSum !== -1) postData.IsSum = isSum
    if (!isEmpty(isSettle) && isSettle !== -1) postData.IsSettle = isSettle
    let getDeviceListReq = api.device.getDeviceList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingDeviceList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getDeviceListReq', value: getDeviceListReq.cancel })
    getDeviceListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(d => {
        let IsSumText = state.branchTypeList.find(b => b.value === d.IsSum)
        d.IsSumText = isEmpty(IsSumText) ? '' : IsSumText.label
        d.IsSettleText = isEmpty(d.IsSettle) ? '-' : (d.IsSettle ? '是' : '否')
      })
      commit(types.SET_DATA, { item: 'deviceList', value: data })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingDeviceList', value: false })
    })
  },
  validateData ({ state, getters, commit }) {
    let editData = state.editData
    let postData = {
      ProjectId: getters.projectId
    }
    if (state.isModify) {
      Object.assign(postData, {
        Id: editData.Id,
        Rate: editData.Rate,
        Address: editData.Address || '',
        Manufacturer: editData.Manufacturer || '',
        Status: editData.Status
      })
      if (isEmpty(postData.Rate) || postData.Rate === '') {
        ElAlert('倍率不能为空！', '提示')
        return null
      }
    } else {
      let requiredKeys = {
        PDeviceSN: '仪表编号',
        GatewayId: '所属网关',
        IsSum: '分支类型',
        LDeviceType: '费控方式',
        IsSettle: '是否结算',
        Rate: '倍率',
        StartTotal: '初始总读数',
        StartPointed: '初始尖读数',
        StartPeak: '初始峰读数',
        StartFlat: '初始平读数',
        StartValley: '初始谷读数',
        Status: '启用状态'
      }
      let isValidate = Object.entries(requiredKeys).some(item => {
        let value = editData[item[0]]
        if (isEmpty(value) || value === '') {
          ElAlert(`${item[1]}不能为空！`, '提示')
          return true
        } else {
          postData[item[0]] = value
          return false
        }
      })
      if (isValidate) {
        return null
      } else {
        if (!isEmpty(editData.EMeterModel)) postData.EMeterModel = editData.EMeterModel
        postData.Manufacturer = editData.Manufacturer || ''
        postData.Address = editData.Address || ''
      }
    }
    return postData
  },
  editDevice ({ state, getters, commit, dispatch }) {
    dispatch('validateData').then(res => {
      if (!res) {
        return
      }
      console.log(res)
      let editDeviceReq = state.isModify ? api.device.modifyDevice(res) : api.device.addDevice(res)
      commit(types.SET_LOADING_STATUS, { item: 'isEditingDevice', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'editDeviceReq', value: editDeviceReq.cancel })
      editDeviceReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('getDeviceList')
        dispatch('showEdit', { isShow: false })
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isEditingDevice', value: false })
      })
    })
  },
  uploadFile ({ state, commit, dispatch }) {
    upload().then(res => {
      console.log(res)
      let uploadFileReq = api.file.uploadFile(res)
      commit(types.SET_LOADING_STATUS, { item: 'isUploadingFile', value: true })
      commit(types.ADD_REQUEST_CANCEL, { item: 'uploadFileReq', value: uploadFileReq.cancel })
      uploadFileReq.request.then(res => {
        dispatch('importDevice', res.Data)
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {
        commit(types.SET_LOADING_STATUS, { item: 'isUploadingFile', value: false })
      })
    })
  },
  importDevice ({ state, getters, commit, dispatch }, fileId) {
    let importDeviceReq = api.device.importDevice({
      fileId: fileId,
      projectId: getters.projectId,
      category: 1
    })
    commit(types.SET_LOADING_STATUS, { item: 'isImportDevice', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'importDeviceReq', value: importDeviceReq.cancel })
    importDeviceReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getDeviceList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isImportDevice', value: false })
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
