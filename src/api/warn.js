import http from '@/api/http'

export default {
  getHomeStatic: projectId => http({
    url: `/Warn/Home/Static/${projectId}`
  }),
  getWarnType: () => http({
    url: `/Warn/Type`,
    method: 'GET'
  }),
  postWarnHistory: (data) => http({
    url: '/Warn/History',
    method: 'POST',
    data
  }),
  postWarnRealTime: (data) => http({
    url: '/Warn',
    method: 'POST',
    data
  }),
  getWarnStatic: params => http({
    url: '/Warn/Static',
    method: 'GET',
    params
  })
}
