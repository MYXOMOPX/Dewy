// / <reference path="node.d.ts"
import {Room} from "./Room";
let TelegramBot = require("node-telegram-bot-api");

export class Bot{
    tgBot: any;

    private commands: Map<string,Function> = new Map();
    private rooms: Map<number,Room> = new Map();

    constructor(token: string){
        this.tgBot = new TelegramBot(token, {polling: true});
        // this.tgBot.on('message',this.onMessage.bind(this));
        this.tgBot.on('text', this.onText.bind(this));
        this.tgBot.on('callback_query', this.onQuery.bind(this));
    }

    onText(msg,match){
        var chatId = msg.chat.id;
        if (!this.rooms.has(chatId)) this.rooms.set(chatId,new Room(this,chatId));
        var room = this.rooms.get(chatId);
        if (isCmdText(msg.text)) {
            room.onCommand(msg,match)
        } else {
            room.onText(msg,match);
        }

    }

    onQuery(callbackQuery){
        var chatId = callbackQuery.message.chat.id;
        if (!this.rooms.has(chatId)) this.rooms.set(chatId,new Room(this,chatId));
        var room = this.rooms.get(chatId);
        room.onCallbackQuery(callbackQuery);
    }

    registerCommand(name: string, commandMenuClass: Function){
        this.commands.set(name,commandMenuClass);
    }


    getCommandProperties(name: string): Function{
        return this.commands.get(name)
    }
}

function isCmdText(text: string): boolean{
    return text && text[0] == "/";
}