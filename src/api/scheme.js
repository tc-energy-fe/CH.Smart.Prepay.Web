import http from '@/api/http'

export default {
  getSchemeList: data => http({
    method: 'post',
    url: '/Scheme/List',
    data
  }),
  addScheme: data => http({
    method: 'post',
    url: '/Scheme',
    data
  }),
  modifyScheme: data => http({
    method: 'put',
    url: '/Scheme',
    data
  }),
  modifySchemeStatus: data => http({
    method: 'put',
    url: '/Scheme/Status',
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
