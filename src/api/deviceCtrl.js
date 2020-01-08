import http from '@/api/http'

export default {
  postDeviceCtrlList: (data) => http({
    url: '/DeviceCtrl/List',
    method: 'POST',
    data
  }),
  postDeviceCtrlSoftware: (data) => http({
    url: '/DeviceCtrl/Software',
    method: 'POST',
    data
  }),
  postDeviceCtrlHardware: (data) => http({
    url: '/DeviceCtrl/Hardware',
    method: 'POST',
    data
  }),
  getDeviceCtrlWait: (params) => http({
    url: `/DeviceCtrl/Wait`,
    method: 'GET',
    params
  }),
  deleteDeviceCtrlCancel: (id) => http({
    url: `/DeviceCtrl/Cancel?id=${id}`,
    method: 'DELETE'
  })
}
