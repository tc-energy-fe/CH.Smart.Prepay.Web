import http from './http'

export default {
  getToken: () => http({
    url: '',
    method: 'GET'
  })
}
