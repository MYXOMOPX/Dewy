import {BindState, OnEvent, Action, Argument} from "../../bot/decorator/MenuDecorators";
import {MenuView} from "../../bot/menu/MenuView";
import {StripPart} from "../model/strip/StripPart";
import {PartPicker} from "../picker/PartPicker";
import {ActionMenu} from "../../bot/menu/ActionMenu";
import {InlineKeyboard} from "../../bot/telegram/message/markup/InlineKeyboard";
import {StripCommand} from "./StripCommand";
import {Color} from "../model/color/Color";
import Timer = NodeJS.Timer;


export class RainbowCommand extends StripCommand{

    effectIntervalId: number;
    cycle = 1500;
    ledOffset = 0.5;

    @Action({
        name:"Часть",
        position: {
            col: 0, row: 0
        }
    })
    async lightupStrip(){
        var part = await this.startMenu(PartPicker);
        var effectIntervalId = this.createRainbow(part);
        await this.startMenu(StopEffectMenu,[part]);
        clearInterval(effectIntervalId);
        this.finish(true);
        this.updateView(this.getView());
        return;
    }

    createRainbow(part: StripPart): Timer{
        var time = 0;
        var getColor = (state: number): Color => {
            var r = (Math.sin(state)/2+0.5) ** 2;
            var g = (Math.sin(state + Math.PI*2/3)/2+0.5) ** 2;
            var b = (Math.sin(state + Math.PI*4/3)/2+0.5) ** 2;
            return new Color(r*255,g*255,b*255)
        };
        return setInterval(() => {
            var state = time/this.cycle*Math.PI;
            var color = getColor(state);
            this.strip.lightUp(color,part);
            time++;
        }, 2);
    }

    @Action({
        name:"« Ок",
        position: {
            col: 0, row: 2
        }
    })
    async ok(){
        return true;
    }
}

class StopEffectMenu extends ActionMenu{

    part: StripPart;

    @OnEvent('init')
    definePart(event){
        this.part = event.args[0]
    }

    @Action({
        name:"Выключить",
        position: {
            col: 0, row: 0
        }
    })
    async stop(){
        return true;
    }

    public getView(): MenuView {
        var view = new MenuView();
        view.reply_markup = new InlineKeyboard(this.getDisplayButtons());
        view.text = `Эффект радуги [${this.part}]`;
        return view;
    }
}