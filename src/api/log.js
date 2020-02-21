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
  }),
  getLogManageTaskType: () => http({
    method: 'GET',
    url: '/LogManage/Task/Type'
  }),
  getLogManageAllType: () => http({
    method: 'GET',
    url: '/LogManage/All/Type'
  })
}
