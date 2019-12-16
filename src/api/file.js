import http from '@/api/http'

export default {
  uploadFile: (data) => http({
    method: 'post',
    url: '/File',
    data
  })
}
