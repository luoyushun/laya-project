/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-10-29
 */
@Configuration
public class WebSocketConfig {
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
