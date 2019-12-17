import http from './http'

export default {
  getGatewayList: (data) => http({
    method: 'post',
    url: '/Gateway/List',
    data
  }),
  getGatewayType: () => http({
    method: 'get',
    url: '/Gateway/Type'
  }),
  addGateway: (data) => http({
    method: 'post',
    url: '/Gateway',
    data
  }),
  importGateway: (params) => http({
    method: 'post',
    url: '/Gateway/Import',
    params
  })
}
