import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'
// import moment from 'moment'

const state = {
  reqCancels: new Map(),
  isLoadingRoomList: false,
  currentNode: {},
  roomList: [],
  isShowEdit: false,
  currentPage: 1,
  searchData: {
    Name: '',
    RoomNo: ''
  },
  editData: {
    Id: null,
    Name: '',
    GroupNo: ''
  },
  editParentId: null,
  isModify: false,
  gatewayList: [],
  editGatewayId: null,
  isLoadingGatewayList: false,
  gatewayDeviceList: [],
  editGatewayDeviceId: null,
  editGatewayDeviceName: '',
  editParentName: '',
  isLoadingGatewayDeviceList: false,
  editDeviceName: ''
}

const getters = {
  mainGroupList: (state, getters, rootState) => rootState.mainGroupList,
  groupTree: (state, getters, rootState) => rootState.mainGroupTreeHasRoot,
  projectId: (state, getters, rootState, rootGetters) => rootGetters.projectId,
  currentNodeId: state => state.currentNode.value
}

const actions = {
  ...Actions,
  nodeOnChange ({ state, commit, dispatch }, val) {
    commit(types.SET_DATA, { item: 'currentNode', value: val })
    dispatch('getRoomList')
  },
  showEdit ({ state, commit, dispatch }, { data, isShow = true }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      commit(types.SET_DATA, { item: 'editData', value: { Id: null, Name: '', GroupNo: '' } })
      commit(types.SET_DATA, { item: 'editParentId', value: -1 })
      commit(types.SET_DATA, { item: 'editGatewayId', value: null })
      commit(types.SET_DATA, { item: 'editGatewayDeviceId', value: null })
      return
    }
    dispatch('getGatewayList')
    if (data) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: data[k] })
      })
      commit(types.SET_DATA, { item: 'editGatewayDeviceName', value: data.EMeterSN || '--' })
      commit(types.SET_DATA, { item: 'editParentName', value: data.ParentFullName || '--' })
      commit(types.SET_DATA, { item: 'editParentId', value: data.ParentId })
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getRoomList ({ state, getters, commit, dispatch }) {
    dispatch('currentPageOnChange', 1)
    let groupId = getters.currentNodeId
    let postData = Object.assign({
      ProjectId: getters.projectId
    }, state.searchData)
    if (!isEmpty(groupId) && groupId !== getters.projectId) postData.GroupId = groupId
    let getRoomListReq = api.group.getRoomList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoomListReq', value: getRoomListReq.cancel })
    getRoomListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'roomList', value: data })
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingRoomList', value: false })
    })
  },
  getGatewayList ({ state, getters, commit, dispatch }) {
    let postData = {
      ProjectId: getters.projectId
    }
    let getGatewayListReq = api.gateway.getGatewayList(postData)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayListReq', value: getGatewayListReq.cancel })
    getGatewayListReq.request.then(res => {
      let data = res.Data || []
      commit(types.SET_DATA, { item: 'editGatewayId', value: data[0] ? data[0].GatewayId : null })
      commit(types.SET_DATA, { item: 'gatewayList', value: data })
      dispatch('getGatewayDeviceList')
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayList', value: false })
    })
  },
  getGatewayDeviceList ({ state, getters, commit, dispatch }) {
    let gid = state.editGatewayId
    if (isEmpty(gid)) {
      commit(types.SET_DATA, { item: 'editGatewayDeviceId', value: null })
      commit(types.SET_DATA, { item: 'gatewayDeviceList', value: [] })
      return
    }
    let getGatewayDeviceListReq = api.device.getDeviceByGateway(getters.projectId, gid)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayDeviceList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getGatewayDeviceListReq', value: getGatewayDeviceListReq.cancel })
    getGatewayDeviceListReq.request.then(res => {
      let data = res.Data || []
      let deviceList = data.map(d => ({
        value: d.Id,
        label: d.Name
      }))
      if (isEmpty(state.editGatewayDeviceId)) {
        commit(types.SET_DATA, { item: 'editGatewayDeviceId', value: deviceList[0] ? deviceList[0].value : null })
      }
      commit(types.SET_DATA, { item: 'gatewayDeviceList', value: deviceList })
    }).catch(err => {
      console.error(err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingGatewayDeviceList', value: false })
    })
  },
  editRoom ({ state, getters, commit, dispatch }) {
    let editData = state.editData
    let postData = {
      ProjectId: getters.projectId,
      Name: editData.Name
    }
    if (!postData.Name || postData.Name === '') {
      ElAlert('请填写房间名称！', '提示').then(() => {})
      return
    }
    if (state.isModify) {
      postData.Id = editData.Id
    } else {
      let parentId = state.editParentId
      if (isEmpty(parentId) || parentId === -1) {
        ElAlert('请选择所属区域！', '提示').then(() => {})
        return
      } else {
        postData.ParentId = parentId
      }
      if (!isEmpty(state.editGatewayDeviceId) && state.editGatewayDeviceId !== -1) {
        postData.EMeterId = state.editGatewayDeviceId
      }
    }
    let editRoomReq = state.isModify ? api.group.modifyRoom(postData) : api.group.addRoom(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'editRoomReq', value: editRoomReq.cancel })
    editRoomReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getRoomList')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {})
  },
  deleteRoom ({ state, commit, dispatch }, data) {
    ElConfirm(`确定要删除区域 ${data.Name} 吗？`, '提示').then(() => {
      let deleteRoomReq = api.group.deleteRoom(data.Id)
      commit(types.ADD_REQUEST_CANCEL, { item: 'deleteRoomReq', value: deleteRoomReq.cancel })
      deleteRoomReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('getRoomList')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      }).finally(() => {})
    }).catch(() => {
    })
  },
  importRoom ({ state, getters, commit, dispatch }) {
    let el = document.createElement('input')
    el.type = 'file'
    el.style.display = 'none'
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
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
