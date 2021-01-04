import request from '@/utils/request'

export function getReportList(data) {
  return request({
    url: '/admin/userReport/list',
    method: 'get',
    params: data
  })
}

