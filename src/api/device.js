import http from './http'

export default {
  getDeviceList: (data) => http({
    method: 'post',
    url: '/Device/List',
    data
  }),
  addDevice: (data) => http({
    method: 'post',
    url: '/Device',
    data
  }),
  modifyDevice: (data) => http({
    method: 'put',
    url: '/Device',
    data
  }),
  importDevice: (params) => http({
    method: 'post',
    url: '/Device/Import',
    params
  }),
  getDeviceEleType: () => http({
    method: 'get',
    url: '/Device/Ele/Type'
  }),
  getDeviceByGateway: (projectId, gatewayId) => http({
    method: 'get',
    url: `/Device/Gateway/${projectId}/${gatewayId}`
  })
}
