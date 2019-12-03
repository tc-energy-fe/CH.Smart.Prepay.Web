
let apiUrl = ''

if (process.env.VUE_APP_API_MODE === 'production') {
  apiUrl = 'http://prepay-test.api.eshangneng.com:8000/api'
} else {
  apiUrl = 'http://prepay-test.api.eshangneng.com:8000/api'
}

export default apiUrl
