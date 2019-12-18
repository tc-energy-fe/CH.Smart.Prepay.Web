import http from '@/api/http'

export default {
  getSchemeList: data => http({
    method: 'post',
    url: '/Scheme/List',
    data
  })
}
