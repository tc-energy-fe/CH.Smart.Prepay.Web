
let apiUrl = ''

if (process.env.VUE_APP_API_MODE === 'production') {
  apiUrl = 'http://:8000/api'
} else {
  apiUrl = ''
}

export default apiUrl
