import http from '@/api/http'

export default {
  getPastSevenDay: id => http({
    url: `/Frozen/Past/SevenDay/${id}`
  }),
  getRecent: id => http({
    url: `/Frozen/Recent/${id}`
  })
}
