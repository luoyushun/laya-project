import HttpRequest from "../message/HttpRequest";
import WebSocketUtils from "../message/WebSocketUtils";
import Audio from "../utils/Audio";
import ColliderUtils from "../utils/ColliderUtils";
import Person from "./Person";

export default class LoadScene {
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
      }
      WebSocketUtils.webSocket.sendMessage(JSON.stringify(params), function () {
        _this.currentPersion.initSendPosition();
      })
      _this.currentPersion.setBeforePosition(_this.position);
    }, 100)
    Laya.timer.frameLoop(100, this, function () {
      let param = {
        account: WebSocketUtils.account
      }
      let _this = this;
      HttpRequest.getHeadImg(param).then(r => {
        _this.receiveBackHandler(JSON.stringify(r.data));
      })
    })
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
      alert("请选择发送给谁！")
      return;
    }
    if (this.inputText.text.length > 64) {
      alert('超过64个字的上限了')
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
    }
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
          this.personList.splice(j,1)
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