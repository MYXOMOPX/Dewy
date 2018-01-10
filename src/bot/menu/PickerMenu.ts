import {MenuView} from "./MenuView";
import {Menu} from "./Menu";
import {getActions, getArguments, OnEvent} from "../decorator/MenuDecorators";
import {InlineKeyboard, InlineKeyboardButton} from "../telegram/message/markup/InlineKeyboard";
import {DecoratedMenu} from "./DecoratedMenu";

export abstract class PickerMenu<T> extends DecoratedMenu{

    @OnEvent("init")
    _init(event){
        this.updateView(this.getView(),true);
    }

    @OnEvent('callbackQuery')
    _onCallbackQuery(event) {
        var callbackQuery = event.callbackQuery;
        var args = getArguments(this);
        var actions = getActions(this);
        var displayValues = this.getDisplayValues();
        var data = callbackQuery.data;
        if (!data) return;
        var index = parseInt(data);
        if (isNaN(index)) return;
        if (args.length-1 >= index) return this.callArgument(args[index]);
        if (args.length+actions.length-1 >= index) return this.callAction(actions[index-args.length]);
        if (args.length+actions.length+displayValues.length-1 >= index) return this.selectedValue(displayValues[index-args.length-actions.length]);
        return;
    }


    @OnEvent('text')
    _onText(event){
        var msg = event.message;
        var value = this.parse(msg.text);
        if (typeof value != "undefined") return this.finish(value);
    }

    private selectedValue(displayValue){
        this.finish(displayValue.value);
    }

    abstract getDisplayValues(): Array<{name: string, value: T, col: number, row: number}>
    abstract getDisplayText(): string
    abstract parse(text): T


    protected getDisplayButtons(): InlineKeyboardButton[] {
        var buttons = super.getDisplayButtons();
        var values = this.getDisplayValues();
        var length = buttons.length;
        for (var v = 0; v < values.length; v++){
            var value = values[v];
            buttons.push({
                col: value.col,
                row: value.row,
                text: value.name,
                data: (length+v).toString(),
            });
        }
        return buttons;
    }

    public getView(): MenuView {
        var view = new MenuView();
        view.text = this.getDisplayText();
        view.reply_markup = new InlineKeyboard(this.getDisplayButtons());
        return view;
    }
}