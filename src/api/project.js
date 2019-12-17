import http from '@/api/http'

export default {
  getProjectList: (params) => http({
    method: 'get',
    url: '/Project',
    params
  }),
  getProjectDetail: (id) => http({
    method: 'get',
    url: `/Project/${id}`
  }),
  getProjectType: () => http({
    method: 'get',
    url: '/Project/Type'
  }),
  addProject: (data) => http({
    method: 'post',
    url: '/Project',
    data
  }),
  modifyProject: (data) => http({
    method: 'put',
    url: '/Project',
    data
  }),
  deleteProject: (id) => http({
    method: 'delete',
    url: `/Project/${id}`
  }),
  getProjectGroupByUser: (uid) => http({
    method: 'POST',
    url: `/Project/Group/${uid}`
  })
}
