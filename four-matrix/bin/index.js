/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_landscape";

//-----libs-begin-----
loadLib("libs/laya.core.js")
loadLib("libs/laya.ui.js")
loadLib("libs/laya.d3.js")
loadLib("libs/laya.physics3D.js")
loadLib("libs/laya.ani.js");
loadLib("libs/laya.tiledmap.js");
loadLib("libs/laya.physics.js")
loadLib("libs/laya.html.js")
loadLib("libs/laya.device.js")
loadLib("other_libs/axios.min.js")
loadLib("scripts/PersionMoveScript.js")
loadLib("scripts/PersonRotationMoveScript.js")
loadLib("scripts/TriggerCollisionScript.js")
//-----libs-end-------
loadLib("js/bundle.js");
