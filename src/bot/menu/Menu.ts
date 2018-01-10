import {Chat} from "../Chat";
import {MenuView} from "./MenuView";
import {getEventHandlers, getArguments, getActions, OnEvent, doWire} from "../decorator/MenuDecorators";
import {IMenu} from "./IMenu";
import {instantiate, Class} from "../util";

type MenuMessageType = "TEXT"|"CALLBACKQUERY"|"OTHER";

export type MenuClass = { new(...args: any[]): Menu }

export abstract class Menu implements IMenu{
    private children: Menu;

    public pushEvent(name: string, event: any) {
        var handlers = getEventHandlers(this,name);
        handlers && handlers.forEach(handler => handler.call(this,event));
    }

    protected startMenu(menuClass: Function, args?: any[]){
        var menu = instantiate<Menu>(menuClass as Class);
        menu.setInjections(this['__injections__']);
        doWire(menu,this['__injections__']);
        menu.setUpdaterFunction(this.updaterFunction);
        menu.pushEvent("init",{
            parent:this,
            args:args
        });
        this.children = menu;
        return menu.awaitFinish()
            .then(x => {
                this.children = null;
                return x;
            })
            .catch(x => {
                this.children = null;
                return x;
            })
    }

    public setInjections(injections){
        this['__injections__'] = injections
    }

    private updaterFunction: Function = null;
    public setUpdaterFunction(f: Function){
        this.updaterFunction = f;
    }

    private finishValue: any;
    protected alive: boolean = true;
    private resolvers: Function[] = [];
    private rejectors: Function[] = [];
    protected finish(value: any){
        if (!this.alive) return;
        var event = {value};
        this.pushEvent('finish',event);
        this.finishValue = event.value;
        this.alive = false;
        this.finishValue = value;
        this.resolvers.forEach(s => s(value));
    }
    public cancel(){
        if (!this.alive) return;
        if (this.children) this.children.cancel();
        this.alive = false;
        this.rejectors.forEach(j => j());
        this.pushEvent("cancel",{})
    }

    protected updateView(view: MenuView, requireKeyboard:boolean = false){
        var event = {view};
        this.pushEvent('updateView',event);
        view = event.view;
        this.updaterFunction.call(this,view,requireKeyboard);
    };


    public async awaitFinish() {
        return new Promise((s,j) => {
            this.resolvers.push(s);
            this.rejectors.push(j);
        });
    }

    public onAttach(){
        if (!this.alive) return;
        if (this.children) return this.children.onAttach();
        this.pushEvent("attach",{});
    }

    public onDeattach(reason){
        if (!this.alive) return;
        if (this.children) return this.children.onDeattach(reason);
        this.pushEvent("deattach",{reason});
    }

    onReceive(type: MenuMessageType, data: any) {
        if (!this.alive) return;
        if (this.children) return this.children.onReceive(type,data);
        switch (type){
            case "TEXT": this.pushEvent('text',{message:data});
            case "CALLBACKQUERY": this.pushEvent('callbackQuery',{callbackQuery:data});
            default: this.pushEvent('message',{message:data});
        }
    }

}