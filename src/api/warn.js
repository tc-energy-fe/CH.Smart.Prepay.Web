import http from '@/api/http'

export default {
  getHomeStatic: projectId => http({
    url: `/Warn/Home/Static/${projectId}`
  })
}
