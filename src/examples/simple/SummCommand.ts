import {CommandMenu} from "../bot/menu/CommandMenu";
import {OnEvent, Action, Argument, Inject, BindState} from "../bot/decorator/MenuDecorators";
import {Chat} from "../bot/Chat";
import {NumberPicker} from "./NumberPicker";


export class SummCommand extends CommandMenu {
    @Inject chat: Chat;

    @Argument({
        name:"X",
        position: {
            col: 0, row: 0
        },
        menuClass: NumberPicker
    }) x: Number = 3;

    @Argument({
        name:"Y",
        position: {
            col: 1, row: 0
        },
        menuClass: NumberPicker
    }) y: Number = 5;

    @Action({
        name:"Вывести сумму",
        position: {
            col: 0, row: 1
        }
    })
    async printSumm(event){
        this.chat.sendMessage("x+y="+(this.x+this.y));
        return true;
    }
}