import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
// import apiUrl from '@/api/analysis/apiUrl'
// import download from '@/utils/download'
import moment from 'moment'

const state = {
  reqCancels: new Map(),
  projectTypeList: [],
  projectList: [],
  currentPage: 1,
  typeId: null,
  editTypeId: null,
  isModify: false,
  searchName: '',
  editData: {
    Id: null,
    Name: '',
    Desc: ''
  },
  isShowEdit: false,
  isLoadingProjectList: false
}

const getters = {}

const actions = {
  ...Actions,
  showEdit ({ state, commit, dispatch }, { data, isShow = true }) {
    if (!isShow) {
      commit(types.SET_DATA, { item: 'isShowEdit', value: false })
      return
    }
    let typeList = state.projectTypeList
    commit(types.SET_DATA, { item: 'editData', value: { Id: null, Name: '', Desc: '' } })
    commit(types.SET_DATA, { item: 'editTypeId', value: typeList[0] ? typeList[0].value : null })
    if (data) {
      commit(types.SET_DATA, { item: 'isModify', value: true })
      Object.keys(state.editData).forEach(k => {
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: k, value: data[k] })
      })
      let type = data.Type
      commit(types.SET_DATA, { item: 'editTypeId', value: window.isEmpty(type) ? null : type })
    } else {
      commit(types.SET_DATA, { item: 'isModify', value: false })
    }

    commit(types.SET_DATA, { item: 'isShowEdit', value: true })
  },
  getProjectType ({ state, getters, commit, dispatch }) {
    let getProjectTypeReq = api.project.getProjectType()
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectTypeReq', value: getProjectTypeReq.cancel })
    getProjectTypeReq.request.then(res => {
      let data = res.Data || {}
      let typeList = []
      let protypes = Object.entries(data) || []
      protypes.forEach(type => {
        typeList.push({
          value: Number(type[0]),
          label: type[1]
        })
      })
      commit(types.SET_DATA, { item: 'typeId', value: typeList[0] ? typeList[0].value : null })
      commit(types.SET_DATA, { item: 'editTypeId', value: typeList[0] ? typeList[0].value : null })
      commit(types.SET_DATA, { item: 'projectTypeList', value: typeList })
      dispatch('getProjectList')
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {})
  },
  getProjectList ({ state, getters, commit, dispatch }) {
    dispatch('currentPageOnChange', 1)
    let params = {
      name: state.searchName
    }
    if (!window.isEmpty(state.typeId)) params.type = state.typeId
    let getProjectListReq = api.project.getProjectList(params)
    commit(types.SET_LOADING_STATUS, { item: 'isLoadingProjectList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectListReq', value: getProjectListReq.cancel })
    getProjectListReq.request.then(res => {
      let data = res.Data || []
      data.forEach(p => {
        p.typeText = state.projectTypeList.find(t => t.value === p.Type).label || '-'
        p.CreateTime = moment(p.CreateTime).format('YYYY-MM-DD HH:mm')
      })
      commit(types.SET_DATA, { item: 'projectList', value: data })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_LOADING_STATUS, { item: 'isLoadingProjectList', value: false })
    })
  },
  editProject ({ state, getters, commit, dispatch }) {
    let editData = state.editData
    let postData = {
      Name: editData.Name,
      Type: state.editTypeId,
      Desc: editData.Desc || ''
    }
    if (!postData.Name || postData.Name === '') {
      alert('项目名称不能为空！')
      return
    } else if (postData.Type === null || postData.Type === undefined) {
      alert('项目类型不能为空！')
      return
    }
    if (state.isModify) {
      postData.Id = editData.Id
    }
    let addProjectReq = state.isModify ? api.project.modifyProject(postData) : api.project.addProject(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectListReq', value: addProjectReq.cancel })
    addProjectReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getUserManage', null, { root: true })
      dispatch('getProjectList')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {})
  },
  deleteProject ({ state, commit, dispatch }, id) {
    let deleteProjectReq = api.project.deleteProject(id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'deleteProjectReq', value: deleteProjectReq.cancel })
    deleteProjectReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getUserManage', null, { root: true })
      dispatch('getProjectList')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
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
