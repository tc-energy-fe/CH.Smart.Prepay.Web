import http from '@/api/http'

export default {
  postLogManage: (data) => http({
    method: 'POST',
    url: '/LogManage',
    data
  }),
  getLogManageType: () => http({
    method: 'GET',
    url: '/LogManage/Type'
  })
}
