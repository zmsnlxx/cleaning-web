import request from '@/utils/request'

export function getDomesticDaily(data) {
  return request({
    url: '/cms/summary/domestic/daily',
    method: 'post',
    data
  })
}


