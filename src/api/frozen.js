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
  exportFrozen: data => http({
    method: 'POST',
    url: '/Frozen/Export/Frozen',
    data
  })
}
