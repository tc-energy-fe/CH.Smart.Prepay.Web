import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'
import moment from 'moment'

const state = {
  reqCancels: new Map(),
  projectTypes: {},
  projectList: [],
  typeId: null,
  editTypeId: null,
  isModify: false,
  editData: {
    Name: '',
    Type: 0,
    Decs: ''
  }
}

const getters = {}

const actions = {
  ...Actions,
  setEditData ({ state, commit, dispatch }, data) {
    commit(types.SET_DATA, { item: 'isModify', value: { Name: '', Type: 0, Decs: '' } })
    if (data) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      Object.keys(state.editData).forEach(k => {
        state.editData[k] = data[k] || null
      })
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
    }
  },
  getProjectType ({ state, getters, commit, dispatch }) {
    let getProjectTypeReq = api.project.getProjectType()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectTypeReq', value: getProjectTypeReq.cancel })
    getProjectTypeReq.request.then(res => {
      let data = res.Data || {}
      let typeList = Object.keys(data) || []
      commit(types.SET_DATA, { item: 'typeId', value: typeList[0] || null })
      commit(types.SET_DATA, { item: 'editTypeId', value: typeList[0] || null })
      commit(types.SET_DATA, { item: 'projectTypes', value: data })
      dispatch('getProjectList')
    }).catch(err => {
      console.error(err)
    }).finally(() => {})
  },
  getProjectList ({ state, getters, commit }) {
    let getProjectListReq = api.project.getProjectList()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectListReq', value: getProjectListReq.cancel })
    getProjectListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(p => {
        p.typeText = state.projectTypes[p.Type] || '-'
        p.CreateTime = moment(p.CreateTime).format('YYYY-MM-DD HH:mm')
      })
      commit(types.SET_DATA, { item: 'projectList', value: data })
    }).catch(err => {
      console.error(err)
    }).finally(() => {})
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
