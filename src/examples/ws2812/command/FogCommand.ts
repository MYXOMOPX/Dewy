import {BindState, OnEvent, Action, Argument} from "../../bot/decorator/MenuDecorators";
import {MenuView} from "../../bot/menu/MenuView";
import {StripPart} from "../model/strip/StripPart";
import {PartPicker} from "../picker/PartPicker";
import {ActionMenu} from "../../bot/menu/ActionMenu";
import {InlineKeyboard} from "../../bot/telegram/message/markup/InlineKeyboard";
import {StripCommand} from "./StripCommand";
import {Color} from "../model/color/Color";
import {ColorPicker} from "../picker/ColorPicker";
import Timer = NodeJS.Timer;


export class FogCommand extends StripCommand{

    @Argument({
        name:"Часть",
        position: {
            col: 0, row: 0
        },
        menuClass: PartPicker
    }) part: StripPart = StripPart.fromNumbers(0,0);

    @Action({
        name:"Выбрать цвет",
        position: {
            col: 1, row: 0
        },
    })
    async lightupStrip(){
        var color = await this.startMenu(ColorPicker);
        var effectIntervalId = this.createFog(this.part,color);
        await this.startMenu(StopEffectMenu,[this.part]);
        clearInterval(effectIntervalId);
        this.finish(true);
        this.updateView(this.getView());
        return;
    }

    private static modifiers = [0,2,2,6,3,21,1,72,10,6,12,4,7,1,6,33,15,2,1,9,1,1,436,1,634,2,23,23,1,2,1,2,64,45,12];
    createFog(part: StripPart, color: Color): Timer{
        var time = 0;
        var length = part.end-part.begin+1;
        return setInterval(() => {
            var i = length;
            var t = time/15*Math.PI;
            var colors: Color[] = [];
            while (i-->0) {
                var mod = FogCommand.modifiers[i%FogCommand.modifiers.length];
                var phase = Math.sin(Math.PI/8*i*mod+Math.PI/8*t);
                var gain = 0.2+(Math.sin(phase)+1)/2*0.8;
                colors.push(color.gain(gain))
            }
            this.strip.setColors(colors,part.begin);
            time++;
        }, 100);
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
        view.text = `Эффект тумана [${this.part}]`;
        return view;
    }
}