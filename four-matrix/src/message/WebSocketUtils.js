export default class WebSocketUtils {
  connect() {
    if (!WebSocketUtils.account) {
      alert('没有登录的账号，登录失败' + WebSocketUtils.account)
      return;
    }
    //建立连接
    WebSocketUtils.isStartConnect = true;
    //初始化引擎
    Laya.init(600, 400, Laya.WebGL);
    this.byte = new Laya.Byte();
    //这里我们采用小端
    this.byte.endian = Laya.Byte.LITTLE_ENDIAN;
    this.socket = new Laya.Socket();
    //这里我们采用小端
    this.socket.endian = Laya.Byte.LITTLE_ENDIAN;
    this.socket.connectByUrl(WebSocketUtils.url + WebSocketUtils.account);
    this.socket.on(Laya.Event.OPEN, this, this.openHandler);
    this.socket.on(Laya.Event.MESSAGE, this, this.receiveHandler);
    this.socket.on(Laya.Event.CLOSE, this, this.closeHandler);
    this.socket.on(Laya.Event.ERROR, this, this.errorHandler);
  }
  openHandler(event = null) {
      //正确建立连接
      WebSocketUtils.isStartConnect = false;
      WebSocketUtils.isConnect = true;
      WebSocketUtils.openBackHandler(event);
  }
  receiveHandler(msg = null) {
      ///接收到数据触发函数
      WebSocketUtils.receiveBackHandler(msg);
  }
  closeHandler(e = null) {
      //关闭事件
      WebSocketUtils.isStartConnect = false;
      WebSocketUtils.isConnect = false;
      WebSocketUtils.closeBackHandler(e);
  }
  errorHandler(e = null) {
    //连接出错
    WebSocketUtils.isStartConnect = false;
    WebSocketUtils.isConnect = false;
    WebSocketUtils.errorBackHandler(e);
  }
  sendMessage(message, backFunction=function() {}) {
    let _this = this;
    if (!WebSocketUtils.isStartConnect && !WebSocketUtils.isConnect) {
      // 如果没有建立连接，那么就进行连接操作
      WebSocketUtils.isStartConnect = true;
      this.connect();
      window.setTimeout(function () {
        _this.sendMessage(message);
      }, 100);
      return;
    }
    if (!WebSocketUtils.isConnect) {
      window.setTimeout(function () {
        _this.sendMessage(message);
      }, 100)
      return;
    }
    this.socket.send(message);//这里是把字节数组的数据通过socket发送给服务器。
    // 进行回调函数
    WebSocketUtils.sendBackHandler(message);
    backFunction();
  }
}
WebSocketUtils.url = "ws://localhost:9000/websocket/"; // websocket的连接地址
WebSocketUtils.account=""; // 账号
WebSocketUtils.isStartConnect=false; // 是否开始建立连接了
WebSocketUtils.isConnect = false; // 是否建立连接
WebSocketUtils.receiveBackHandler=function (msg) {}; // 返回信息回调的函数
WebSocketUtils.sendBackHandler = function (msg) {}; // 发送信息回调的函数
WebSocketUtils.openBackHandler = function (msg) {}; // 建立连接回调的函数
WebSocketUtils.closeBackHandler = function(msg) {}; // 关闭连接回调的函数
WebSocketUtils.errorBackHandler = function (msg) {}; // 错误回调的函数
WebSocketUtils.webSocket = new WebSocketUtils(); // 创建对象