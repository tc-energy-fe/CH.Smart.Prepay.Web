
let apiUrl = ''

if (process.env.VUE_APP_API_MODE === 'production') {
  apiUrl = 'http://prepay-test.api.eshangneng.com:8000/api'
} else {
  apiUrl = 'http://10.9.51.237:16666/api'
}

export default apiUrl
