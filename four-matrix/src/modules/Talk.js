import Words from "../utils/Words";

export default class Talk {
  constructor(containor, url, left, top, position) {
    this.containor = containor;
    this.url = url;
    this.left = left;
    this.top = top;
    this.isAddContainor = false;
    this.aliveTime = 10000;
    this.startTime = (new Date()).getTime();
    this.initTalk(position);
    this.setTalkContent("hello")
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