(function () {
  'use strict';

  // 创建axios实例
  const service = axios.create({
    baseURL: 'http://localhost:9000',
    timeout: 20000 // 请求超时时间
  });

  // request拦截器
  service.interceptors.request.use(
    config => {
      return config
    },
    error => {
      // Do something with request error
      console.log(error); // for debug
      Promise.reject(error);
    }
  );

  // response 拦截器
  service.interceptors.response.use(
    response => {
      let status = response.status;
      if (status !== 200) {
        message(response.data, 'error');
        return Promise.reject(response)
      }
      return response
    },
    error => {
      message(error.response.data, 'error');
      return Promise.reject(error)
    }
  );

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

  class HttpRequest {
    constructor() {}
  }

  HttpRequest.uploadHeadImg = (data) => postData(data, '/header/img/upload');

  HttpRequest.getHeadImg = (data) => {return getData(data, '/header/img/get')};

  class WebSocketUtils {
    connect() {
      if (!WebSocketUtils.account) {
        alert('没有登录的账号，登录失败' + WebSocketUtils.account);
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
        }, 100);
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

  class Audio {
    constructor() {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
       navigator.mozGetUserMedia || navigator.msGetUserMedia; //获取媒体对象（这里指摄像头）
       let _this = this;
       let constraints = { audio: true };
       navigator.getUserMedia(constraints, function (stream) {
        _this.gotStream(stream);
      }, this.noStream);
    }
    gotStream(stream) {
      let _that = this;
      // 进行音频的处理
      let audioContext = new AudioContext;
      // 将麦克风的声音输入这个对象
      let mediaStreamSource = audioContext.createMediaStreamSource(stream);
      // 创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
      let scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      // 将该分析对象与麦克风音频进行连接
      mediaStreamSource.connect(scriptProcessor);
      // 此举无甚效果，仅仅是因为解决 Chrome 自身的 bug
      scriptProcessor.connect(audioContext.destination);
      // 开始处理音频
      scriptProcessor.onaudioprocess = function(e) {
        // 获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
        let buffer = e.inputBuffer.getChannelData(0);
        // 获取缓冲区中最大的音量值
        let maxVal = Math.max.apply(Math, buffer);
        // 显示音量值
        // 如果有声音的话，值为true,通过语音流去判断话筒是否有声音
        if (Math.round(maxVal * 100) > 0) {
          _that.haveVoice = true;
        } else {
          _that.haveVoice = false;
        }
      };
    }
    noStream(err) {
      // 获取音频失败
      alert(err);
    }
  }

  class ColliderUtils {
    constructor() {}
  }

  ColliderUtils.meshColliderShape = function(meshSprite) {
    if (!meshSprite._meshFilter || !meshSprite._meshFilter._sharedMesh) {
      return;
    }
    let rigidBody = meshSprite.addComponent(Laya.PhysicsCollider);
    let meshShape = new Laya.MeshColliderShape();
    //设置网格碰撞盒的网格
    meshShape.mesh = meshSprite._meshFilter._sharedMesh;
    //设置碰撞盒为网格型
    rigidBody.colliderShape = meshShape;
  };

  class Words {
    constructor() {}
  }
  /**  参数解析：
  * 
  * 	ctx:  canvas绘图上下文
  * 	str:  需要绘制的文本内容
  * 	draw_width:  绘制后的文字显示宽度
  * 	lineNum:  最大行数，多出部分用'...'表示， 如果传-1可以达到自动换行效果
  * 	startX:  绘制文字的起点 X 轴坐标
  * 	startY:  绘制文字的起点 Y 轴坐标
  *	steps:  文字行间距
  */
  Words.toFormateStrCanvas = function (ctx, str, draw_width, lineNum, startX, startY, steps, font="20px 宋体", textAlign="left") {
  	var strWidth = ctx.measureText(str).width;     // 测量文本源尺寸信息（宽度）
  	var startpoint = startY, keyStr = '', sreLN = strWidth / draw_width;
  	var liner = Math.ceil(sreLN);     // 计算文本源一共能生成多少行
  	let strlen = parseInt(str.length / sreLN); 	// 等比缩放测量一行文本显示多少个字符
  	// 若文本不足一行，则直接绘制，反之大于传入的最多行数（lineNum）以省略号（...）代替
  	if (strWidth  < draw_width) {
  		ctx.font = font;
      ctx.textAlign = textAlign;//文本的对齐方式
  		ctx.fillText(str, startX, startpoint);
  	} else {
  		for (var i = 1; i < liner + 1; i++) {
  			ctx.font = font;
  			ctx.textAlign = textAlign;//文本的对齐方式
  			let startPoint = strlen * (i-1);
  			if (i < lineNum || lineNum == -1) {
  				keyStr = str.substr(startPoint, strlen);
  				ctx.fillText(keyStr, startX, startpoint);
  			} else {
  				keyStr = str.substr(startPoint, strlen-5) + '...';
  				ctx.fillText(keyStr, startX, startpoint);
  				break;
  			}
  			startpoint = startpoint + steps;
  		}
  	}
  };

  class Talk {
    constructor(containor, url, left, top, position) {
      this.containor = containor;
      this.url = url;
      this.left = left;
      this.top = top;
      this.isAddContainor = false;
      this.aliveTime = 10000;
      this.startTime = (new Date()).getTime();
      this.initTalk(position);
      this.setTalkContent("hello");
      this.setPosition(new Laya.Vector3(0, 5, 1));
    }
    initTalk(position) {
      //设置一个面板用来渲染
      this.plane = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(2.5, 1.00));
      this.position = new Laya.Vector3(0, 0, 0);
      this.positionBack = new Laya.Vector3(0, 0, 0);
      this.planeBack = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(4, 2.5));
      this.plane.transform.rotate(new Laya.Vector3(0, 180, 180), true, false);
      this.planeBack.transform.rotate(new Laya.Vector3(90, 180, 180), true, false);
      let textureBack = Laya.Loader.getRes(this.url);
      var materialBack = new Laya.UnlitMaterial();
      //设置纹理
      materialBack.albedoTexture = textureBack;
      //设置材质颜色
      this.planeBack.meshRenderer.sharedMaterial = materialBack;
      materialBack.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;

      // 设置谈话的内容的框框
      this.mat = new Laya.UnlitMaterial();
      this.plane.meshRenderer.sharedMaterial = this.mat;
      //画布cavans
      this.cav = Laya.Browser.createElement("canvas");
      this.cxt = this.cav.getContext("2d");
      this.width = 256;
      this.height = 256;
      this.cav.width = this.width;
      this.cav.height = this.height;
      this.texture2D = new Laya.Texture2D(256, 256);
      this.mat.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
      this.plane.meshRenderer.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
      this.planeNode = this.planeBack.addChild(this.plane);
      this.plane.transform.localPosition = position;
    }

    setTalkContent(content) {
      // 进行清空画布
      this.cxt.fillStyle = 'rgb(255,255,255)';
      this.cxt.fillRect(0,0,this.width,this.height);
      Words.toFormateStrCanvas(this.cxt, content, 256, 6, this.left, this.top, 5);
      this.texture2D.loadImageSource(this.cav);
      this.mat.albedoTexture = this.texture2D;
    }

    setPosition(position) {
      if (!this.isAddContainor) {
        this.planeBackNode = this.containor.addChild(this.planeBack);
        this.startTime = (new Date()).getTime();
        this.isAddContainor = true;
      }
      this.position.x = position.x;
      this.position.y = position.y;
      this.position.z = position.z;
      this.positionBack.x = position.x;
      this.positionBack.y = position.y;
      this.positionBack.z = position.z;
      this.planeBack.transform.localPosition = this.positionBack;
    }

    isOver() {
      let end = (new Date()).getTime();
      return (end - this.startTime) > aliveTime;
    }

    /**
     * 删除对话
     */
    removeTalk() {
      this.containor.removeChild(this.planeBackNode);
      this.containor.removeChild(this.planeNode);
      this.isAddContainor = false;
    }
  }

  class Person{
    constructor(init, scene, position, rotation, url, account) {
      if (!init) {
        return;
      }
      this.rotation = rotation;
      this.account = account;
      this.scene = scene;
      this.original = true;
      this.url = url;
      this.persion = scene.addChild(new Laya.Sprite3D());
      this.persionModel = this.persion.addChild(Laya.Loader.getRes(url));
      this.scale = new Laya.Vector3(0.5, 0.5, 0.5);
  		this.persionModel.transform.localScale = this.scale;
  		this.persionModel.transform.translate(new Laya.Vector3(position.x, position.y, position.z));
      this.persionModel.transform.rotate(rotation, false, false);
      this.clonePersonModel = Laya.Sprite3D.instantiate(this.persionModel, null, false, position);
      this.persionModel.account = account;
      this.persionModel.selfType = "personSelf";
      this.currentPosition = position;
      this.threePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.twoPosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.onePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.beforePosition = new Laya.Vector3(position.x, position.y, position.z);
      this.otherPosition = new Laya.Vector3(0, 0, 0);
      this.otherPositionMessage = {account: this.account, position: position, scenario: ''};
      this.setTitleName();
      this.setHeadImg();
      this.setCameraHead();
      this.setCollider();
      // this.talk = new Talk(this.persionModel, 'res/img/talk-rabbit.png', 50, 50, new Laya.Vector3(0.4, -1, 0.2));
    }

    setModel(scene, position, url, account, model) {
      this.rotation = new Laya.Vector3(0, 0, 0);
      this.account = account;
      this.original = false;
      this.scene = scene;
      this.url = url;
      this.persionModel = model;
      this.persionModel.addComponent(PersonRotationMoveScript);
      this.persionModel.getComponent(PersonRotationMoveScript).setPersion(this);
      this.scene.addChild(this.persionModel);
      this.upVector3 = new Laya.Vector3(0, 0, 0);
      this.clonePersonModel = Laya.Sprite3D.instantiate(model, null, false, position);
      this.persionModel.account = account;
      this.persionModel.selfType = "personOther";
      this.currentPosition = position;
      this.threePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.twoPosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.onePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.beforePosition = new Laya.Vector3(position.x, position.y, position.z);
      this.otherPosition = new Laya.Vector3(0, 0, 0);
      this.otherPositionMessage = {account: this.account, position: position, scenario: ''};
      this.setTitleName();
      this.setHeadImg();
      this.imgHeader = Laya.Browser.createElement("img");
      this.setCollider();
      // this.talk = new Talk(this.persionModel, 'res/img/talk-cloud.png', 50, 50, new Laya.Vector3(0.4, -1, 0.2));
    }

    /**
     * 初始化对话框的数据信息
     * @param {*} url 显示的地址
     * @param {*} top 上边距
     * @param {*} left 左边距
     * @param {*} wordNum 字的数量
     */
    setTalkContent(content) {
      this.talk.setTalkContent(content);
      this.talk.setPosition(new Laya.Vector3(1, 5, 0));
    }

    /**
     * 设置碰撞器:网格碰撞
     */
    setCollider() {
      // --------------------------start------------------------------
      // ---------------exception Uncaught TypeError: value._getPhysicMesh is not a function--------
      // var hit = this.persionModel.getChildByName("dude").getChildByName("him");
      // let lizardCollider = this.persionModel.addComponent(Laya.PhysicsCollider);
      // console.info(this.persionModel)
      // lizardCollider.isTrigger = true;
      // var meshShape = new Laya.MeshColliderShape();
      // //设置网格碰撞盒的网格
      // meshShape.mesh = hit;
      // //设置碰撞盒为网格型
      // lizardCollider.colliderShape = meshShape;
      // //设置摩擦力
      // lizardCollider.friction = 2;
      // //设置弹力
      // lizardCollider.restitution = 0.3;
      // let script = box.addComponent(TriggerCollisionScript);
      //     script.kinematicSprite = this.kinematicSphere;
      // --------------------------end--------------------------------
      // --------------------------start------------------------------
      // --------------------------使用胶囊碰撞器---------------------
      // 人物往下坠落了
      // console.info(this.persionModel)
      let character = this.persionModel.addComponent(Laya.CharacterController);
      let sphereShape = new Laya.CapsuleColliderShape(1.0, 3.4);
      sphereShape.localOffset = new Laya.Vector3(0, 1.7, 0);
      character.colliderShape = sphereShape;
      // --------------------------end--------------------------------
      // var hit = this.persionModel.getChildByName("dude").getChildByName("him");
      // ColliderUtils.meshColliderShape(hit);
    }

    /**
     * 这个是本系统需要的数据信息
     */
    setCameraHead() {
      this.videoHeader = Laya.Browser.createElement("video");
      this.videoHeader.setAttribute("width", "640");
      this.videoHeader.setAttribute("height", "480");
      this.videoHeader.setAttribute("autoplay", "true");
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
       navigator.mozGetUserMedia || navigator.msGetUserMedia; //获取媒体对象（这里指摄像头）
       let _this = this;
      navigator.getUserMedia({
          video: true
      }, function (stream) {
        _this.gotStream(stream);
      }, this.noStream);
      Laya.timer.frameLoop(1, this, function() {
        this.cxtHeader.drawImage(this.videoHeader, 0, 0, 256, 256);
        this.texture2DHeader.loadImageSource(this.cavHeader);
        this.matHeader.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
        //给材质贴图
        this.matHeader.albedoTexture = this.texture2DHeader;
        this.headPlant.meshRenderer.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
      });
      Laya.timer.frameLoop(100, this, function() {
        var img = this.cavHeader.toDataURL("image/jpeg", 1);
        let params = {
          headImg: {
            imageBase64: img,
            timestamp: '' + (new Date()).getTime()
          },
          account: this.account,
          scenario: '001',
          messageType: 'headImage'
        };
        HttpRequest.uploadHeadImg(params);
      });
    }

    setOtherHeaderImg(img) {
      this.imgHeader.setAttribute("src", img);
      this.cxtHeader.drawImage(this.imgHeader, 0, 0, 256, 256);
      this.texture2DHeader.loadImageSource(this.cavHeader);
      this.matHeader.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
      //给材质贴图
      this.matHeader.albedoTexture = this.texture2DHeader;
      this.headPlant.meshRenderer.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
    }

    setHeadImg() {
      this.headPlant = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(1, 1));
      this.headPlant.transform.rotate(new Laya.Vector3(90, 180, 180), true, false);
      this.persionModel.addChild(this.headPlant);
      this.headPlant.transform.localPosition = new Laya.Vector3(0, 4.7, 0);
      this.texture2DHead = new Laya.Texture2D(256, 256);
      this.cavHeader = Laya.Browser.createElement("canvas");
      this.cxtHeader = this.cavHeader.getContext("2d");
      this.cavHeader.width = 256;
      this.cavHeader.height = 256;
      this.matHeader = new Laya.UnlitMaterial();
      this.headPlant.meshRenderer.sharedMaterial = this.matHeader;
      this.texture2DHeader = new Laya.Texture2D(256, 256);
    }

    gotStream(stream) {
      this.videoHeader.srcObject = stream;
    }

    noStream(err) {
      alert(err);
    }

    setTitleName() {
      if (this.titlePlant) {
        // 已经创建了，就不用进行创建了
        return;
      }
      this.titlePlant = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(1, 0.3));
      this.titlePlant.transform.rotate(new Laya.Vector3(90, 180, 180), true, false);
      this.persionModel.addChild(this.titlePlant);
      this.titlePlant.transform.localPosition = new Laya.Vector3(0, 4, 0);

      this.mat = new Laya.UnlitMaterial();
      this.titlePlant.meshRenderer.sharedMaterial = this.mat;
      //画布cavans
      this.cav = Laya.Browser.createElement("canvas");
      this.cxt = this.cav.getContext("2d");
      this.cav.width = 256;
      this.cav.height = 40;
      this.cxt.fillStyle = 'rgb(255,255,255)';
      this.cxt.fillRect(0,0,256,40);

      this.cxt.fillStyle = 'rgb(0,0,0)';

      this.cxt.font = "30px 宋体";

      this.cxt.textAlign = "center";//文本的对齐方式

      // this.cxt.textBaseline = "center";//文本相对于起点的位置

      this.cxt.fillText(this.account, 128, 27);//有填充cxt.font="bold 60px 宋体";

      this.texture2D = new Laya.Texture2D(256, 256);

      this.texture2D.loadImageSource(this.cav);

      this.mat.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;

      //给材质贴图

      this.mat.albedoTexture = this.texture2D;

      this.titlePlant.meshRenderer.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
    }

    cloneModel(url, position) {
      // if (this.url != url || !this.original) {
      //   return null;
      // }
      return Laya.Sprite3D.instantiate(this.clonePersonModel, this.scene, false, position);
    }

    /**
     * 如果是自己当前的话，那么需要设置摄像头的跟随
     * @param {*} camera 
     */
    setCamera(camera) {
      // 如果这里不进行旋转，只是旋转人物的话，那么控制方向的按钮就会颠倒
      this.cameraRotate = new Laya.Vector3(-45, 180, 0);

      // 这里是处理摄像机和人物一起移动
      let moveCamera = this.persionModel.addChild(camera);
      // 如果写成-7的话，那么看不到人，在实际的项目之中，需要看具体的情况了来填写具体的数据
      moveCamera.transform.localPosition = new Laya.Vector3(0, 7, 7);
      moveCamera.transform.rotate(this.cameraRotate, true, false);
    }

    /**
     * 设置移动的脚本
     */
    setMoveScript() {
      // PersionMoveScript
      this.persionModel.addComponent(PersionMoveScript);
      this.persionModel.getComponent(PersionMoveScript).setPersion(this);
    }

    /**
     * 设置height对应的数据信息
     * @param {*} terrainSprite 
     */
    setHahMap(terrainSprite) {
      this.terrainSprite = terrainSprite;
    }

    /**
     * 获取y的坐标
     * @param {*} x 
     * @param {*} z 
     * @returns 
     */
    getY(x, z) {
      return this.terrainSprite.getHeight(x, z);
    }
    
    /**
     * 判断是否是这个人员的信息
     * 
     * @param {*} id 人员的主键信息
     * @returns  返回是否是这个信息
     */
    isPersion(account) {
      return this.account == account;
    }

    
    /**
     * 提供给其他终端用户的
     * @returns 返回信息
     */
    setPosition(position) {
      if(Number(position.timestamp) < Number(this.otherPositionMessage.timestamp)) {
        // 数据晚来不处理
        return;
      }
      this.otherPositionMessage = position;
      this.otherPosition.x = position.x;
      this.otherPosition.y = position.y;
      this.otherPosition.z = position.z;
      //调整方向
      this.persionModel.getComponent(PersonRotationMoveScript).setMove(this.otherPosition);
      // this.updatePositionAndDrect(position);
    }

    setRotation(rotation) {
      this.rotation.x = rotation.x;
      this.rotation.y = rotation.y;
      this.rotation.z = rotation.z;
      this.persionModel.getComponent(PersonRotationMoveScript).setRotation(this.rotation);
    }

    /**
     * 进行旋转
     * @param {*} ration 旋转的角度
     */
    setRation(ration) {
      this.persionModel.transform.rotate(ration, false, false);
      this.persionModel.transform.position=this.currentPosition;
    }

    getPosition() {
      return this.persionModel.transform.position;
    }

    /**
     * 这个是提供给本终端用户的
     * 
     * @param {*} position 位置
     */
    getBeforePosition() {
      return this.beforePosition;
    }

    /**
     * 设置人物的旋转数据信息
     * @param {*} rotation 旋转
     */
    setPersonRotation(rotation) {
      let params = {
        rotation: {
          x: rotation.x,
          y: rotation.y,
          z: rotation.z,
          timestamp: '' + (new Date()).getTime()
        },
        account: this.account,
        scenario: '001',
        messageType: 'rotation'
      };
      WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
    }

    /**
     * 销毁对象信息
     */
    destoryPerson() {
      this.persionModel.destroy();
    }
    /**
     * 这个是提供给本终端用户的
     * 
     * @param {*} position 位置
     */
    setBeforePosition(position) {
      this.beforePosition.x = this.currentPosition.x;
      this.beforePosition.y = this.currentPosition.y;
      this.beforePosition.z = this.currentPosition.z;
      this.currentPosition = position;
      let params = {
        position: {
          x: position.x,
          y: position.y,
          z: position.z,
          timestamp: '' + (new Date()).getTime()
        },
        account: this.account,
        scenario: '001',
        messageType: 'position'
      };
      WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
    }
    /**
     * 这个是提供给本终端用户的
     * 
     * @param {*} position 位置
     */
    initSendPosition() {
      let params = {
        position: {
          x: this.currentPosition.x,
          y: this.currentPosition.y,
          z: this.currentPosition.z,
          timestamp: '' + (new Date()).getTime()
        },
        account: this.account,
        scenario: '001',
        messageType: 'position'
      };
      this.threePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.twoPosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      this.onePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
      WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
    }
  }

  class LoadScene {
    constructor() {
      this.sendTo = '';
      this.personList = new Array();
      // 进行场景的添加等信息
      let _this = this;
      WebSocketUtils.receiveBackHandler=function (message) {
        _this.receiveBackHandler(message);
      };
      Laya.Stat.show();
      new Audio();
      let tempScene = Laya.Loader.getRes("res/models/TerrainScene/XunLongShi.ls");
      this.scene = Laya.stage.addChild(tempScene);
      //获取相机
      this.camera = new Laya.Camera();
      this.scene.addChild(this.camera);
      //设置相机清楚标记，使用天空
      this.camera.clearFlag = Laya.CameraClearFlags.Sky;
      //调整相机的位置
      this.camera.transform.translate(new Laya.Vector3(10, 13, -22));
      this.camera.transform.rotate(new Laya.Vector3(-20, 170, 0), false, false);
      this.exposureNumber = 0;
      //添加光照
      var directionLight = this.scene.addChild(new Laya.DirectionLight());
      //光照颜色
      directionLight.color = new Laya.Vector3(1, 1, 1);
      directionLight.transform.rotate(new Laya.Vector3(-3.14 / 3, 0, 0));
      //使用材质
      this.skyboxMaterial = Laya.Loader.getRes("res/models/skyBox1/skyBox.lmat");
      var skyRenderer = this.camera.skyRenderer;
      skyRenderer.mesh = Laya.SkyBox.instance;
      skyRenderer.material = this.skyboxMaterial;
      Laya.timer.frameLoop(10, this, this.onFrameLoop);

      // 这里加载可以行走的区域，通过这个区域来获取到对应的y轴的坐标，可能得到的坐标需要微调
  		let meshSprite3D = tempScene.getChildByName('Scenes').getChildByName('HeightMap');
  		//使可行走区域模型隐藏
      meshSprite3D.active = false;
  		// 必须需要预先加载
  		let heightMap = Laya.Loader.getRes("res/models/TerrainScene/Assets/HeightMap.png");
      this.terrainSprite = Laya.MeshTerrainSprite3D.createFromMeshAndHeightMap(meshSprite3D.meshFilter.sharedMesh, heightMap, 6.574996471405029, 10.000000953674316);
      // 这里是获取到第一个位置的参数坐标信息
      for (let i = 0; i < 1; i++) {
        let str = "path" + i;
        this.position = tempScene.getChildByName('Scenes').getChildByName('Area').getChildByName(str).transform.localPosition;
      }

      
      this.tempPosition = new Laya.Vector3(0, 0, 0);

      // this.setTalk();
      this.setCollision();
      this.mesaureCollision();

      //关闭场景中的子节点
      (this.scene.getChildByName('Scenes').getChildByName('HeightMap')).active = false;
      (this.scene.getChildByName('Scenes').getChildByName('Area')).active = false;

      this.position.y = this.terrainSprite.getHeight(this.position.x, this.position.z);

      // 进行添加人物数据信息
      this.currentPersion = new Person(true, this.scene, this.position, new Laya.Vector3(0, 0, 0), "res/models/dude/dude.lh", WebSocketUtils.account);
      this.currentPersion.setCamera(this.camera);
      this.currentPersion.setMoveScript();
      this.currentPersion.setHahMap(this.terrainSprite);
      this.personList.push(this.currentPersion);
      window.setTimeout(function () {
        let params = {
          account: WebSocketUtils.account,
          scenario: '001',
          messageType: 'initData'
        };
        WebSocketUtils.webSocket.sendMessage(JSON.stringify(params), function () {
          _this.currentPersion.initSendPosition();
        });
        _this.currentPersion.setBeforePosition(_this.position);
      }, 100);
      Laya.timer.frameLoop(100, this, function () {
        let param = {
          account: WebSocketUtils.account
        };
        let _this = this;
        HttpRequest.getHeadImg(param).then(r => {
          _this.receiveBackHandler(JSON.stringify(r.data));
        });
      });
    }

    setTalk() {
      this.inputText = new Laya.Input();
      this.inputText.size(Laya.Browser.width - 201, 30);
      this.inputText.x = 0;
      this.inputText.y = Laya.stage.height - this.inputText.height;
      // 移动端输入提示符
      this.inputText.prompt = "Type some word...";
      // 设置字体样式
      this.inputText.bold = true;
      this.inputText.bgColor = "#666666";
      this.inputText.color = "#ffffff";
      this.inputText.fontSize = 20;
      Laya.stage.addChild(this.inputText);

      this.btn = new Laya.Button('res/img/button.png');
      //将Button添加到舞台上
      //设置Button相关属性
      this.btn.width = 200;
      this.btn.height = 30;
      this.btn.pos(Laya.Browser.width - 201,Laya.stage.height - this.inputText.height);
      this.btn.label = "发送给";
      this.btn.clickHandler = new Laya.Handler(this, this.onClickButton);
      Laya.stage.addChild(this.btn);
    }

    onClickButton() {
      if (!this.sendTo) {
        alert("请选择发送给谁！");
        return;
      }
      if (this.inputText.text.length > 64) {
        alert('超过64个字的上限了');
        return;
      }
      let exists = false;
      for(let i=0; i < this.personList.length; i++) {
        if (this.personList[i].isPersion(this.sendTo)) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        this.sendTo = "";
        this.btn.label = "发送给";
        alert("发送对象已经下线");
        return;
      }
      let sendContent = this.inputText.text;
      let params = {
        talk: {
          talkContent: sendContent,
          sendTo: this.sendTo,
          fromTo: WebSocketUtils.account,
          timestamp: '' + (new Date()).getTime(),
          talkType: 'p2p'
        },
        account: this.account,
        scenario: '001',
        messageType: 'talkContent'
      };
      this.inputText.text="";
      WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
      this.currentPersion.setTalkContent(params.talk.talkContent);
    }

    setCollision () {
      // let rigidBody = plane.addComponent(Laya.PhysicsCollider);
      let childByName = this.scene.getChildByName("New-Part-01");
      ColliderUtils.meshColliderShape(childByName);
      // this.setCollisionBridge(childByName);
      let children = this.scene.getChildByName("Scenes").getChildByName("New-Part-01")._children;
      for(let i = 0; i < children.length; i ++) {
        // if (children[i].name.indexOf("Bridge_") != -1) {
        //   this.setCollisionBridge(children[i]);
        // }
        // this.setCollisionBridge(children[i]);
        ColliderUtils.meshColliderShape(children[i]);
      }
      // let rigidBody = childByName.addComponent(Laya.PhysicsCollider);
      // var meshShape = new Laya.MeshColliderShape();
      // //设置网格碰撞盒的网格
      // meshShape.mesh = childByName._meshFilter._sharedMesh;
      // //设置碰撞盒为网格型
      // rigidBody.colliderShape = meshShape;
      // console.info(this.scene)
    }

    mesaureCollision() {
      this.ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
      this.hitResult = new Laya.HitResult();
      this.point = new Laya.Vector2();
      Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
    }

    onMouseDown() {
      this.point.x = Laya.MouseManager.instance.mouseX;
      this.point.y = Laya.MouseManager.instance.mouseY;
      this.camera.viewportPointToRay(this.point, this.ray);
      this.scene.physicsSimulation.rayCast(this.ray, this.hitResult);
      if (this.hitResult.succeeded) {
        let collider = this.hitResult.collider;
        let owner = collider.owner;
        if (owner.selfType) {
          if(owner.selfType == 'personOther') {
            this.sendTo = owner.account;
            // this.btn.label = "发送给" + this.sendTo;
          }
        }
        console.info(collider);
      }
    }

    setCollisionBridge(child) {
      let rigidBody = child.addComponent(Laya.PhysicsCollider);
      let meshShape = new Laya.MeshColliderShape();
      //设置网格碰撞盒的网格
      meshShape.mesh = child._meshFilter._sharedMesh;
      //设置碰撞盒为网格型
      rigidBody.colliderShape = meshShape;
    }

    onFrameLoop(){
      this.skyboxMaterial.exposure = Math.sin(this.exposureNumber += 0.01) + 1;
      this.skyboxMaterial.rotation += 0.01;
    }
    
    receiveBackHandler(message) {
      // 进行接收websocket的消息的
      let otherMessage = JSON.parse(message);
      if (otherMessage.length <= 0) {
        return;
      }
      for (let i = 0; i < otherMessage.length; i++) {
        let isPerson = false;
        for(let j = 0; j < this.personList.length; j++) {
          if (this.personList[j].isPersion(otherMessage[i].account) && otherMessage[i].close) {
            this.personList[j].destoryPerson();
            this.personList.splice(j,1);
            j --;
            isPerson = true;
            break;
          }
          if (this.personList[j].isPersion(otherMessage[i].account)) {
            if(otherMessage[i].messageType == 'position') {
              this.personList[j].setPosition(otherMessage[i].position);
            } else if (otherMessage[i].messageType == 'rotation') {
              this.personList[j].setRotation(otherMessage[i].rotation);
            }else if (otherMessage[i].messageType == 'headImage') {
              this.personList[j].setOtherHeaderImg(otherMessage[i].headImg.imageBase64);
            } else if (otherMessage[i].messageType == 'talkContent') {
              this.personList[j].setTalkContent(otherMessage[i].talk.talkContent);
            }
            isPerson = true;
            break;
          }
        }
        if (isPerson) {
          // 如果这个人存在，那么就不往下执行了。
          continue;
        }
        let model = null;
        for(let j = 0; j < this.personList.length; j++) {
          model = this.personList[j].cloneModel("res/models/dude/dude.lh", this.tempPosition);
          if (model) {
            break;
          }
        }
        let otherPerson = null;
        if (model == null) {
          otherPerson = new Person(true, this.scene, this.tempPosition, new Laya.Vector3(0, 0, 0), "res/models/dude/dude.lh", otherMessage[i].account);
        } else {
          otherPerson = new Person(false, "", "", "", "", "");
          otherPerson.setModel(this.scene, this.tempPosition, "res/models/dude/dude.lh", otherMessage[i].account, model);
        }
        if(otherMessage[i].messageType == 'position') {
          otherPerson.setPosition(otherMessage[i].position);
        } else if (otherMessage[i].messageType == 'rotation') {
          otherPerson.setRotation(otherMessage[i].rotation);
        } else if (otherMessage[i].messageType == 'headImage') {
          otherPerson.setOtherHeaderImg(otherMessage[i].headImg.imageBase64);
        } else if (otherMessage[i].messageType == 'talkContent') {
          otherPerson.setTalkContent(otherMessage[i].talk.talkContent);
        }
        this.personList.push(otherPerson);
      }
    }
  }

  // 这里建立socket的连接
  class LoadResources {
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
        this.text.color = "#ffffff";
        this.text.align = "center";
        this.text.valign = "bottom";
        this.text.width = Laya.Browser.width;
        this.text.height = Laya.Browser.height / 2 + 80;
        Laya.stage.addChild(this.text);
        this.processOuter = new Laya.Image();
        this.processOuter.skin = "res/img/process-outer.png";
        this.processOuter.height = "20";
        this.processOuter.width = Laya.Browser.width - Laya.Browser.width * 0.1 * 2;
        this.processOuter.x = Laya.Browser.width * 0.1;
        this.processOuter.y = Laya.Browser.height / 2 + 40;
        Laya.stage.addChild(this.processOuter);
        this.processInnter = new Laya.Image();
        this.processInnter.skin = "res/img/process-innter.png";
        this.processInnter.height = "16";
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
      this.progress = 0.5;
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
      this.processInnter.width = Math.floor(this.processOuter.width * (progress / 2 + this.progress));
  	}

  	onError(err) {
  		console.log("加载失败: " + err);
  	}
  }

  class LoadScene$1 extends Laya.Scene {

      constructor() { 
          super(); 
          new LoadResources();
      }
  }

  /**This class is automatically generated by LayaAirIDE, please do not make any modifications. */

  class GameConfig {
      static init() {
          //注册Script或者Runtime引用
          let reg = Laya.ClassUtils.regClass;
  		reg("scenes/LoadScene.js",LoadScene$1);
      }
  }
  GameConfig.width = 640;
  GameConfig.height = 1136;
  GameConfig.scaleMode ="fixedwidth";
  GameConfig.screenMode = "none";
  GameConfig.alignV = "top";
  GameConfig.alignH = "left";
  GameConfig.startScene = "LoadScene.scene";
  GameConfig.sceneRoot = "";
  GameConfig.debug = false;
  GameConfig.stat = false;
  GameConfig.physicsDebug = false;
  GameConfig.exportSceneToJson = true;

  GameConfig.init();

  class Main {
  	constructor() {
  		//根据IDE设置初始化引擎		
  		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
  		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
  		Laya["Physics"] && Laya["Physics"].enable();
  		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
  		Laya.stage.scaleMode = GameConfig.scaleMode;
  		Laya.stage.screenMode = GameConfig.screenMode;
  		Laya.stage.alignV = GameConfig.alignV;
  		Laya.stage.alignH = GameConfig.alignH;
  		//兼容微信不支持加载scene后缀场景
  		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

  		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
  		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
  		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
  		if (GameConfig.stat) Laya.Stat.show();
  		Laya.alertGlobalError(true);

  		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
  		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
  	}

  	onVersionLoaded() {
  		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
  		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
  	}

  	onConfigLoaded() {
  		//加载IDE指定的场景
  		GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
  	}
  }
  //激活启动类
  new Main();

}());
