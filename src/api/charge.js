/**
 * 缴退费
 */

import http from '@/api/http'

export default {
  getBalanceList: (data) => http({
    method: 'POST',
    url: '/Balance/List',
    data
  }),
  getBalanceWarnType: () => http({
    method: 'GET',
    url: '/Balance/Warn/Type'
  }),
  balancePay: data => http({
    method: 'POST',
    url: '/Balance/Pay',
    data
  })
}
