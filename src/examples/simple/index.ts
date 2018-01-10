import {Bot} from "../bot/Bot";
import {SummCommand} from "./SummCommand";


const TELEGRAM_TOKEN = "#################################";
var bot = new Bot(TELEGRAM_TOKEN);

bot.registerCommand("summ",SummCommand);


