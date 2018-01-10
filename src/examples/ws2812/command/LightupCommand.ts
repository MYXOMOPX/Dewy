import {CommandMenu} from "../../bot/menu/CommandMenu";
import {BindState, OnEvent, Action, Argument} from "../../bot/decorator/MenuDecorators";
import {LedStrip} from "../model/strip/LedStrip";
import {MenuView} from "../../bot/menu/MenuView";
import {StripPart} from "../model/strip/StripPart";
import {ColorPicker} from "../picker/ColorPicker";
import {Color} from "../model/color/Color";
import {PartPicker} from "../picker/PartPicker";
import {StripCommand} from "./StripCommand";


export class LightupCommand extends StripCommand{

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
        this.strip.lightUp(color,this.part);
    }

    @OnEvent('text',10)
    async onRGB(event){
        var text = event.message.text;
        var color = Color.parse(text);
        if (!color) return;
        this.strip.lightUp(color,this.part);
        this.updateView(this.getView());
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