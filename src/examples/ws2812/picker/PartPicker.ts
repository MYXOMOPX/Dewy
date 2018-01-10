import {PickerMenu} from "../../bot/menu/PickerMenu";
import {LedStrip} from "../model/strip/LedStrip";
import {StripPart} from "../model/strip/StripPart";
export class PartPicker extends PickerMenu<StripPart>{
    strip: LedStrip = LedStrip.instance;

    getDisplayValues(): Array<{name: string, value: StripPart, col: number, row: number}>{
        return this.strip.parts.map((part: StripPart) => {
            return {
                name: part.name,
                value: part,
                col: part.telegramPosition.col,
                row: part.telegramPosition.row,
            };
        });
    }

    getDisplayText(){
        return "Выберите часть.";
    }

    parse(text){
        return StripPart.parse(text)
    }
}