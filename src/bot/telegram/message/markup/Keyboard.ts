export type KeyboardButton = {col: number, row: number, text: string}

export class Keyboard{

    resize_keyboard: boolean = true;
    one_time_keyboard: boolean = true;
    selective: boolean = false;
    private keyboard: Array<Array<{text: string}>>;

    constructor(buttons: Array<KeyboardButton>){
        var elements = [];
        buttons.forEach((el: KeyboardButton) => {
            var x = el.col;
            var y = el.row;
            var btns = elements[y];
            if (!btns) elements[y] = btns = [];
            btns[x] = el.text;
        });
        this.keyboard = elements
            .filter(_ => _)
            .map(_ => _
                .filter(_ => _)
                .map(_ => {return {text:_}})
            ); // Some magic!
    }

}