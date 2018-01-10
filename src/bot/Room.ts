import {Bot} from "./Bot";
import {Chat} from "./Chat";
import {Menu} from "./menu/Menu";
import {MenuView} from "./menu/MenuView";
import {IMenu} from "./menu/IMenu";
import {doWire} from "./decorator/MenuDecorators";
import {ChatState} from "./ChatState";
import {instantiate, Class} from "./util";
import {CommandMenu} from "./menu/CommandMenu";
import Timer = NodeJS.Timer;

const ER_COMMAND_NOT_FOUND = "Команда не найдена";
const ER_MSG_TO_NOWHERE = "undefined const in code";

export class Room{
    menuMap: Map<number,IMenu> = new Map();
    activeChatMenu: IMenu;
    lastMenu: IMenu;
    chat: Chat;
    state: ChatState = new ChatState();

    injections = [];

    constructor(protected bot: Bot, protected chatId: number){
        this.chat = new Chat(bot.tgBot,chatId);
        this.injections = [this.chat,this.state];
    }

    onCommand(msg,match){
        var text = msg.text;
        var cmdName = text.toLowerCase().split(" ")[0].substring(1);
        if (cmdName == "cancel") {
            this.activeChatMenu && this.activeChatMenu.cancel();
            return;
        }
        var commandClass = this.bot.getCommandProperties(cmdName);
        if (commandClass) { // Такая команда зарегистрирована
            this.activeChatMenu && this.activeChatMenu.onDeattach("NEWCOMMAND");
            var menu = this.createCommandMenu(commandClass,cmdName);
            this.activeChatMenu = menu;
        } else {
            //console.log("command not found");
        }
        return;
    }

    onText(msg,match){
        if (!this.activeChatMenu) return;
        this.activeChatMenu.onReceive("TEXT", msg);
    }


    onCallbackQuery(callbackQuery){
        var messageId = callbackQuery.message['message_id'];
        if (!this.menuMap.has(messageId)) {
            this.bot.tgBot.answerCallbackQuery(callbackQuery.id);
            return;
        }
        var menu = this.menuMap.get(messageId);
        if (this.activeChatMenu != menu) {
            this.activeChatMenu && this.activeChatMenu.onDeattach("MENUCLICK");
            this.activeChatMenu = menu;
        }
        menu.onReceive("CALLBACKQUERY", callbackQuery);
        this.bot.tgBot.answerCallbackQuery(callbackQuery.id);
    }


    private getMessageIdByMenu(menu: IMenu): number{
        var iter = this.menuMap.entries();
        var entry = iter.next();
        while (!entry.done) {
            var m = entry.value[1];
            if (m == menu) return entry.value[0];
            entry = iter.next();
        }
    }

    private createCommandMenu(menuClass: Function, commandName: string): IMenu{
        var menu: CommandMenu = instantiate<CommandMenu>(menuClass as Class);
        var room = this;


        var lastOperation: Timer = null;
        menu.setUpdaterFunction(function (view, requireKeyboard) {
            if (lastOperation) clearTimeout(lastOperation);
            lastOperation = setTimeout(() => {
                viewUpdater(view,requireKeyboard);
                lastOperation = null;
            },1)
        });
        var viewUpdater = function(view,requireKeyboard) {
            menu.onAttach();
            if (menu !=  this.activeChatMenu && this.activeChatMenu) this.activeChatMenu.onDeattach("OTHERMENUREDRAW");
            this.activeChatMenu = menu;
            var msgId = room.getMessageIdByMenu(menu);
            if ((requireKeyboard && this.lastMenu!=menu) || typeof msgId == "undefined") {
                room.menuMap.delete(msgId);
                this.bot.tgBot.sendMessage(this.chatId,view.text, {
                    reply_markup: view.reply_markup
                }).then(m => {
                    var id = m['message_id'];
                    room.menuMap.set(id,menu);
                    this.lastMenu = menu;
                });
                if (typeof msgId != "undefined") {
                    this.bot.tgBot.editMessageText("Moved.",{
                        message_id:msgId,
                        chat_id:this.chatId,
                    }).catch(x=>{})
                }
            } else {
                this.bot.tgBot.editMessageText(view.text, {
                    message_id: msgId,
                    chat_id: this.chatId,
                    reply_markup: view.reply_markup,
                }).catch(x=> {})
            }
        }.bind(this);

        menu.setInjections(this.injections);
        doWire(menu,[this.chat,this.state]);
        menu.pushEvent("init",{parent:null,args:{commandName}});
        menu.awaitFinish()
            .then(r => {
                var msgId = this.getMessageIdByMenu(menu);
                if (msgId) setTimeout(() => this.menuMap.delete(msgId),5);
                if (menu == this.activeChatMenu) this.activeChatMenu = null;
            });
        return menu;
    }
}
