import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'

const TOTAL_OPTION_VALUE = 'total'
const STATUS_ENABLED_VALUE = 0
const STATUS_DISABLED_VALUE = 3

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchTypeId: TOTAL_OPTION_VALUE,
  searchStatusId: TOTAL_OPTION_VALUE,
  searchRoleTypeList: [],
  searchStatusList: [
    { label: '全部状态', value: TOTAL_OPTION_VALUE },
    { label: '启用', value: STATUS_ENABLED_VALUE },
    { label: '停用', value: STATUS_DISABLED_VALUE }
  ],
  userList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isLoadingUserList: false,
  isShowEdit: false,
  isModify: false,
  editData: {
    Id: null,
    AccountName: '',
    Password: '',
    UserName: '',
    RoleId: null,
    PhoneNo: '',
    Status: STATUS_ENABLED_VALUE,
    ProjectGroups: []
  },
  editRoleList: [],
  editGroupTreeData: []
}

const getters = {
}

const actions = {
  ...Actions,
  showEdit ({ commit, state, getters, dispatch }, { isShow = true, row } = { isShow: true }) {
    if (!isShow) {
      // 清空表单
      commit(types.SET_DATA, {
        item: 'editData',
        value: {
          Id: null,
          AccountName: '',
          Password: '',
          UserName: '',
          RoleId: null,
          PhoneNo: '',
          Status: STATUS_ENABLED_VALUE,
          ProjectGroups: []
        }
      })
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
        dispatch('getProjectGroupList', row.CreatorId)
        dispatch('getRoleListData', row.CreatorId)
        dispatch('getSingleUserData', row.Id)
      } else {
        // 添加模式
        commit(types.SET_DATA, { item: 'isModify', value: false })
      }
    }
    commit(types.SET_DATA, { item: 'isShowEdit', value: isShow })
  },
  getRoleType ({ commit, state, getters, dispatch }, canEdit = false) {
    let getRoleTypeReq = api.role.getRoleCreateType(canEdit)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleTypeReq', value: getRoleTypeReq.cancel })
    getRoleTypeReq.request.then(res => {
      let data = res.Data || {}
      if (canEdit) {
        // 有编辑权限的角色列表
        let roleTypeList = Object.entries(data).map(([key, value]) => ({
          label: value,
          value: parseInt(key)
        }))
        commit(types.SET_DATA, { item: 'searchRoleTypeList', value: roleTypeList })
        dispatch('getUserListData')
      } else {
      }
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getUserListData ({ commit, state, getters, dispatch }) {
    let params = {
      q: state.searchName,
      pageSize: state.pageSize,
      pageIndex: state.currentPage
    }
    if (state.searchTypeId === null || state.searchTypeId === TOTAL_OPTION_VALUE) {
      delete params.type
    }
    let getUserListReq = api.user.getUserManage(params)
    commit(types.SET_DATA, { item: 'isLoadingUserList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getUserListReq', value: getUserListReq.cancel })
    getUserListReq.request.then(res => {
      let data = res.Data || []
      let searchRoleTypeList = state.searchRoleTypeList
      let searchStatusList = state.searchStatusList
      let userList = data.map(item => {
        return Object.assign({}, item, {
          RoleTypeText: searchRoleTypeList.find(type => (type.value === item.RoleType)).label,
          StatusText: searchStatusList.find(status => (status.value === item.Status)).label
        })
      })
      commit(types.SET_DATA, { item: 'userList', value: userList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_DATA, { item: 'isLoadingUserList', value: false })
    })
  },
  getRoleListData ({ commit, state, getters, dispatch }, uid = 1109) {
    let params = {
      uid: uid
    }
    let getRoleListReq = api.role.getRoleList(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleListReq', value: getRoleListReq.cancel })
    getRoleListReq.request.then(res => {
      let data = res.Data || []
      let editRoleList = data.map(item => ({
        label: item.RoleName,
        value: item.RoleId
      }))
      commit(types.SET_DATA, { item: 'editRoleList', value: editRoleList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getProjectGroupList ({ commit, state, getters, dispatch }, uid = 1109) {
    let getProjectGroupReq = api.project.getProjectGroupByUser(uid)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectGroupReq', value: getProjectGroupReq.cancel })
    getProjectGroupReq.request.then(res => {
      let data = res.Data || []
      let groupTempList = []
      data.forEach(item => {
        groupTempList.push({
          Id: item.Id,
          Name: item.Name,
          Path: '/',
          Level: 0
        })
        if (item.Groups) {
          groupTempList.push(...item.Groups)
        }
      })
      let editGroupTreeData = initTree(groupTempList)
      commit(types.SET_DATA, { item: 'editGroupTreeData', value: editGroupTreeData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getSingleUserData ({ commit, state, getters, dispatch }, id) {
    let getSingleUserReq = api.user.getUserManageDetail(id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSingleUserReq', value: getSingleUserReq.cancel })
    getSingleUserReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'editData', value: Object.assign({}, state.editData, data) })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  validateData ({ commit, state, getters, dispatch }) {
    let editData = state.editData
    if (editData.UserName.trim() === '') {
      ElAlert('用户名为空！', '表单错误').then(() => {})
      return false
    }
    if (editData.AccountName.trim() === '') {
      ElAlert('登录名为空！', '表单错误').then(() => {})
      return false
    }
    if (editData.PhoneNo.trim() === '') {
      ElAlert('电话号码为空！', '表单错误').then(() => {})
      return false
    }
    if (editData.RoleId === null) {
      ElAlert('角色名称为空！', '表单错误').then(() => {})
      return false
    }
    if (editData.ProjectGroups.length === 0) {
      ElAlert('区域权限为空！', '表单错误').then(() => {})
      return false
    }
    if (!state.isModify) {
      if (editData.Password.trim() === '') {
        ElAlert('新建用户默认密码为 123456！', '提示').then(() => {})
      }
    } else {
      if (editData.Password.trim() === '') {
        ElAlert('编辑用户密码不会重置', '提示').then(() => {})
      }
    }
    return true
  },
  addUserData ({ commit, state, getters, dispatch }) {
    dispatch('validateData').then(result => {
      if (result) {
        let editData = state.editData
        let postData = {
          AccountName: editData.AccountName,
          Password: editData.Password.trim() === '' ? '123456' : editData.Password,
          UserName: editData.UserName,
          RoleId: editData.RoleId,
          PhoneNo: editData.PhoneNo,
          Status: editData.Status,
          ProjectGroups: editData.ProjectGroups.map(project => {
            let targetItem = {
              Id: project.Id,
              Name: project.Name
            }
            project.Groups && (targetItem.Groups = project.Groups.map(group => ({ Id: group.Id })))
            return targetItem
          })
        }
        let addUserDataReq = api.user.postUserManage(postData)
        commit(types.ADD_REQUEST_CANCEL, { item: 'addUserDataReq', value: addUserDataReq.cancel })
        addUserDataReq.request.then(res => {
          commit(types.CHECKOUT_SUCCEED, res.State)
          dispatch('getUserListData')
          dispatch('showEdit', { isShow: false })
        }).catch(err => {
          commit(types.CHECKOUT_FAILURE, err)
        })
      }
    })
  },
  saveUserData ({ commit, state, getters, dispatch }) {
    dispatch('validateData').then(result => {
      if (result) {
        let editData = state.editData
        let postData = {
          Id: editData.Id,
          AccountName: editData.AccountName,
          UserName: editData.UserName,
          RoleId: editData.RoleId,
          PhoneNo: editData.PhoneNo,
          Status: editData.Status,
          ProjectGroups: editData.ProjectGroups.map(project => {
            let targetItem = {
              Id: project.Id,
              Name: project.Name
            }
            project.Groups && (targetItem.Groups = project.Groups.map(group => ({ Id: group.Id })))
            return targetItem
          })
        }
        if (editData.Password.trim() !== '') {
          postData.Password = editData.Password
        }
        let saveUserDataReq = api.user.putUserManage(postData)
        commit(types.ADD_REQUEST_CANCEL, { item: 'saveUserDataReq', value: saveUserDataReq.cancel })
        saveUserDataReq.request.then(res => {
          commit(types.CHECKOUT_SUCCEED, res.State)
          dispatch('getUserListData')
          dispatch('showEdit', { isShow: false })
        }).catch(err => {
          commit(types.CHECKOUT_FAILURE, err)
        })
      }
    })
  },
  changeUserStatus ({ commit, state, getters, dispatch }, { row, status = STATUS_ENABLED_VALUE }) {
    ElConfirm(`确认要${status === STATUS_ENABLED_VALUE ? '启用' : (status === STATUS_DISABLED_VALUE ? '停用' : '停用')}此用户${row.UserName}`, '提示').then(() => {
      let postData = {
        Id: row.Id,
        Status: status
      }
      let changeUserStatusReq = api.user.putUserManageStatus(postData)
      commit(types.ADD_REQUEST_CANCEL, { item: 'changeUserStatusReq', value: changeUserStatusReq.cancel })
      changeUserStatusReq.request.then(res => {
        commit(types.CHECKOUT_SUCCEED, res.State)
        dispatch('getUserListData')
      }).catch(err => {
        commit(types.CHECKOUT_FAILURE, err)
      })
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
