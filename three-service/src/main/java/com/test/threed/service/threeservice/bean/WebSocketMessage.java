/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.bean;

import lombok.Data;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-10-30
 */
@Data
public class WebSocketMessage {
    /**
     * 账号
     */
    private String account;

    /**
     * 位置
     */
    private Position position;

    /**
     * 旋转的角度信息
     */
    private Position rotation;

    /**
     * 头像的图片信息
     */
    private Image headImg;

    /**
     * 谈话的内容
     */
    private Talk talk;

    /**
     * 场景号
     */
    private String scenario;

    /**
     * 是否关闭了
     */
    private boolean isClose = false;

    /**
     * 消息通信的类型
     */
    private String messageType;
}
