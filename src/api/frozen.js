import http from '@/api/http'

export default {
  getPastSevenDay: id => http({
    url: `/Frozen/Past/SevenDay/${id}`
  }),
  getRecent: id => http({
    url: `/Frozen/Recent/${id}`
  }),
  getEleReportRoom: data => http({
    method: 'POST',
    url: '/Frozen/Ele/Report/Room',
    data
  }),
  // 电量消费报表
  getEleReport: data => http({
    method: 'POST',
    url: '/Frozen/Ele/Report',
    data
  }),
  exportFrozen: data => http({
    method: 'POST',
    url: '/Frozen/Export/Frozen',
    data
  }),
  exportEle: data => http({
    method: 'POST',
    url: '/Frozen/Export/Ele',
    data
  }),
  getHomePage: params => http({
    url: '/Frozen/Ele/HomePage',
    params
  })
}
