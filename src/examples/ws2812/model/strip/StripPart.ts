export class StripPart{

    constructor(public begin:number, public end:number, public name:string, public telegramPosition?:{col:number,row:number}){
    }

    static fromArray(value: Array<number>): StripPart{
        var [b,e] = value[1]>value[0]?[0,1]:[1,0];
        return new StripPart(value[b],value[e],null);
    }

    static fromNumbers(begin: number,end: number): StripPart{
        return new StripPart(begin,end,null);
    }

    static parse(text: string): StripPart{
        if (!text) return;
        var s = text.split("-");
        if (s.length != 2) return;
        var part = [parseInt(s[0]),parseInt(s[1])];
        if (part.some(x => isNaN(x))) return;
        return StripPart.fromArray(part)
    }

    toString(){
        if (this.name) return this.name;
        else return `(${this.begin}-${this.end})`
    }

    equals(o): boolean{
        if (typeof o != typeof this) return false;
        return this.begin == o.begin &&
                this.end == o.end &&
                this.name == o.name;
    }
}


