
import {PickerMenu} from "../bot/menu/PickerMenu";
export class NumberPicker extends PickerMenu<Number>{

    getDisplayValues(): Array<{name: string, value: Number, col: number, row: number}>{
        var array = [];
        for (var i = 0; i < 10; i++){
            var row = Math.floor(i/5);
            var col = i%5;
            array.push({
                name: i.toString(),
                value: i,
                col: col,
                row: row,
            })
        }
        return array;
    }

    getDisplayText(){
        return "Выберите число.";
    }

    parse(text){
        var number = +text;
        if (isNaN(number)) return;
        return +text;
    }
}