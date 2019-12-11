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
  }),
  /** room **/
  getRoomList: (data) => http({
    url: '/Group/Room/List',
    method: 'post',
    data
  }),
  addRoom: (data) => http({
    url: '/Group/Room',
    method: 'post',
    data
  }),
  modifyRoom: (data) => http({
    url: '/Group/Room',
    method: 'put',
    data
  }),
  deleteRoom: (id) => http({
    url: `/Group/Room/${id}`,
    method: 'delete'
  }),
  getRoomAccountList: (data) => http({
    method: 'post',
    url: '/Group/Room/Account/List',
    data
  })
}
