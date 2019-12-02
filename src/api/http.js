import axios from 'axios'
import url from './apiUrl'

const CancelToken = axios.CancelToken
const baseUrl = url

const axiosIns = axios.create({
  baseURL: baseUrl
  // timeout: 5000
})
axiosIns.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axiosIns.defaults.headers.put['Content-Type'] = 'application/json;charset=UTF-8'

// request拦截器
axiosIns.interceptors.request.use(function (config) {
  let Token = localStorage.getItem('Token')
  let headers = config.headers

  if (Token) {
    headers.Authorization = `Auth ${Token}`
  }
  return config
}, function (error) {
  console.error('Request error', error)
  return Promise.reject(error)
})

// response拦截器
axiosIns.interceptors.response.use(function (response) {
  let status = response.status
  let state = response.data.State
  // 判断返回值状态
  if (status === 200 && (state || state === 0)) {
    if (state >= 0) {
      return response.data
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        code: state,
        msg: response.data.Msg
      })
    }
  } else {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject({
      code: state,
      msg: response.data.Msg
    })
  }
}, function (error) {
  // 请求主动cancel
  if (axios.isCancel(error)) {
    console.error('Response canceled', error)
  } else {
    // 处理错误
    console.error('Response error', error)
  }
  return Promise.reject(error)
})

const http = (params) => {
  let cancel = null
  let config = Object.assign({
    cancelToken: new CancelToken(c => {
      // 请求的中止函数
      cancel = c
    }),
    paramsSerializer: function (params) {
      // params序列化函数
      let str = ''
      Object.entries(params).forEach(item => {
        str += `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1])}`
      })
      return str
    }
  }, params)

  return {
    request: axiosIns.request(config),
    cancel: cancel
  }
}

export default http
