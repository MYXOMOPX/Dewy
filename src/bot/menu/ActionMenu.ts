import {getActions, getArguments, OnEvent} from "../decorator/MenuDecorators";
import {DecoratedMenu} from "./DecoratedMenu";

export abstract class ActionMenu extends DecoratedMenu{


    @OnEvent("init",-1)
    _init(event){
        this.updateView(this.getView());
    }

    @OnEvent('callbackQuery')
    _onCallbackQuery(event) {
        var callbackQuery = event.callbackQuery;
        var args = getArguments(this);
        var actions = getActions(this);
        var data = callbackQuery.data;
        if (!data) return;
        var index = parseInt(data);
        if (isNaN(index)) return;
        if (args.length-1 >= index) return this.callArgument(args[index]);
        if (args.length+actions.length-1 >= index) return this.callAction(actions[index-args.length]);
        return;
    }

    // @OnEvent('cancel')
    // _onCancel(){
    //     this.updateView(this.getView(),false);
    // }
}