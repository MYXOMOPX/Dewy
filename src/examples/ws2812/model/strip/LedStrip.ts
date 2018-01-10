import {StripPart} from "./StripPart";
import {Color} from "../color/Color";
let WebSocketClient = require("websocket").client;

export class LedStrip{

    public static instance: LedStrip;

    private buffer:Buffer;
    private connection: any;
    private websocket: any;

    public name: string;
    public address: string;
    public length: number;
    public parts: StripPart[];

    constructor(config: {
        name: string,
        address: string,
        length: number,
        parts: StripPart[]
    }){
        LedStrip.instance = this;
        this.name = config.name;
        this.address = config.address;
        this.length = config.length;
        this.parts = config.parts;
        this.buffer = new Buffer(this.length*3);
        this.buffer.fill(0);

        this.websocket = new WebSocketClient();
    }

    isConnected(): boolean{
        if (!this.connection) return false;
        return this.connection.readyState == this.websocket.OPEN;
    }

    async connect(){
        if (this.isConnected()) return this;
        var promise = new Promise((s,j) => {
            this.websocket.connect(this.address+"/control");
            this.websocket.on('connect',connection => {
                this.connection = connection;
                s(this);
            });
        });
        return promise;
    }

    async disconnect(){
        if (!this.isConnected()) return this;
        var promise = new Promise(s => {
            this.connection.on('close',_ => s(this))
        });
        this.connection.close();
        return promise;
    }

    lightUpAll(color: Color){
        var part = StripPart.fromNumbers(0,this.length-1);
        this.lightUp(color,part)
    }

    lightUp(color:Color, part: StripPart){
        if (!this.connection) return;
        var buffer = this.buffer;
        for (var i = part.begin; i <= part.end; i++){
            buffer[i*3] = color.r;
            buffer[i*3+1] = color.g;
            buffer[i*3+2] = color.b;
        }
        this.connection.sendBytes(buffer)
    }

    setColors(colors: Color[], offset:number=0){
        if (!this.connection) return;
        var buffer = this.buffer;
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            buffer[(i+offset)*3] = color.r;
            buffer[(i+offset)*3+1] = color.g;
            buffer[(i+offset)*3+2] = color.b;
        }
        this.connection.sendBytes(buffer)
    }
}