import {MenuView} from "./MenuView";
import {Menu} from "./Menu";
import {getActions, getArguments, OnEvent} from "../decorator/MenuDecorators";
import {InlineKeyboard} from "../telegram/message/markup/InlineKeyboard";
import {DecoratedMenu} from "./DecoratedMenu";
import {ActionMenu} from "./ActionMenu";

export abstract class CommandMenu extends ActionMenu{

    private commandName: string = null;
    @OnEvent("init",1)
    _init(event){
        this.commandName = event.args.commandName;
    }

    public getView(): MenuView {
        var view = new MenuView();
        if (this.alive) {
            view.reply_markup = new InlineKeyboard(this.getDisplayButtons());
            view.text = `Команда ${this.commandName}`;
        } else {
            view.text = `Команда ${this.commandName}. Завершено.`;
        }
        return view;
    }
}