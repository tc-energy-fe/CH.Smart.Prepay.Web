import http from './http'

export default {
  getDeviceList: (data) => http({
    method: 'post',
    url: '/Device/List',
    data
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
