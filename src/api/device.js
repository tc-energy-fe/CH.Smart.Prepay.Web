import http from './http'

export default {
  getDeviceByGateway: (projectId, gatewayId) => http({
    method: 'get',
    url: `/Device/Gateway/${projectId}/${gatewayId}`
  })
}
