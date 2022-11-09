export default class ColliderUtils {
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
}