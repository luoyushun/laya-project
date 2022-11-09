/*
    Copyright is LuoYuShun to 2022-2022
*/
package com.test.threed.service.threeservice.websocket;

import com.alibaba.fastjson.JSON;
import com.test.threed.service.threeservice.bean.Position;
import com.test.threed.service.threeservice.bean.WebSocketMessage;
import com.test.threed.service.threeservice.emnus.MessageTypeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 描述
 *
 * @author LuoYuShun
 * @since 2022-10-29
 */
@ServerEndpoint("/websocket/{username}")
@Component
@Slf4j
public class WebSocket {
    private static int onlineCount = 0;
    /**
     * 客户端的map
     */
    private static ConcurrentHashMap<String, WebSocket> clients = new ConcurrentHashMap<>();
    /**
     * 位置信息的map
     * 因为这里不是单机的服务，因此建议使用消息队列的方式来通知其他节点中的连接，将对应的数据通知到位，因此数据是不这样存储的，是放到redis中进行存储。
     * 只有终端有下线的操作或者上线的操作才将数据冲服务器端读取出来，否则是不用进行读取数据的。只要同步还消息队列发送过来的数据即可。
     */
    private static ConcurrentHashMap<String, WebSocketMessage> messagePositionMap = new ConcurrentHashMap<>();

    /**
     * 旋转的信息map
     * 因为这里不是单机的服务，因此建议使用消息队列的方式来通知其他节点中的连接，将对应的数据通知到位，因此数据是不这样存储的，是放到redis中进行存储。
     * 只有终端有下线的操作或者上线的操作才将数据冲服务器端读取出来，否则是不用进行读取数据的。只要同步还消息队列发送过来的数据即可。
     */
    private static ConcurrentHashMap<String, WebSocketMessage> messageRotationMap = new ConcurrentHashMap<>();

    /**
     * 总旋转的角度信息
     * 因为这里不是单机的服务，因此建议使用消息队列的方式来通知其他节点中的连接，将对应的数据通知到位，因此数据是不这样存储的，是放到redis中进行存储。
     * 只有终端有下线的操作或者上线的操作才将数据冲服务器端读取出来，否则是不用进行读取数据的。只要同步还消息队列发送过来的数据即可。
     */
    private static ConcurrentHashMap<String, WebSocketMessage> messageRotationTotalMap = new ConcurrentHashMap<>();

    /**
     * 这里是同步头像的数据的map的数据信息的
     */
    public static ConcurrentHashMap<String, WebSocketMessage> messageHeadImgMap = new ConcurrentHashMap<>();

    /**
     * session绘画
     */
    private Session session;

    /**
     * 登录的用户名称
     */
    private String username;

    @OnOpen
    public void onOpen(@PathParam("username") String username, Session session) throws IOException {

        this.username = username;
        this.session = session;
        addOnlineCount();
        clients.put(username, this);
        log.info(" {} 已经连接", this.username);
        // 发送消息出去
        session.getAsyncRemote().sendText(JSON.toJSONString(messagePositionMap.values()));
        WebSocketMessage webSocketMessage = new WebSocketMessage();
        Position position = new Position();
        position.setX(12.2);
        position.setY(10.379);
        position.setZ(9.710001);
        position.setTimestamp("" + System.currentTimeMillis());
        webSocketMessage.setPosition(position);
        webSocketMessage.setAccount(username);
        webSocketMessage.setMessageType(MessageTypeEnum.POSITION.getType());
        webSocketMessage.setClose(false);
        messagePositionMap.put(webSocketMessage.getAccount(), webSocketMessage);
        sendMessageTo(JSON.toJSONString(Collections.singletonList(webSocketMessage)), session);
    }

    @OnClose
    public void onClose() throws IOException {
        clients.remove(username);
        WebSocketMessage socketMessage = messagePositionMap.remove(username);
        messageRotationTotalMap.remove(username);
        messageRotationMap.remove(username);
        messageHeadImgMap.remove(username);
        if (Objects.isNull(socketMessage)) {
            socketMessage = new WebSocketMessage();
        }
        socketMessage.setClose(true);
        // 通知在线的人员，有人进行下线了
        log.info("{} 下线了", username);
        sendMessageAll(JSON.toJSONString(Collections.singletonList(socketMessage)));
        subOnlineCount();
    }

    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        log.debug("接收的信息 {}", message);
        WebSocketMessage webSocketMessage = JSON.parseObject(message, WebSocketMessage.class);
        if (Objects.isNull(webSocketMessage) || StringUtils.isEmpty(webSocketMessage.getAccount())) {
            return;
        }
        dealMessage(webSocketMessage, session);
    }

    /**
     * 处理数据信息
     *
     * @param webSocketMessage 数据信息
     * @throws IOException 异常类型
     */
    private void dealMessage(WebSocketMessage webSocketMessage, Session session) throws IOException {
        if (MessageTypeEnum.INITDATA.getType().equalsIgnoreCase(webSocketMessage.getMessageType())) {
            // 这里是初始化数据，因此需要将对应的数据发送给前端去
            List<String> accounts = clients.entrySet().stream()
                    .filter(item -> !item.getValue().session.equals(session))
                    .map(Map.Entry::getKey).collect(Collectors.toList());
            List<WebSocketMessage> messages = messagePositionMap.entrySet().stream()
                    .filter(item -> accounts.contains(item.getKey()))
                    .map(Map.Entry::getValue).collect(Collectors.toList());
            List<WebSocketMessage> rotations = messageRotationTotalMap.entrySet().stream()
                    .filter(item -> accounts.contains(item.getKey()))
                    .map(Map.Entry::getValue).collect(Collectors.toList());
            if (!CollectionUtils.isEmpty(rotations)) {
                messages.addAll(rotations);
            }
            session.getAsyncRemote().sendText(JSON.toJSONString(messages));
        } else if (MessageTypeEnum.POSITION.getType().equalsIgnoreCase(webSocketMessage.getMessageType())) {
            messagePositionMap.put(webSocketMessage.getAccount(), webSocketMessage);
            webSocketMessage.setClose(false);
            sendMessageTo(JSON.toJSONString(Collections.singletonList(webSocketMessage)), session);
        } else if (MessageTypeEnum.ROTATION.getType().equalsIgnoreCase(webSocketMessage.getMessageType())) {
            messageRotationMap.put(webSocketMessage.getAccount(), webSocketMessage);
            WebSocketMessage message = messageRotationTotalMap.get(webSocketMessage.getAccount());
            if (Objects.isNull(message)) {
                messageRotationTotalMap.put(webSocketMessage.getAccount(), webSocketMessage);
            } else {
                Position rotation = message.getRotation();
                rotation.setX(webSocketMessage.getRotation().getX());
                rotation.setY(webSocketMessage.getRotation().getY());
                rotation.setZ(webSocketMessage.getRotation().getZ());
                if (new BigDecimal(rotation.getTimestamp()).compareTo(new BigDecimal(webSocketMessage.getRotation().getTimestamp())) <= 0) {
                    rotation.setTimestamp(webSocketMessage.getRotation().getTimestamp());
                }
            }
            webSocketMessage.setClose(false);
            sendMessageTo(JSON.toJSONString(Collections.singletonList(webSocketMessage)), session);
        } else if (MessageTypeEnum.TALKCONT.getType().equalsIgnoreCase(webSocketMessage.getMessageType())) {
            // 进行谈话内容的发送
            // 目前是不区分发送的类型的，都是点对点的信息发送
            WebSocket webSocket = clients.get(webSocketMessage.getTalk().getSendTo());
            if (Objects.isNull(webSocket)) {
                return;
            }
            synchronized(webSocket.session) {
                // 进行发送信息
                webSocket.session.getAsyncRemote().sendText(JSON.toJSONString(Collections.singletonList(webSocket)));
            }
        }

    }

    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }

    public void sendMessageTo(String message, Session session) throws IOException {
        // 这里有多线程的问题
        for (WebSocket item : clients.values()) {
            if (item.session.equals(session) || !item.session.isOpen()) {
                // 自己不发送，不发送给自己
                continue;
            }
            try {
                synchronized(item.session) {
                    item.session.getAsyncRemote().sendText(message);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void sendMessageAll(String message) throws IOException {
        // 这里有多线程的问题
        for (WebSocket item : clients.values()) {
            if (!item.session.isOpen()) {
                continue;
            }
            try {
                synchronized(item.session) {
                    item.session.getAsyncRemote().sendText(message);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        WebSocket.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        WebSocket.onlineCount--;
    }

    public static synchronized ConcurrentHashMap<String, WebSocket> getClients() {
        return clients;
    }
}
