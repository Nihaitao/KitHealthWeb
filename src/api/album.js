import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/album',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/addalbum',
    method: 'post',
    data
  })
}

export function remove(data) {
  return request({
    url: '/removealbum',
    method: 'post',
    data
  })
}
