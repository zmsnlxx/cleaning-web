import request from '@/utils/request'

export function getLeaveList(data) {
  return request({
    url: '/admin/leave/list',
    method: 'get',
    params: data
  })
}

export function updateLeave(data) {
  return request({
    url: '/admin/leave/pass',
    method: 'post',
    data
  })
}

