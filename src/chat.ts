import {log, getTimestamp} from "./utils";

export interface ChatOptions {
    [key: string]: any;

    timestamps: string;
    fontSize: string;
}

interface UserData {
    color: string;
    displayName: string;
    name: string;
    subscriber: boolean;
    turbo: boolean;
    userType: string;
}

interface Message {
    action: boolean;
    message: string;
    nick: string;
    emotes: string;

    timestamp: string;
    nickStyle: string;
    cssClass: string;

    userData: UserData;
}

export class Chat {
[key: string]: any;

    socket: SocketIOClient.Socket = null;
    channel: string = null;
    messages: Message[];
    showTimestamps: boolean;
    historyLength: number = 1000;
    lines: HTMLElement;
    html: HTMLElement;

    timestamps: string;
    fontSize: string;

    odd: boolean;
    originalFontSize: string;

    constructor(options: ChatOptions) {
        log("Constructing Chat");

        this.setOptions(options);
        this.messages = [];

        this.lines = <HTMLElement>(document.querySelector(".lines"));
        this.html = <HTMLElement>(document.querySelector("html"));
        this.originalFontSize = this.html.style.fontSize;

        log("Binding chat rivets");
        var element = document.querySelector("section.chat");
        rivets.bind(element, this);
    }

    setOptions(options: ChatOptions) {
        for (let key in options) {
            this[key] = options[key];
        }

        this.showTimestamps = (this.timestamps !== "none");
    }

    start(channel: string) {
        log(`Starting Chat for ${channel}`);
        this.channel = channel;
        this.odd = true;
        this.connect();
        this.html.style.fontSize = this.fontSize;
    }

    stop() {
        this.html.style.fontSize = this.originalFontSize;
        if (this.socket) {
            this.socket.disconnect();
            log("Disconnected from chat");
        }

        this.messages = [];
    }

    private connect() {
        let server = 'https://tmi-relay.nightdev.com/';

        log(`Connecting to ${server}`);

        this.socket = io(server);
        this.socket.on('ohai', this.onConnect.bind(this));
        this.socket.on('much connect', this.onJoined.bind(this));
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('clearchat', this.onClearChat.bind(this));
    }

    private onConnect() {
        log('Connected to server');

        if (this.channel) {
            this.join();
        }
    }

    private onJoined() {
        log(`Joined ${this.channel}`);
    }

    private onMessage(message: Message) {
        //log(`Got message from ${message.nick}: ${message.message}`);

        this.processMessage(message);

        this.messages.push(message);

        if (this.messages.length > this.historyLength) {
            this.messages.shift();
        }

        setTimeout(this.goToBottom.bind(this), 25);

        ga('send', {
            hitType: 'event',
            eventCategory: 'Chat',
            eventAction: 'message',
            eventLabel: this.channel
        });
    }

    private onClearChat(nick: string) {
        log(`${nick} got purged`);

        let filtered = this.messages.filter(function (message) {
            return (message.nick !== nick);
        });

        let diff = this.messages.length - filtered.length;
        this.messages = filtered;

        log(`Removed ${diff} line(s) from ${nick}`);

        ga('send', {
            hitType: 'event',
            eventCategory: 'Chat',
            eventAction: 'purge',
            eventLabel: this.channel
        });
    }

    private join() {
        log(`Joining channel ${this.channel} chat`);
        this.socket.emit('join', this.channel);
    }

    private processMessage(message: Message) {
        message.timestamp = this.getMessageTimestamp();

        let original = message.message;
        if (message.emotes) {
            //log("Message has emotes");

            let emotes = message.emotes.split("/");
            emotes.forEach(function (emote) {
                let parts = emote.split(":");
                let id = parts[0];
                let range = parts[1].split(",")[0].split("-");
                let code = original.substring(Number(range[0]), Number(range[1]) + 1);


                let regex = new RegExp(`\\b${code}\\b`, 'g');

                let proto = window.location.protocol;

                if (proto === "file:") {
                    proto = "http:";
                }

                let url = `${proto}//static-cdn.jtvnw.net/emoticons/v1/${id}/2.0`;
                let img = `<img class="emote" src="${url}" />`;

                //log(`Replacing "${code}" with emote ${id}`);
                //log(img);

                message.message = message.message.replace(regex, img);
            });
        }

        message.nickStyle = `color: ${message.userData.color};`;

        let oddEven = (this.odd ? "odd" : "even");
        message.cssClass = `line ${oddEven}`;
        this.odd = !this.odd;
    }

    private getMessageTimestamp() {
        let now = new Date();
        let h: string, m: string, s: string, extra: string = "";

        if (this.timestamps === "24h") {
            h = this.pad(now.getHours());
            m = this.pad(now.getMinutes());
            s = this.pad(now.getSeconds());
        } else if (this.timestamps === "12h") {
            let hours = now.getHours();
            extra = (hours >= 12 ? 'pm' : 'am');
            hours = hours % 12; // 13 -> 1
            hours = hours ? hours : 12; // 0 -> 12
            h = this.pad(hours);
            m = this.pad(now.getMinutes());
            s = this.pad(now.getSeconds());
        } else {
            return "";
        }


        return `${h}:${m}:${s}${extra}`
    }

    private pad(number: number, length = 2, char = "0") {
        let num = String(number);
        while (num.length < length) {
            num = char + num;
        }

        return num;
    }

    private goToBottom() {
        this.lines.scrollTop = this.lines.scrollHeight;
    }
}
