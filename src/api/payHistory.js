import http from '@/api/http'

export default {
  // 缴退费明细
  getPayHistory: data => http({
    method: 'POST',
    url: '/PayHistory',
    data
  })
}