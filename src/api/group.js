import http from './http'

export default {
  getGroupList: (data) => http({
    url: '/Group/List',
    method: 'post',
    data
  }),
  getGroupDetail: (id) => http({
    url: `/Group/${id}`,
    method: 'get'
  }),
  addGroup: (data) => http({
    url: '/Group',
    method: 'post',
    data
  }),
  modifyGroup: (data) => http({
    url: '/Group',
    method: 'put',
    data
  }),
  deleteGroup: (id) => http({
    url: `/Group/${id}`,
    method: 'delete'
  })
}
