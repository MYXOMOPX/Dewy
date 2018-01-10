export type InlineKeyboardButton = {
    col: number,
    row: number,
    text: string,
    data: string,
}

export class InlineKeyboard{

    private inline_keyboard: Array<Array<{text: string, callback_data: string}>>;

    constructor(buttons: Array<InlineKeyboardButton>){
        var elements = [];
        buttons.forEach((el: InlineKeyboardButton) => {
            var x = el.col;
            var y = el.row;
            var btns = elements[y];
            if (!btns) elements[y] = btns = [];
            btns[x] = {
                text: el.text,
                callback_data: el.data
            };
        });
        this.inline_keyboard = elements
            .filter(_ => _)
            .map(_ => _
                .filter(_ => _)
            ); // Some magic!
    }

}