export class Color{

    r:number;
    g:number;
    b:number;
    name:string;

    constructor(r,g,b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    withName(name): Color{
        this.name = name;
        return this;
    }


    static list:Color[] = [
        new Color(0xFF,0x00,0x00).withName("🔴" ), // красный
        new Color(0x00,0xFF,0x00).withName("💚" ), // зеленый
        new Color(0x00,0x00,0xFF).withName("🔵" ), // синий
        new Color(0xFF,0xA0,0x00).withName("💛" ), // желтый
        new Color(0xA0,0x00,0xFF).withName("💜" ), // фиолетовый
        new Color(0xD0,0xFF,0x00).withName("🎾" ), // лайм
        new Color(0xFF,0x20,0x40).withName("💖" ), // розовый
        new Color(0x00,0xFF,0x90).withName("💠" ), // аква
        new Color(0xFF,0x80,0x00).withName("🔶" ), // оранжевый
        new Color(0xFF,0xFF,0xFF).withName("⚪️"), // белый
        new Color(0x00,0x00,0x00).withName("⚫️"), // черный
    ];

    static parse(text): Color{
        var lowerText = text.toLowerCase();
        var color = this._parseHtmlColor(lowerText);
        if (color == null) color = this._parseNumberText(lowerText);
        if (color == null) color = Color.list.find(c => c.name == lowerText);
        return color

    }

    static _parseHtmlColor(text): Color{
        if (!text.startsWith("#")) return;
        text = text.substring(1);
        if (text.length == 3) return new Color(parseInt(text.charAt(0),16)*0x11, parseInt(text.charAt(1),16)*0x11, parseInt(text.charAt(2),16)*0x11);
        else if (text.length == 6) return new Color( parseInt(text.substr(0,2),16), parseInt(text.substr(2,2),16), parseInt(text.substr(4,2),16));
        else return;
    }

    static _parseNumberText(text): Color{
        var parts = text.split(" ");
        if (parts.length != 3) return;
        var color = [];
        for (var i = 0; i < 3; i++) {
            var c = parseInt(parts[i]);
            if (isNaN(c)) return;
            color[i] = c;
        }
        return new Color(color[0],color[1],color[2]);
    }

    /**
     * @param val
     * @return {Color} new gained color
     */
    gain(val): Color{
        var r = Math.min(255,this.r*Math.max(val,0));
        var g = Math.min(255,this.g*Math.max(val,0));
        var b = Math.min(255,this.b*Math.max(val,0));
        return new Color(r,g,b)
    }

    toString(){
        if (this.name) return this.name;
        return `#${this.r},${this.g},${this.b}`
    }
}