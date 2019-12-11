import http from './http'

export default {
  getGatewayList: (data) => http({
    method: 'post',
    url: '/Gateway/List',
    data
  })
}
