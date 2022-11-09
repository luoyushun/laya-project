class PersionMoveScript extends Laya.Script3D{
    constructor(){
        super();
        this._tempVector3 = new Laya.Vector3();
        this.yawPitchRoll = new Laya.Vector3();
        this.resultRotation = new Laya.Quaternion();
        this.tempRotationZ = new Laya.Quaternion();
        this.tempRotationX = new Laya.Quaternion();
        this.tempRotationY = new Laya.Quaternion();
        this.rotaionSpeed = 0.00006;
    }
    setPersion(persion) {
        this.persionClas = persion;
    }
	onAwake(){
		Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
		Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
		this.persion = this.owner;
	}
    _onDestroy() {
        //关闭监听函数
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
    }
    onUpdate(state) {
		var elapsedTime = Laya.timer.delta;
		if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isMouseDown) {
			
				
			var offsetX = Laya.stage.mouseX - this.lastMouseX;
			var offsetY = Laya.stage.mouseY - this.lastMouseY;
				
			var yprElem = this.yawPitchRoll;
			yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
			yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
			this.updateRotation();
		}
        // 进行键盘的控制前后左右上下
        Laya.KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime);//W
        Laya.KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime);//S
        Laya.KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime);//A
        Laya.KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime);//D
        Laya.KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime);//Q
        Laya.KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime);//E


		this.lastMouseX = Laya.stage.mouseX;
		this.lastMouseY = Laya.stage.mouseY;
		
     
    }
    mouseDown(e) {
        //获得鼠标的旋转值
        this.persion.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
        //获得鼠标的xy值
        this.lastMouseX = Laya.stage.mouseX;
        this.lastMouseY = Laya.stage.mouseY;
        //设置bool值
        this.isMouseDown = true;
     
    }
    mouseUp(e) {
        //设置bool值
        this.isMouseDown = false;
    }

    locationPosition(backPosition) {
        let y = this.persionClas.getY(backPosition.x, backPosition.z);
        if (!y) {
            backPosition.x = this.persionClas.getBeforePosition().x;
            backPosition.y = this.persionClas.getBeforePosition().y;
            backPosition.z = this.persionClas.getBeforePosition().z;
            this.persion.transform.position = backPosition;
            return;
        } else {
            backPosition.y = y;
            this.persion.transform.position = backPosition;
            this.persionClas.setBeforePosition(backPosition);
        }
    }
    
    /**
     * 向前移动。
     */
    moveForward(distance) {
        this._tempVector3.x = 0;
        this._tempVector3.y = 0;
        this._tempVector3.z = distance;
        this.persion.transform.translate(this._tempVector3);
        let backPosition = this.persion.transform.position;
        this.locationPosition(backPosition);
    }
    /**
     * 向右移动。
     */
    moveRight(distance) {
        this._tempVector3.y = 0;
        this._tempVector3.z = 0;
        this._tempVector3.x = distance;
        this.persion.transform.translate(this._tempVector3);
        let backPosition = this.persion.transform.position;
        this.locationPosition(backPosition);
    }
    /**
     * 向上移动。
     */
    moveVertical(distance) {
        this._tempVector3.x = this._tempVector3.z = 0;
        this._tempVector3.y = distance;
        this.persion.transform.translate(this._tempVector3, false);
    }

    updateRotation() {
        if (Math.abs(this.yawPitchRoll.y) < 0.75) {
            Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
            this.tempRotationZ.cloneTo(this.persion.transform.localRotation);
            this.persion.transform.localRotation = this.persion.transform.localRotation;
            this.persionClas.setPersonRotation(this.yawPitchRoll);
        }
    }
}