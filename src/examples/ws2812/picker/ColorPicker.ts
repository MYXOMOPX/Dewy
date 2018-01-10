import {PickerMenu} from "../../bot/menu/PickerMenu";
import {Color} from "../model/color/Color";
export class ColorPicker extends PickerMenu<Color>{
    static colorsInOneLine = 3;

    getDisplayValues(): Array<{name: string, value: Color, col: number, row: number}>{
        var i = 0;
        var map = Color.list.map((color: Color) => {
            var props = {
                name: color.name,
                value: color,
                col: i%ColorPicker.colorsInOneLine,
                row: Math.floor(i/ColorPicker.colorsInOneLine)
            };
            i++;
            return props;
        });
        return map;
    }

    getDisplayText(){
        return "Выберите цвет.";
    }

    parse(text){
        return Color.parse(text)
    }
}