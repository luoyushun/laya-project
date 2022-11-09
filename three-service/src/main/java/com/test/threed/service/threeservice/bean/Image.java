/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.bean;

import lombok.Data;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-11-05
 */
@Data
public class Image {
    /**
     * 图片
     */
    private String imageBase64;

    /**
     * 时间的游标
     */
    private String timestamp;
}
