import http from '@/api/http'

export default {
  getRoleList: (params) => http({
    url: `/Role`,
    method: 'GET',
    params
  }),
  putRoleData: (data) => http({
    url: `/Role`,
    method: 'PUT',
    data: data
  }),
  postRoleData: (data) => http({
    url: `/Role`,
    method: 'POST',
    data: data
  }),
  getSingleRole: (id) => http({
    url: `/Role/${id}`,
    method: 'GET'
  }),
  deleteSingleRole: (id) => http({
    url: `/Role/${id}`,
    method: 'DELETE'
  }),
  getRoleUserMenu: (uid) => http({
    url: `/Role/User/Menu${isEmpty(uid) ? '' : `?uid=${uid}`}`,
    method: 'GET'
  }),
  getRoleCreateType: (canEdit = false) => http({
    url: `/Role/Create/Type?canEdit=${canEdit}`,
    method: 'GET'
  })
}
