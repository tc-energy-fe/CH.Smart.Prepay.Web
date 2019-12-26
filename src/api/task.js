import http from '@/api/http'

export default {
  getTaskList: (params) => http({
    url: '/Task',
    params
  }),
  getRoomTaskList: (data) => http({
    method: 'post',
    url: '/Task/Room/Task/List',
    data
  })
}
