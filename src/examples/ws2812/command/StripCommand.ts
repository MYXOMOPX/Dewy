import {CommandMenu} from "../../bot/menu/CommandMenu";
import {OnEvent} from "../../bot/decorator/MenuDecorators";
import {LedStrip} from "../model/strip/LedStrip";
import {MenuView} from "../../bot/menu/MenuView";

export abstract class StripCommand extends CommandMenu{

    protected strip: LedStrip = LedStrip.instance;

    @OnEvent("init",1)
    checkStrip(){
        if (!this.strip || !this.strip.isConnected()) {
            this.cancel();
        }
    }

    public getView(): MenuView {
        if (!this.strip || !this.strip.isConnected()) {
            var view = new MenuView();
            view.text = "Нет ленты.";
            return view;
        }
        return super.getView();
    }
}