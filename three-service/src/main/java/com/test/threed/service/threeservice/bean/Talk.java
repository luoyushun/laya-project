/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.bean;

import lombok.Data;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-11-07
 */
@Data
public class Talk {
    /**
     * 谈话的内容
     */
    private String talkContent;

    /**
     * 发送给谁的
     */
    private String sendTo;

    /**
     * 来自那个的
     */
    private String fromTo;

    /**
     * 时间游标
     */
    private String timestamp;

    /**
     * 谈话的类型：这里表示群信息，系统信息，点对点的发送信息
     */
    private String talkType;
}
