import http from '@/api/http'

export default {
  getSchemeList: data => http({
    method: 'post',
    url: '/Scheme/List',
    data
  }),
  getSchemeDetail: id => http({
    method: 'get',
    url: `/Scheme/${id}`
  }),
  getRoomSchemeList: data => http({
    method: 'post',
    url: '/Scheme/Room/List',
    data
  })
}
