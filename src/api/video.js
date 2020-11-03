import request from '@/utils/request'

export function getVideoList(data) {
  return request({
    url: '/admin/video/list',
    method: 'get',
    params: data
  })
}

export function addVideo(data) {
  return request({
    url: '/admin/video/add',
    method: 'post',
    data
  })
}

export function deleteVideo(data) {
  return request({
    url: '/admin/video/del',
    method: 'delete',
    data
  })
}

export function updateVideo(data) {
  return request({
    url: '/admin/video/update',
    method: 'post',
    data
  })
}

