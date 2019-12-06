import http from './http'

export default {
  getGroupList: (data) => http({
    url: '/Group/List',
    method: 'post',
    data
  })
}
