import HttpRequest from "../message/HttpRequest";
import WebSocketUtils from "../message/WebSocketUtils";
import ColliderUtils from "../utils/ColliderUtils";
import Talk from "./Talk";
export default class Person{
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
    this.upVector3 = new Laya.Vector3(0, 0, 0)
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
   * ?????????????????????????????????
   * @param {*} url ???????????????
   * @param {*} top ?????????
   * @param {*} left ?????????
   * @param {*} wordNum ????????????
   */
  setTalkContent(content) {
    this.talk.setTalkContent(content);
    this.talk.setPosition(new Laya.Vector3(1, 5, 0));
  }

  /**
   * ???????????????:????????????
   */
  setCollider() {
    // --------------------------start------------------------------
    // ---------------exception Uncaught TypeError: value._getPhysicMesh is not a function--------
    // var hit = this.persionModel.getChildByName("dude").getChildByName("him");
    // let lizardCollider = this.persionModel.addComponent(Laya.PhysicsCollider);
    // console.info(this.persionModel)
    // lizardCollider.isTrigger = true;
    // var meshShape = new Laya.MeshColliderShape();
    // //??????????????????????????????
    // meshShape.mesh = hit;
    // //???????????????????????????
    // lizardCollider.colliderShape = meshShape;
    // //???????????????
    // lizardCollider.friction = 2;
    // //????????????
    // lizardCollider.restitution = 0.3;
    // let script = box.addComponent(TriggerCollisionScript);
    //     script.kinematicSprite = this.kinematicSphere;
    // --------------------------end--------------------------------
    // --------------------------start------------------------------
    // --------------------------?????????????????????---------------------
    // ?????????????????????
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
   * ???????????????????????????????????????
   */
  setCameraHead() {
    this.videoHeader = Laya.Browser.createElement("video");
    this.videoHeader.setAttribute("width", "640");
    this.videoHeader.setAttribute("height", "480");
    this.videoHeader.setAttribute("autoplay", "true");
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
     navigator.mozGetUserMedia || navigator.msGetUserMedia; //??????????????????????????????????????????
     let _this = this;
    navigator.getUserMedia({
        video: true
    }, function (stream) {
      _this.gotStream(stream)
    }, this.noStream);
    Laya.timer.frameLoop(1, this, function() {
      this.cxtHeader.drawImage(this.videoHeader, 0, 0, 256, 256);
      this.texture2DHeader.loadImageSource(this.cavHeader);
      this.matHeader.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
      //???????????????
      this.matHeader.albedoTexture = this.texture2DHeader;
      this.headPlant.meshRenderer.sharedMaterial.cull = Laya.RenderState.CULL_NONE;
    })
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
      }
      HttpRequest.uploadHeadImg(params);
    })
  }

  setOtherHeaderImg(img) {
    this.imgHeader.setAttribute("src", img);
    this.cxtHeader.drawImage(this.imgHeader, 0, 0, 256, 256);
    this.texture2DHeader.loadImageSource(this.cavHeader);
    this.matHeader.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
    //???????????????
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
      // ??????????????????????????????????????????
      return;
    }
    this.titlePlant = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(1, 0.3));
    this.titlePlant.transform.rotate(new Laya.Vector3(90, 180, 180), true, false);
    this.persionModel.addChild(this.titlePlant);
    this.titlePlant.transform.localPosition = new Laya.Vector3(0, 4, 0);

    this.mat = new Laya.UnlitMaterial();
    this.titlePlant.meshRenderer.sharedMaterial = this.mat;
    //??????cavans
    this.cav = Laya.Browser.createElement("canvas");
    this.cxt = this.cav.getContext("2d");
    this.cav.width = 256;
    this.cav.height = 40;
    this.cxt.fillStyle = 'rgb(255,255,255)';
    this.cxt.fillRect(0,0,256,40);

    this.cxt.fillStyle = 'rgb(0,0,0)';

    this.cxt.font = "30px ??????";

    this.cxt.textAlign = "center";//?????????????????????

    // this.cxt.textBaseline = "center";//??????????????????????????????

    this.cxt.fillText(this.account, 128, 27);//?????????cxt.font="bold 60px ??????";

    this.texture2D = new Laya.Texture2D(256, 256);

    this.texture2D.loadImageSource(this.cav);

    this.mat.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;

    //???????????????

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
   * ??????????????????????????????????????????????????????????????????
   * @param {*} camera 
   */
  setCamera(camera) {
    // ????????????????????????????????????????????????????????????????????????????????????????????????
    this.cameraRotate = new Laya.Vector3(-45, 180, 0);

    // ?????????????????????????????????????????????
    let moveCamera = this.persionModel.addChild(camera);
    // ????????????-7????????????????????????????????????????????????????????????????????????????????????????????????????????????
    moveCamera.transform.localPosition = new Laya.Vector3(0, 7, 7);
    moveCamera.transform.rotate(this.cameraRotate, true, false);
  }

  /**
   * ?????????????????????
   */
  setMoveScript() {
    // PersionMoveScript
    this.persionModel.addComponent(PersionMoveScript);
    this.persionModel.getComponent(PersionMoveScript).setPersion(this);
  }

  /**
   * ??????height?????????????????????
   * @param {*} terrainSprite 
   */
  setHahMap(terrainSprite) {
    this.terrainSprite = terrainSprite;
  }

  /**
   * ??????y?????????
   * @param {*} x 
   * @param {*} z 
   * @returns 
   */
  getY(x, z) {
    return this.terrainSprite.getHeight(x, z);
  }
  
  /**
   * ????????????????????????????????????
   * 
   * @param {*} id ?????????????????????
   * @returns  ???????????????????????????
   */
  isPersion(account) {
    return this.account == account;
  }

  
  /**
   * ??????????????????????????????
   * @returns ????????????
   */
  setPosition(position) {
    if(Number(position.timestamp) < Number(this.otherPositionMessage.timestamp)) {
      // ?????????????????????
      return;
    }
    this.otherPositionMessage = position;
    this.otherPosition.x = position.x;
    this.otherPosition.y = position.y;
    this.otherPosition.z = position.z;
    //????????????
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
   * ????????????
   * @param {*} ration ???????????????
   */
  setRation(ration) {
    this.persionModel.transform.rotate(ration, false, false);
    this.persionModel.transform.position=this.currentPosition;
  }

  getPosition() {
    return this.persionModel.transform.position;
  }

  /**
   * ????????????????????????????????????
   * 
   * @param {*} position ??????
   */
  getBeforePosition() {
    return this.beforePosition;
  }

  /**
   * ?????????????????????????????????
   * @param {*} rotation ??????
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
    }
    WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
  }

  /**
   * ??????????????????
   */
  destoryPerson() {
    this.persionModel.destroy();
  }
  /**
   * ????????????????????????????????????
   * 
   * @param {*} position ??????
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
    }
    WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
  }
  /**
   * ????????????????????????????????????
   * 
   * @param {*} position ??????
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
    }
    this.threePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
    this.twoPosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
    this.onePosition = {x: this.currentPosition.x, y: this.currentPosition.y, z: this.currentPosition.z};
    WebSocketUtils.webSocket.sendMessage(JSON.stringify(params));
  }
}