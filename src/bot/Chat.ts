export class Chat{

    constructor(private tgBot: any, private chatId: number){
    }

    sendMessage(...args){
        this.tgBot.sendMessage(this.chatId,...args)
    }
}