import {Chat} from "../Chat";
import {MenuView} from "./MenuView";
import {getEventHandlers, getArguments, getActions} from "../decorator/MenuDecorators";
import {InlineKeyboard} from "../telegram/message/markup/InlineKeyboard";

type MenuMessageType = "TEXT"|"CALLBACKQUERY"|"OTHER";
type DeattachReason = "NEWCOMMAND"|"USERCHAT"|"MENUCLICK"|"OTHERMENUREDRAW";

export interface IMenu{

    pushEvent(name: string, event: any): void;
    onReceive(type: MenuMessageType, data: any): void;
    cancel(): void;
    onAttach(): void
    onDeattach(reason: DeattachReason): void
    setInjections(injections)
    setUpdaterFunction(f: Function)
    awaitFinish()
}