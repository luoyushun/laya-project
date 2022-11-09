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
public class Position {
    /**
     * x轴的坐标
     */
    private double x;

    /**
     * y轴的坐标
     */
    private double y;

    /**
     * z轴的坐标
     */
    private double z;
    /**
     * 时间的游标
     */
    private String timestamp;
}
