import LoadScene from "./LoadScene";
import WebSocketUtils from "../message/WebSocketUtils";
// 这里建立socket的连接
export default class LoadResources {
  constructor() {
    this.progress = 0;
    WebSocketUtils.account = '' + Math.floor(Math.random() * 1000000);
    WebSocketUtils.webSocket.connect();
    Laya3D.init(0, 0);
		Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
		Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
      Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
      Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
      var bg = new Laya.Image();
      bg.skin = "res/img/bg.jpg";
      bg.width = Laya.Browser.width;
      bg.height = Laya.Browser.height;
      Laya.stage.addChild(bg);
      this.text = new Laya.Text();
      this.text.text = "加载0%";
      this.text.color = "#ffffff"
      this.text.align = "center";
      this.text.valign = "bottom";
      this.text.width = Laya.Browser.width;
      this.text.height = Laya.Browser.height / 2 + 80;
      Laya.stage.addChild(this.text);
      this.processOuter = new Laya.Image();
      this.processOuter.skin = "res/img/process-outer.png";
      this.processOuter.height = "20"
      this.processOuter.width = Laya.Browser.width - Laya.Browser.width * 0.1 * 2;
      this.processOuter.x = Laya.Browser.width * 0.1;
      this.processOuter.y = Laya.Browser.height / 2 + 40;
      Laya.stage.addChild(this.processOuter);
      this.processInnter = new Laya.Image();
      this.processInnter.skin = "res/img/process-innter.png";
      this.processInnter.height = "16"
      this.processInnter.width = 0;
      this.processInnter.x = Laya.Browser.width * 0.1;
      this.processInnter.y = Laya.Browser.height / 2 + 42;
      Laya.stage.addChild(this.processInnter);
      let _this = this;
      // 这里主要是处理pc端浏览器的窗口事件
      window.addEventListener("resize", function () {
          bg.width = Laya.Browser.width;
          bg.height = Laya.Browser.height;
          _this.text.width = Laya.Browser.width;
          _this.text.height = Laya.Browser.height / 2 + 80;
          var isEq = (_this.processOuter.width - 14) < _this.processInnter.width;
          _this.processOuter.width = Laya.Browser.width - Laya.Browser.width * 0.1 * 2;
          if (_this.processOuter.width < _this.processInnter.width || isEq) {
            _this.processInnter.width = _this.processOuter.width - 10;
            _this.text.text = "加载100%";
          }
          _this.processOuter.x = Laya.Browser.width * 0.1;
          _this.processOuter.y = Laya.Browser.height / 2 + 40;
          _this.processInnter.x = Laya.Browser.width * 0.1;
          _this.processInnter.y = Laya.Browser.height / 2 + 42;
      });

      // 无加载失败重试
      Laya.loader.retryNum = 3;
      this.seat = 0;
      this.resource = [
         "res/models/TerrainScene/XunLongShi.ls",
         "res/models/dude/dude.lh",
         "res/models/skyBox1/skyBox.lmat"];
         
    // 启动场景的加载功能
    let resources = [
      {url: "res/models/TerrainScene/Assets/HeightMap.png", clas: Laya.Texture2D, priority: 1, constructParams: [1024, 1024, 1, false, true]},
      {url: "res/img/talk-cloud.png", clas: Laya.Texture2D, priority: 1, constructParams: [1024, 1024, 1, false, true]},
      {url: "res/img/talk-rabbit.png", clas: Laya.Texture2D, priority: 1, constructParams: [1024, 1024, 1, false, true]}];
         Laya.loader.create(resources, Laya.Handler.create(this, this.onAssetLoaded), Laya.Handler.create(this, this.onLoading, null, false));
      // 侦听加载失败
      Laya.loader.on(Event.ERROR, this, this.onError);
  }

  onAssetLoaded(texture) {
    // 资源加载完毕，需要上页面数据了。
    this.processInnter.width = this.processOuter.width / 2;
    this.progress = 0.5
    this.text.text = "加载50%";
      //加载函数
      
      Laya.loader.create(this.resource, Laya.Handler.create(this, this.onLoadFinish), Laya.Handler.create(this, this.onLoading, null, false));
      // 侦听加载失败
      Laya.loader.on(Event.ERROR, this, this.onError);
	}

  onLoadFinish(texture) {
    this.processInnter.width = this.processOuter.width - 10;
    this.text.text = "加载100%";
    new LoadScene();
  }

	// 加载进度侦听器
	onLoading(progress) {
    this.text.text = "加载" + Math.floor(progress / 2 * 100 + this.progress*100) + "%";
    this.processInnter.width = Math.floor(this.processOuter.width * (progress / 2 + this.progress))
	}

	onError(err) {
		console.log("加载失败: " + err);
	}
}