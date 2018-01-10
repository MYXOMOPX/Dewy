import "reflect-metadata"
import {ChatState} from "../ChatState";
import {Menu, MenuClass} from "../menu/Menu";
import {Class} from "../util";


export const classProperties: WeakMap<any,{}> = new WeakMap();

type ArgumentOptions = {name: string, position: {col: number,row: number}, menuClass: MenuClass}
type ActionOptions = {name: string, position: {col: number,row: number}}

/**
 * Декораторы
 */

export function Argument(options: ArgumentOptions) {
    return function CMDArgumentDecorator(proto: Object, propertyKey: string): any {
        if (!classProperties.has(proto)) classProperties.set(proto, {});
        var argumentProperty = classProperties.get(proto)['argument'];
        if (!argumentProperty) argumentProperty = classProperties.get(proto)['argument'] = {};
        argumentProperty[propertyKey] = options;
    }
}

export function Action(options: ActionOptions) {
    return function CMDArgumentDecorator(proto: Object, propertyKey: string): any {
        if (!classProperties.has(proto)) classProperties.set(proto, {});
        var actionProperty = classProperties.get(proto)['action'];
        if (!actionProperty) actionProperty = classProperties.get(proto)['action'] = {};
        actionProperty[propertyKey] = options;
    }
}

export function Inject(proto: Object, propertyKey: string): any {
    if (!classProperties.has(proto)) classProperties.set(proto, {});
    var actionProperty = classProperties.get(proto)['inject'];
    if (!actionProperty) actionProperty = classProperties.get(proto)['inject'] = {};
    var type = Reflect.getMetadata("design:type",proto,propertyKey);
    actionProperty[propertyKey] = type;
}

export function BindState(name){
    return function BindState(proto: Object, propertyKey: string): any {
        var descriptor = Object.getOwnPropertyDescriptor(proto, propertyKey)
            || {configurable: true, enumerable: true};
        descriptor.get = function () {
            var state = this['__state__'];
            if (!this['__injections__']) return;
            if (!state) this['__state__'] = state = this['__injections__'].find(x => x.constructor == ChatState);
            if (!state) throw `State not found in ${this}`;
            return state.get(name);
        };
        descriptor.set = function (value) {
            var state = this['__state__'];
            if (!this['__injections__']) return;
            if (!state) this['__state__'] = state = this['__injections__'].find(x => x.constructor == ChatState);
            if (!state) throw `State not found in ${this}`;
            return state.set(name,value);
        };
        Object.defineProperty(proto,propertyKey,descriptor);
        return descriptor;
    }
}

function OnChange(callback: (val) => void): any {
    return function OnChange(proto: Object, propertyKey: string) {
        var descriptor = Object.getOwnPropertyDescriptor(proto, propertyKey)
            || {configurable: true, enumerable: true};
        var value: any;
        var originalGet = descriptor.get || (() => value);
        var originalSet = descriptor.set || (val => value = val);
        descriptor.get = originalGet;
        descriptor.set = function(newVal) {
            var currentVal = originalGet.call(this);
            if (newVal != currentVal) {
                callback.call(this, newVal);
            }
            originalSet.call(this, newVal);
        };
        Object.defineProperty(proto, propertyKey, descriptor);
        return descriptor;
    }
}

export function OnEvent(event: string, priority?: number){
    return function OnEvent(proto: any, key: string) {
        if (!classProperties.has(proto)) classProperties.set(proto, {});
        var functionMap = classProperties.get(proto)['event'];
        if (!functionMap) functionMap = classProperties.get(proto)['event'] = {};
        if (!functionMap[event]) return functionMap[event] = [{func:proto[key],priority:priority||0}];
        functionMap[event].push({func:proto[key],priority:priority||0})
    }
}


/**
 * Полезные функции
 */

function getProtoProperties(proto: any){
    if (!classProperties.has(proto)) return {};
    return classProperties.get(proto)
}

/**
 * Собирает данные по всем прототипам и возвращает массив.
 * properties[0] - от нашего объект. properties.last() - от старшего прототипа нашего объекта.
 * @param targetObject
 * @return {Array}
 */
function getAllObjectProperties(targetObject: any): Array<{/**propertiesObject*/}>{
    var proto = targetObject.constructor.prototype;
    var listProps = [];
    while (proto && proto != Function.prototype){
        var props = getProtoProperties(proto);
        props && listProps.push(props);
        proto = Object.getPrototypeOf(proto);
    }
    return listProps
}

function getTargetInjections(targetObject: any): any{
    var allProperties = getAllObjectProperties(targetObject);
    var injs = {};
    allProperties.reverse().forEach(properties => {
        var allInjections = properties['inject'];
        if (!allInjections) return;
        for (var i = 0; i < Object.keys(allInjections).length; i++) {
            var key = Object.keys(allInjections)[i];
            injs[key] = allInjections[key];
        }
    });
    return injs
}
function getTargetArguments(targetObject: any): any{
    var allProperties = getAllObjectProperties(targetObject);
    var args = {};
    allProperties.reverse().forEach(properties => {
        var allArguments = properties['argument'];
        if (!allArguments) return;
        for (var i = 0; i < Object.keys(allArguments).length; i++) {
            var key = Object.keys(allArguments)[i];
            args[key] = allArguments[key];
        }
    });
    return args
}
function getTargetActions(targetObject: any): any{
    var allProperties = getAllObjectProperties(targetObject);
    var acts = {};
    allProperties.reverse().forEach(properties => {
        var allActions = properties['action'];
        if (!allActions) return;
        for (var i = 0; i < Object.keys(allActions).length; i++) {
            var key = Object.keys(allActions)[i];
            acts[key] = allActions[key];
        }
    });
    return acts
}



//Работа с тем, что добавили декораторы



export function getEventHandlers(targetObject: any, event: string): Function[]{
    var properties = getAllObjectProperties(targetObject);
    var handlers = [];
    properties.forEach(x => {
        if (!x['event'] || !x['event'][event]) return;
        handlers = handlers.concat(x['event'][event])
    });
    handlers.sort((a,b) => b.priority-a.priority); // sort desc by priority
    return handlers.map(x => x.func);
}



export function getActions(target: any): Array<ActionImpl>{
    var actions = getTargetActions(target);
    var result: Array<ActionImpl> = [];
    if (!actions) return result;
    for (var methodName in actions) {
        if (!actions.hasOwnProperty(methodName)) continue;
        var action = actions[methodName];
        result.push({
            name: action.name,
            position: action.position,
            method: target[methodName]
        })
    }
    return result;
}

export function getArguments(target: any): Array<ArgumentImpl>{
    var args = getTargetArguments(target);
    var result: Array<ArgumentImpl> = [];
    if (!args) return result;
    for (var field in args) {
        if (!args.hasOwnProperty(field)) continue;
        var arg = args[field];
        result.push({
            menuClass: arg.menuClass,
            name: arg.name,
            position: arg.position,
            field: field,
        })
    }
    return result;
}

export function doWire(target: Object, modules: Array<any>): void{
    var wires = getTargetInjections(target);
    for (var field in wires) {
        var module = modules.find(m => m.constructor == wires[field]);
        if (module) target[field] = module;
        else console.warn(`Cant wire ${field} of ${target}`)
    }
}