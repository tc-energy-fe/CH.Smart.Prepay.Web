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
  importRoom: (params) => http({
    url: `/Group/Import`,
    method: 'POST',
    params
  }),
  /** RoomAccount **/
  getRoomAccountList: (data) => http({
    method: 'post',
    url: '/Group/Room/Account/List',
    data
  }),
  addRoomAccount: (data) => http({
    method: 'put',
    url: '/Group/Room/Account',
    data
  }),
  deleteRoomAccount: (data) => http({
    method: 'delete',
    url: `/Group/Room/Account/${data.Id}`
  }),
  /** RoomConfig **/
  getRoomConfigAddList: (params) => http({
    method: 'get',
    url: '/Group/List/Config/Add',
    params
  }),
  getRoomConfigEditList: (params) => http({
    method: 'get',
    url: '/Group/List/Config/Edit',
    params
  })
}
