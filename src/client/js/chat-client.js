var global = require('./global');

class ChatClient {
    constructor(params) {
        this.canvas = global.canvas;
        this.socket = global.socket;
        this.player = global.player;
        var input = document.getElementById('chatInput');
        input.addEventListener('keypress', this.sendChat.bind(this));
        global.chatClient = this;
    }
    // 玩家
    addChatLine(name, message, me) {
        var newline = document.createElement('li');
        //传进来的me是一个布尔值，,true时表示自己发的消息(类名为me)，false表示别人发的消息(类名为friend);
        newline.className = (me) ? 'me' : 'friend';
        newline.innerHTML = '<b>' + name + '</b>: ' + message;
        this.appendMessage(newline);
    }
    // 系统
    addSystemLine(message) {
        var newline = document.createElement('li');
        newline.className = 'system';
        newline.innerHTML = message;
        this.appendMessage(newline);
    }
    //消息上树
    appendMessage(newline) {
        var chatList = document.getElementById('chatList');
        //聊天框上的消息(子节点)超过10条会删除最顶上的消息，避免溢出
        if (chatList.childNodes.length > 10) {
            chatList.removeChild(chatList.childNodes[0]);
        }
        chatList.appendChild(newline);
    }
    //发送消息
    sendChat(key) {
        var input = document.getElementById('chatInput');

        key = key.keyCode;

        if (key === global.KEY_ENTER) {
            var text = input.value;
            if (text !== '') {
                //命令消息
                if (text === "-ping") {
                    this.checkLatency();
                    global.chatClient = this;
                } else {
                    //常规消息
                    this.socket.emit('playerChat', { sender: this.player.name, message: text });
                    this.addChatLine(this.player.name, text, true);
                }
                //重置聊天输入框
                input.value = '';
                this.canvas.cv.focus();
            }
        }
    }
    //测延迟
    checkLatency() {
        global.startPingTime = Date.now();
        this.socket.emit('pingcheck');
    }
}

//暴露ChatClient
module.exports = ChatClient;
