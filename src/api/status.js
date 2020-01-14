import http from '@/api/http'

export default {
  postStatusGateway: (data) => http({
    url: '/Status/Gateway',
    method: 'POST',
    data
  }),
  getStatusGatewayStaticById: (id) => http({
    url: `/Status/Gateway/Static/${id}`,
    method: 'GET'
  }),
  postStatusEMeter: (data) => http({
    url: '/Status/EMeter',
    method: 'POST',
    data
  }),
  getStatusEMeterStatic: (params) => http({
    url: `/Status/EMeter/Static`,
    method: 'GET',
    params
  })
}
