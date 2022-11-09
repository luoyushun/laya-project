class TriggerCollisionScript extends Laya.Script3D {
  constructor(){
    super();
  }
  onTriggerEnter(other) {
      this.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Vector4(0.0, 1.0, 0.0, 1.0);
  }

  onTriggerStay(other) {
  }

  onTriggerExit(other) {
      this.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Vector4(1.0, 1.0, 1.0, 1.0);
  }
  onCollisionEnter(collision) {
      if (collision.other.owner === this.kinematicSprite)
          this.owner.meshRenderer.sharedMaterial.albedoColor = new Laya.Vector4(0.0, 0.0, 0.0, 1.0);
  }
  onCollisionStay(collision) {
  }
  onCollisionExit(collision) {
  }
}