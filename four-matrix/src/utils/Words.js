export default class Words {
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
}
