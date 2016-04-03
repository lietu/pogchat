import {log} from "./utils";
import {Chat, ChatOptions} from "./chat";

const DEFAULT_CHAT_OPTIONS: ChatOptions = {
    timestamps: "24h",
    fontSize: "18px",
};

export class App {
    chat: Chat;
    chatOptions: ChatOptions;

    channel: string;
    fontSize: string;
    timestamps: string;
    error: boolean = false;

    chatView: Element;
    loaderView: Element;
    settingsView: Element;
    back: Element;
    form: Element;

    constructor() {
        log("Creating app");
        this.loadSettings();
        this.chat = new Chat(this.chatOptions);

        this.loaderView = document.querySelector("section.loading");
        this.settingsView = document.querySelector("section.settings");
        this.chatView = document.querySelector("section.chat");
        this.back = document.querySelector(".back");
        this.form = document.querySelector("form.settings");

        this.back.addEventListener("click", this.onBack.bind(this));
        this.form.addEventListener("submit", this.onSubmit.bind(this));

        log("Binding app rivets");
        var element = document.querySelector("body");
        rivets.bind(element, this);
    }

    start() {
        if (this.chatOptionsOk()) {
            this.startChat();
        } else {
            this.showSettings();
        }

        this.hideLoader();
    }

    private onSubmit(event: Event) {
        this.chatOptions.timestamps = this.timestamps;
        this.chatOptions.fontSize = this.fontSize;

        if (this.chatOptionsOk()) {
            this.error = false;
            this.saveSettings();
            this.chat.setOptions(this.chatOptions);
            this.startChat();
        } else {
            this.track("App", "error", "Form error", false);
            this.error = true;
        }

        event.preventDefault();
        return false;
    }

    private onBack() {
        this.chat.stop();
        this.showSettings();
        window.location.hash = "";
    }

    private hideLoader() {
        this.loaderView.classList.remove("visible");
    }

    private showSettings() {
        ga('send', {
            hitType: 'pageview',
            page: "/settings"
        });

        this.chatView.classList.remove("visible");
        this.settingsView.classList.add("visible");
    }

    private startChat() {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Chat',
            eventAction: 'start',
            eventLabel: this.channel
        });

        this.showChat();
        this.chat.start(this.channel);
    }

    private showChat() {
        ga('send', {
            hitType: 'pageview',
            page: "/chat"
        });

        this.settingsView.classList.remove("visible");
        this.chatView.classList.add("visible");
    }

    private loadSettings() {
        log("Loading settings");

        let data = localStorage.getItem("chatOptions");

        if (data) {
            this.chatOptions = JSON.parse(data);
        } else {
            this.chatOptions = DEFAULT_CHAT_OPTIONS;
        }

        this.timestamps = this.chatOptions.timestamps;
        this.fontSize = this.chatOptions.fontSize;

        let hash: string = window.location.hash;
        if (hash) {
            hash = hash.slice(1); // Strip off the leading #
        }

        this.channel = hash;
    }

    private saveSettings() {
        let data = JSON.stringify(this.chatOptions);
        localStorage.setItem("chatOptions", data);
        window.location.hash = this.channel;

        this.track("Settings", "fontSize", this.fontSize);
        this.track("Settings", "timestamps", this.timestamps);
    }

    private track(category: string, action: string, label: string = "", nonInteraction: boolean = true) {

        ga('send', {
            hitType: 'event',
            eventCategory: category,
            eventAction: action,
            eventLabel: label,
            nonInteraction: nonInteraction
        });
    }

    private chatOptionsOk() {
        if (!this.channel) {
            return false;
        } else if (!this.chatOptions) {
            return false;
        }

        return true;
    }
}