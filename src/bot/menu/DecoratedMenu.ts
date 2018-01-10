import {Menu} from "./Menu";
import {InlineKeyboardButton, InlineKeyboard} from "../telegram/message/markup/InlineKeyboard";
import {getArguments, getActions} from "../decorator/MenuDecorators";
import {MenuView} from "./MenuView";


export abstract class DecoratedMenu extends Menu{



    protected callArgument(arg: ArgumentImpl){
        this.startMenu(arg.menuClass,arg.args).then(val => {
            this[arg.field] = val;
            this.updateView(this.getView());
        },() => this.updateView(this.getView()))
    }
    protected callAction(act: ActionImpl){
        act.method.call(this).then(result => {
            if (result == true) this.finish(true);
            this.updateView(this.getView());
        },() => this.updateView(this.getView()))
    }



    protected getDisplayButtons(): InlineKeyboardButton[]{
        var args = getArguments(this);
        var acts = getActions(this);
        var buttons = [];
        for (var i = 0; i < args.length; i++){
            var arg = args[i];
            buttons.push({
                col: arg.position.col,
                row: arg.position.row,
                text: `${arg.name}: ${this[arg.field]}`,
                data: i.toString(),
            });
        }
        for (var j = 0; j < acts.length; j++){
            var act = acts[j];
            buttons.push({
                col: act.position.col,
                row: act.position.row,
                text: act.name,
                data: (i+j).toString(),
            });
        }
        return buttons;
    }

    protected abstract getView(): MenuView
}