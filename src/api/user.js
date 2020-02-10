import http from '@/api/http'

export default {
  getUserManageAuth: () => http({
    url: '/UserManage/Auth',
    method: 'get'
  }),
  getUserManage: (params) => http({
    url: `/UserManage`,
    method: 'GET',
    params
  }),
  putUserManage: (data) => http({
    url: `/UserManage`,
    method: 'PUT',
    data
  }),
  putUserManageStatus: (data) => http({
    url: `/UserManage/Status`,
    method: 'PUT',
    data
  }),
  postUserManage: (data) => http({
    url: `/UserManage`,
    method: 'POST',
    data
  }),
  getUserManageDetail: (id) => http({
    url: `/UserManage/Detail${isEmpty(id) ? '' : `?id=${id}`}`,
    method: 'GET'
  })
}
