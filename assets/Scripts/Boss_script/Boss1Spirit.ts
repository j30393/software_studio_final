
const {ccclass, property} = cc._decorator;

class Instruction{
    public instruction_name : string;
    public instruction_val : number;
    public constructor (name : string , value : number){
        this.instruction_name = name;
        this.instruction_val = value;
    }
}

@ccclass
export default class BossSpirit extends cc.Component {

    //關卡長度(單位秒，記得在引擎更改)
    @property()
    level_length: number = 180;

    //可額外新增其他參數來在設計上使用
    @property(cc.Node)
    player: cc.Node = null;
    @property(cc.Node)
    boss: cc.Node = null;
    @property(cc.Node)
    background: cc.Node = null;

    //指令的列表
    @property([Instruction])
    instruction_list:Instruction[] = [];

    //==================================================================================
    //必要的程式碼，如無特殊需求請勿更動
    start(){
        this.background.color = cc.color(220,255,220);
    }

    private pre_time = 0;
    private time = 0;
    update(dt){
        this.time = this.boss.getComponent("Boss").gamemgr.time;

        if(this.time<this.pre_time) this.pre_time = this.time;

        this.bossSpirit();

        this.pre_time = this.time;
    }
    atTime(target_time){
        return (this.time>target_time&&target_time>this.pre_time)
    }

    pushInstruction(name,value){
        this.instruction_list.push(new Instruction(name,value));
    }

    endInstruction(){
        this.getComponent("Boss").bossExe(this.instruction_list);
        this.instruction_list = [];
    }
    //==================================================================================

    bossSpirit(){
        /*
        ==================================================================================
        先介紹怎麼使用指令
            else if(this.atTime(X)){
                this.pushInstruction(指令A);
                this.pushInstruction(指令B);
                this.pushInstruction(指令C);
            }
        以上的程式碼，會讓關卡在X秒時，按照順序執行指令A、指令B、指令C

        以下是可用指令列表
        (d,0) => console.log(0)
        (A~H,x) => 變數A~H=x(x為值)
        (b,0) => 設定BOSS的移動目標到(A,B)，BOSS會在此期間飛往該座標
        (b,1) => BOSS會傳送到之前設定的移動目標
        (b,2) => BOSS會傳送到之前設定的移動目標並且攻擊
        (b,3) => BOSS會攻擊
        (b,4) => BOSS生成在(A,B)座標
        (b,5) => BOSS死亡
        (p,x) => 發射Px的彈幕(x為編號)，並且會使用目前設定的A~H變數作為彈幕的參數
        
        P0  綠色的前行彈幕
        P1  藍色的前行彈幕
        P2  紅色的前行彈幕
        (A=開始X座標、B=開始Y座標、C=朝向X座標、D=朝向Y座標、E=偏移的角度、F=速度)

        P3  綠色的八方位移動骷髏頭
        P4  藍色的八方位移動骷髏頭
        P5  紅色的八方位移動骷髏頭
        (A=開始X座標、B=開始Y座標、C=朝向的方向0=>上,1=>上左,2=>左,3=>下左,4=>下,5=>下右,6=>右,7=>上右)

        P6  綠色的原地燃燒火焰
        P7  藍色的原地燃燒火焰
        P8  紅色的原地燃燒火焰
        (A=開始X座標、B=開始Y座標、燃燒持續時間)

        P9  綠色的狙擊彈幕
        P10 藍色的狙擊彈幕
        P11 紅色的狙擊彈幕
        (A=開始X座標、B=開始Y座標、C=朝向X座標、D=朝向Y座標、E=偏移的角度)

        P12 綠色的曲線能量球
        P13 藍色的曲線能量球
        P14 紅色的曲線能量球
        (A=開始X座標、B=開始Y座標、C=朝向X座標、D=朝向Y座標、E=偏移的角度、F=速度、G=角加速度)

        剩下的彈幕請自行製作自己需要得

        關卡設計所需要的音效，請直接使用cc.audioEngine
        ==================================================================================
        */
        
        //此處開始為BOSS的行動腳本
        if(this.atTime(1)){
             //在1秒的時候生成BOSS
            this.pushInstruction('b',4);
        }
        
       /* ==================================================================================
        以下為使用的範例：*/

        
        else if(this.atTime(5)){
            //在5秒的時候，使A=-300、B=0，並且使用(b,0)，讓BOSS開始移動到(A,B)
            this.pushInstruction('A',-300);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
            //此時 A = -300, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0
        }

        else if(this.atTime(10)){
            //在10秒的時候，使A=300、B=0，並且使用(b,0)，讓BOSS開始移動到(A,B)，再使用(b,1)，讓BOSS瞬間移動到目前BOSS要移動到的目標
            this.pushInstruction('A',300);
            this.pushInstruction('B',0);
            this.pushInstruction('b',1);
            this.pushInstruction('b',0);
            //此時 A = 300, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0
        }

        else if(this.atTime(15)){
            //在15秒的時候，使(A,B)為BOSS的座標、(C,D)為玩家的座標、F=250，並且發射一個P1彈幕，P1會使用目前的參數
            this.pushInstruction('A',this.boss.x);
            this.pushInstruction('B',this.boss.y);
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('F',250);
            this.pushInstruction('p',1);
            //此時 A = this.boss.x, B = this.boss.y, C = this.player.x, D = this.player.y, E = 0, F = 250, G = 0, H = 0
        }

        else if(this.atTime(20)){
            //在15秒的時候，使(A,B)為BOSS的座標、(C,D)為玩家的座標、F=250，並且發射五個散狀的P1彈幕，角度間距是10度
            this.pushInstruction('A',this.boss.x);
            this.pushInstruction('B',this.boss.y);
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',-20);
            this.pushInstruction('p',1);
            this.pushInstruction('E',-10);
            this.pushInstruction('p',1);
            this.pushInstruction('E',0);
            this.pushInstruction('p',1);
            this.pushInstruction('E',10);
            this.pushInstruction('p',1);
            this.pushInstruction('E',20);
            this.pushInstruction('p',1);
            //此時 A = this.boss.x, B = this.boss.y, C = this.player.x, D = this.player.y, E = 20, F = 250, G = 0, H = 0
        }

        else if(this.atTime(25)){
            //在25秒的時候，執行function attackPatternA
            this.attackPatternA(0);
        }
        else if(this.atTime(25.5)){
            //在25.5秒的時候，執行function attackPatternA
            this.attackPatternA(10);
        }
        else if(this.atTime(26)){
            //在26秒的時候，執行function attackPatternA
            this.attackPatternA(0);
        }
        else if(this.atTime(26.5)){
            //在26.5秒的時候，執行function attackPatternA
            this.attackPatternA(10);
        }
        else if(this.atTime(27)){
            //在27秒的時候，執行function attackPatternA
            this.attackPatternA(0);
        }
        else if(this.atTime(27.5)){
            //在27.5秒的時候，執行function attackPatternA
            this.attackPatternA(10);
        }
        else if(this.atTime(28)){
            //在28秒的時候，執行function attackPatternA
            this.attackPatternA(0);
        }
        else if(this.atTime(28.5)){
            //在28.5秒的時候，執行function attackPatternA
            this.attackPatternA(10);
        }
        
        /*==================================================================================
        */
        else if(this.atTime(this.level_length-10)){
            //在關卡結束前十秒的時候殺死BOSS
            this.pushInstruction('b',5);
        }
        
        //更新指令到BOSS身上
        if(this.instruction_list) this.endInstruction();
    }

    attackPatternA(initial){
        this.pushInstruction('A',this.boss.x); 
        this.pushInstruction('B',this.boss.y);
        this.pushInstruction('C',this.boss.x+1);
        this.pushInstruction('D',this.boss.y);
        this.pushInstruction('E',initial);
        this.pushInstruction('F',250);
        for(let i = 0;i<360;i+=20){
            this.pushInstruction('E',i);
            this.pushInstruction('p',0);
        }
    }
}
