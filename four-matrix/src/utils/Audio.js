export default class Audio {
  constructor() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
     navigator.mozGetUserMedia || navigator.msGetUserMedia; //获取媒体对象（这里指摄像头）
     let _this = this;
     let constraints = { audio: true }
     navigator.getUserMedia(constraints, function (stream) {
      _this.gotStream(stream)
    }, this.noStream);
  }
  gotStream(stream) {
    let _that = this;
    // 进行音频的处理
    let audioContext = new AudioContext
    // 将麦克风的声音输入这个对象
    let mediaStreamSource = audioContext.createMediaStreamSource(stream)
    // 创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
    let scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
    // 将该分析对象与麦克风音频进行连接
    mediaStreamSource.connect(scriptProcessor)
    // 此举无甚效果，仅仅是因为解决 Chrome 自身的 bug
    scriptProcessor.connect(audioContext.destination)
    // 开始处理音频
    scriptProcessor.onaudioprocess = function(e) {
      // 获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
      let buffer = e.inputBuffer.getChannelData(0)
      // 获取缓冲区中最大的音量值
      let maxVal = Math.max.apply(Math, buffer)
      // 显示音量值
      // 如果有声音的话，值为true,通过语音流去判断话筒是否有声音
      if (Math.round(maxVal * 100) > 0) {
        _that.haveVoice = true
      } else {
        _that.haveVoice = false
      }
    }
  }
  noStream(err) {
    // 获取音频失败
    alert(err);
  }
}

