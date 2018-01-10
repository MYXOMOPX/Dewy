import {Bot} from "../../bot/Bot";
import {LightupCommand} from "./command/LightupCommand";
import {LedStrip} from "./model/strip/LedStrip";
import {StripPart} from "./model/strip/StripPart";
import {RainbowCommand} from "./command/RainbowCommand";
import {FogCommand} from "./command/FogCommand";

const TELEGRAM_TOKEN = "#############################################";

var bot = new Bot(TELEGRAM_TOKEN);

var parts = [
    {name:"Всё",begin:0,end: 132, pos:[0,0]},
    {name:"Верх",begin:24,end: 108, pos:[0,1]},
    {name:"Левая верхняя полка",begin:109, end:120, pos:[0,2]}, {name:"Правая верхняя полка",begin:12, end:23, pos:[1,2]},
    {name:"Левая нижняя полка",begin:121, end:132, pos:[0,3]},  {name:"Правая нижняя полка",begin:0, end:11, pos:[1,3]}]
    .map(l => new StripPart(l.begin,l.end,l.name,{col:l.pos[0],row:l.pos[1]}));

var strip = new LedStrip({
    name:"MYXOMOPX's strip",
    address:"ws://###################",
    length:133,
    parts:parts
});

strip.connect();


process.on('SIGINT', () => {
    strip.disconnect().then(x => {
        process.exit(1);
    })
});

bot.registerCommand("lightup",LightupCommand);
bot.registerCommand("rainbow",RainbowCommand);
bot.registerCommand("fog",FogCommand);