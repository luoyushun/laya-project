class PersonRotationMoveScript extends Laya.Script3D{
  constructor(){
      super();
      this._tempVector3 = new Laya.Vector3();
      this.yawPitchRoll = new Laya.Vector3();
      this.resultRotation = new Laya.Quaternion();
      this.tempRotationZ = new Laya.Quaternion();
      this.tempRotationX = new Laya.Quaternion();
      this.tempRotationY = new Laya.Quaternion();
      this.rotaionSpeed = 0.00006;
      this.isRotation = false;
      this.isMove = false;
      this.rotation = new Laya.Vector3(0, 0, 0);
      this.position = new Laya.Vector3(0, 0, 0);
  }
  setPersion(persion) {
      this.persionClas = persion;
  }
  setRotation(rotation) {
    this.rotation.x = rotation.x;
    this.rotation.y = rotation.y;
    this.rotation.z = rotation.z;
    this.isRotation = true;
  }
  setMove(position) {
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
    this.isMove = true;
  }
  onAwake(){
    this.persion = this.owner;
  }
  _onDestroy() {
      //关闭监听函数
  }
  onUpdate(state) {
    if (this.isRotation) {
      // this.persion.transform.rotate(this.rotation, true, true);
      var yprElem = this.yawPitchRoll;
			yprElem.x = this.rotation.x;
			yprElem.y = this.rotation.y;
			this.updateRotation();
      this.isRotation = false;
    }
    if (this.isMove) {
      this.persion.transform.position= this.position;
      this.isMove = false;
    }
  }
  updateRotation() {
    if (Math.abs(this.yawPitchRoll.y) < 1.50) {
        Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
        this.tempRotationZ.cloneTo(this.persion.transform.localRotation);
        this.persion.transform.localRotation = this.persion.transform.localRotation;
    }
  }
}