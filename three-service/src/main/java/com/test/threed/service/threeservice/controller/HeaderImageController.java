/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.controller;

import com.test.threed.service.threeservice.bean.WebSocketMessage;
import com.test.threed.service.threeservice.websocket.WebSocket;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-11-06
 */
@RequestMapping("/header/img")
@RestController
public class HeaderImageController {

    @PostMapping("/upload")
    public String updateHeaderImg(@RequestBody WebSocketMessage webSocketMessage) {
        WebSocket.messageHeadImgMap.put(webSocketMessage.getAccount(), webSocketMessage);
        return "success";
    }

    @GetMapping("/get")
    public List<WebSocketMessage> getHeaderImg(String account) {
        return WebSocket.messageHeadImgMap.entrySet().stream()
                .filter(item -> !item.getKey().equalsIgnoreCase(account))
                .map(Map.Entry::getValue).collect(Collectors.toList());
    }

}
