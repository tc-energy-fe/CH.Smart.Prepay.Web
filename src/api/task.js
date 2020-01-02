import http from '@/api/http'

export default {
  getTaskList: (params) => http({
    method: 'GET',
    url: '/Task',
    params
  }),
  addTask: data => http({
    method: 'POST',
    url: '/Task',
    data
  }),
  modifyTask: data => http({
    method: 'PUT',
    url: '/Task',
    data
  }),
  modifyTaskStatus: data => http({
    method: 'PUT',
    url: '/Task/Status',
    data
  }),
  getTaskDetail: id => http({
    method: 'GET',
    url: `/Task/${id}`
  }),
  getTaskDic: params => http({
    method: 'GET',
    url: `/Task/Dic`,
    params
  }),
  getRoomTaskList: (data) => http({
    method: 'POST',
    url: '/Task/Room/Task/List',
    data
  })
}
