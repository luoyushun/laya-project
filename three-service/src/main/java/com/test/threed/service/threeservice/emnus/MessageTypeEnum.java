/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.emnus;

import lombok.Getter;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-10-31
 */
public enum MessageTypeEnum {
    /**
     * 位置
     */
    POSITION("position", "位置的信息"),
    /**
     * 旋转类型
     */
    ROTATION("rotation", "旋转的信息"),
    /**
     * 初始化的数据信息
     */
    INITDATA("initData", "初始化的数据信息"),

    /**
     * 头像的图片信息
     */
    HEADIMAGE("headImage", "头像的图片信息"),

    /**
     * 谈话的内容信息
     */
    TALKCONT("talkContent", "谈话的内容信息")
    ;
    /**
     * 类型
     */
    @Getter
    private final String type;

    /**
     * 描述
     */
    @Getter
    private final String desc;

    MessageTypeEnum(String type, String desc) {
        this.type = type;
        this.desc = desc;
    }
}
