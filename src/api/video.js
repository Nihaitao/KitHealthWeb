import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/video',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/addvideo',
    method: 'post',
    data
  })
}

export function remove(data) {
  return request({
    url: '/removevideo',
    method: 'post',
    data
  })
}
