import http from '@/api/http'

export default {
  // 缴退费明细
  getPayHistory: data => http({
    method: 'POST',
    url: '/PayHistory',
    data
  }),
  // 收入明细报表
  getPayReport: data => http({
    method: 'POST',
    url: '/PayHistory/Report',
    data
  })
}
