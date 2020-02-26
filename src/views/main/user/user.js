import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import api from '@/api'
import * as types from '@/store/mutation-types'

const state = {
  reqCancels: new Map(),
  editData: {
    Id: null,
    UserName: '',
    PhoneNo: '',
    AccountName: '',
    Password: ''
  },
  isLoadingInfo: false
}

const getters = {
}

const actions = {
  ...Actions,
  resetFormData ({ commit, state, getters, dispatch }) {
    commit(types.SET_DATA, {
      item: 'editData',
      value: {
        Id: null,
        UserName: '',
        PhoneNo: '',
        AccountName: '',
        Password: ''
      }
    })
  },
  getUserInfo ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    // 通过Token获取当前用户的详情，不需要传入id
    let getUserInfoReq = api.user.getUserManageDetail()
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingInfo', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getUserInfoReq', value: getUserInfoReq.cancel })
    getUserInfoReq.request.then(res => {
      let data = res.Data || {}
      commit(types.SET_DATA, { item: 'editData', value: Object.assign({}, state.editData, data) })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingInfo', value: false })
    })
  },
  validateForm ({ commit, state, rootState, getters, dispatch }) {
    let editData = state.editData
    if (editData.UserName.trim() === '') {
      ElAlert('用户姓名为空！', '提示').then(() => {})
      return false
    }
    if (editData.PhoneNo === '') {
      ElAlert('手机号为空！', '提示').then(() => {})
      return false
    }
    return true
  },
  saveUserInfo ({ commit, state, getters, rootState, rootGetters, dispatch }) {
    dispatch('validateForm').then(result => {
      if (result) {
        let editData = state.editData
        let postData = {
          Id: editData.Id,
          UserName: editData.UserName,
          PhoneNo: editData.PhoneNo,
          AccountName: editData.AccountName
        }
        if (editData.Password.trim() !== '') {
          postData.Password = editData.Password
        }
        let isModifyPassword = !isEmpty(postData.Password)
        let saveUserInfoReq = api.user.putUserManage(postData)
        commit(types.ADD_REQUEST_CANCEL, { item: 'saveUserInfoReq', value: saveUserInfoReq.cancel })
        saveUserInfoReq.request.then(res => {
          if (isModifyPassword) {
            ElAlert('修改个人信息成功，跳转至登录...', '提示').finally(() => {})
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          } else {
            commit(types.CHECKOUT_SUCCEED, res.State)
            dispatch('getUserInfo')
            dispatch('getUserManage', null, { root: true })
          }
        }).catch(err => {
          commit(types.CHECKOUT_FAILURE, err)
        })
      }
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
