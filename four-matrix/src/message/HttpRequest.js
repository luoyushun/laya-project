// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:9000',
  timeout: 20000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    let status = response.status
    if (status !== 200) {
      message(response.data, 'error')
      return Promise.reject(response)
    }
    return response
  },
  error => {
    message(error.response.data, 'error')
    return Promise.reject(error)
  }
)

function getData (param, url) {
  return service({
    url: url,
    method: 'GET',
    params: param
  })
}

function postData (data, url) {
  return service({
    url: url,
    method: 'POST',
    data: data
  })
}

export default class HttpRequest {
  constructor() {}
}

HttpRequest.uploadHeadImg = (data) => postData(data, '/header/img/upload');

HttpRequest.getHeadImg = (data) => {return getData(data, '/header/img/get')};
