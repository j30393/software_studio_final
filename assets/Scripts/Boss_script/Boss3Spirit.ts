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
    @property()
    talking: string = "Hello";
    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;
    @property(cc.AudioSource)
    bgm_source: cc.AudioSource = null;
    @property()
    bgm_volume: number= 1;
    @property()
    bgm_pause: boolean = false;

    //指令的列表
    @property([Instruction])
    instruction_list:Instruction[] = [];

    //==================================================================================
    //必要的程式碼，如無特殊需求請勿更動
    start(){
        this.background.color = cc.color(255,210,210);
        this.bgm_source = this.node.getComponent(cc.AudioSource);
        this.bgm_source.clip = this.bgm;
    }
    private pre_time = 0;
    private time = 0;
    update(dt){
        this.time = this.boss.getComponent("Boss").gamemgr.time;
        this.bgm_source.volume = this.bgm_volume;
        if(this.time<this.pre_time) {
            this.pre_time = this.time;
            this.updateBGM(this.time);
        }

        this.bossSpirit();

        this.pre_time = this.time;
    }
    atTime(target_time){
        return (this.time>target_time&&target_time>this.pre_time)
    }
    
    private start_time;
    playBGM(){
        this.bgm_source.play();
        this.start_time = this.time;
    }
    updateBGM(time_stamp){
        console.log(time_stamp-this.start_time)
        if(time_stamp-this.start_time<0){
            this.bgm_source.stop();
        }
        else{
            this.bgm_source.setCurrentTime(time_stamp-this.start_time)
            this.bgm_source.pause();
        }
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
        (b,6) => BOSS往右看
        (b,7) => BOSS往左看
        (b,8) => BOSS速度變成A
        (p,x) => 發射Px的彈幕(x為編號)，並且會使用目前設定的A~H變數作為彈幕的參數
        (t,0) => 關閉對話框
        (t,1) => 開啟對話框
        (t,2) => 更新BOSS的對話內容
        
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
        (A=開始X座標、B=開始Y座標、C=朝向X座標、D=朝向Y座標、E=偏移的角度、F=速度、G=角加速度,H=待在原地的時間)

        P15 綠色的光炮
        P16 藍色的光炮
        P17 紅色的光炮
        (A=開始X座標、B=開始Y座標、C=朝向X座標、D=朝向Y座標、E=偏移的角度、F=寬度、G=持續時間,H=角加速度)

        P15 ~ P17 光炮
        (A=開始X座標、B=開始Y座標、C=朝向X座標、D=朝向Y座標、E=角度、F=寬度 G=持續時間)

        剩下的彈幕請自行製作自己需要得

        關卡設計所需要的音效，請直接使用cc.audioEngine
        對話框的內容，請修改本腳本的talking變數
        ==================================================================================
        */
        
        // 環狀射擊
        // for(let i = 0; i < 30; ++i){
        //     var angle = 2 * Math.PI * i / 30;
        //     this.pushInstruction('C',Math.cos(angle));
        //     this.pushInstruction('D',Math.sin(angle));
        //     this.pushInstruction('E',angle);
        //     this.pushInstruction('p',11);
        // }

        //此處開始為BOSS的行動腳本
        // if(this.atTime(2)){
        //     for(let i = 0; i < 10; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('B',640);
        //             this.pushInstruction('D',0);
        //             this.pushInstruction('A',640 - i * 1280 / 10);
        //             this.pushInstruction('C',640 - i * 1280 / 10);
        //             this.pushInstruction('p',11);
        //         },i*0.05+1)
        //     }
        //     var b : cc.Label;

        // }else if(this.atTime(3)){
        //     for(let i = 0; i < 10; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('A',-640);
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('B',360 - i * 720 / 10);
        //             this.pushInstruction('D',360 - i * 720 / 10);
        //             this.pushInstruction('p',11);

        //         },i*0.05+1)
        //     }
        // }else if(this.atTime(4)){
        //     this.pushInstruction('A',0);
        //     this.pushInstruction('B',0);
        //     this.pushInstruction('b',4);
        // }else if(this.atTime(6)){
        //     this.pushInstruction('A',0);
        //     this.pushInstruction('B',0);
        //     this.pushInstruction('F',200);
        //     for(let i= 0;i<80;++i){
        //         this.scheduleOnce(()=>{
        //             var angle = 2 * Math.PI * i / 30;
        //             this.pushInstruction('C',Math.cos(angle));
        //             this.pushInstruction('D',Math.sin(angle));
                    
        //             this.pushInstruction('p',2);
        //         },i / 30)
        //     }
        // }else if(this.atTime(12)){ // break
        //     this.pushInstruction('A',this.player.x);
        //     this.pushInstruction('B',this.player.y);
        //     this.pushInstruction('b',4);
        // }else if(this.atTime(13.5)){
        //     this.pushInstruction('b',3);
        // }else if(this.atTime(16)){
        //     this.pushInstruction('A',this.node.x);
        //     this.pushInstruction('B',this.node.y);
        //     for(let i = 0;i < 32; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('D',1);
        //             this.pushInstruction('E',360 / 32 * i);
        //             this.pushInstruction('F',1);
        //             this.pushInstruction('G',1.2);
        //             this.pushInstruction('p',17);
        //         },0.1*i)
        //     }
        // }else if(this.atTime(20)){
        //     this.pushInstruction('A',this.node.x);
        //     this.pushInstruction('B',this.node.y);
        //     for(let i = 0;i < 32; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('D',1);
        //             this.pushInstruction('E',360 / 32 * i);
        //             this.pushInstruction('F',1);
        //             this.pushInstruction('G',1.2);
        //             this.pushInstruction('p',17);
        //         },0.1*i)
        //     }
        // }else if(this.atTime(35)){
        //     for(let i = 0; i < 50; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('A',Math.random()*720 - 360);
        //             this.pushInstruction('B',Math.random()*480 - 240);
        //             this.pushInstruction('C',Math.random()*1+2);
        //             this.pushInstruction('p',8);
        //         },0.03*i)
        //     }
        // }else if(this.atTime(37)){
        //     for(let i = 0; i < 50; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('A',Math.random()*720 -360);
        //             this.pushInstruction('B',Math.random()*480 -240);
        //             this.pushInstruction('C',Math.floor(Math.random()*40 % 8));
        //             this.pushInstruction('p',4);
        //         },0.1*i)
        //     }  
        // }else if(this.atTime(39)){
        //     this.pushInstruction('A',0);
        //     this.pushInstruction('B',0);
        //     this.pushInstruction('b',1);
        // }else 
        // if(this.atTime(42)){
        //     this.pushInstruction('F', 200);
        //     for(let i = 0; i < 50; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x);
        //             this.pushInstruction('D',this.node.y + 1);
        //             this.pushInstruction('E',i*360 / 60);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x + 1);
        //             this.pushInstruction('D',this.node.y);
        //             this.pushInstruction('E',i*360 / 60);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x);
        //             this.pushInstruction('D',this.node.y - 1);
        //             this.pushInstruction('E',i*360 / 60);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x - 1);
        //             this.pushInstruction('D',this.node.y);
        //             this.pushInstruction('E',i*360 / 60);
        //             this.pushInstruction('p',2);
        //         },0.05*i)
        //     }
        // }
        // else if(this.atTime(44.7)){
        //     this.pushInstruction('F', 200);
        //     for(let i = 0; i < 50; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x);
        //             this.pushInstruction('D',this.node.y + 1);
        //             this.pushInstruction('E',-i*360 / 60);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x + 1);
        //             this.pushInstruction('D',this.node.y);
        //             this.pushInstruction('E',-i*360 / 60);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x);
        //             this.pushInstruction('D',this.node.y - 1);
        //             this.pushInstruction('E',-i*360 / 60);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',this.node.x);
        //             this.pushInstruction('B',this.node.y);
        //             this.pushInstruction('C',this.node.x - 1);
        //             this.pushInstruction('D',this.node.y);
        //             this.pushInstruction('E',-i*360 / 60);
        //             this.pushInstruction('p',2);
        //         },0.05*i)
        //     }
        // }else
        // if(this.atTime(50)){
        //     this.pushInstruction('F',50);
        //     var r = 350;
        //     for(let i = 0; i < 45; ++i){
        //         this.scheduleOnce(()=>{
        //             this.pushInstruction('A',r * Math.cos(i*360/4/45 * 2 * Math.PI / 360));
        //             this.pushInstruction('B',r * Math.sin(i*360/4/45 * 2 * Math.PI / 360));
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('D',0);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',r * Math.cos((i*360/4/45 + 90)* 2 * Math.PI / 360));
        //             this.pushInstruction('B',r * Math.sin((i*360/4/45 + 90)* 2 * Math.PI / 360));
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('D',0);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',r * Math.cos((i*360/4/45 + 180)* 2 * Math.PI / 360));
        //             this.pushInstruction('B',r * Math.sin((i*360/4/45 + 180)* 2 * Math.PI / 360));
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('D',0);
        //             this.pushInstruction('p',2);

        //             this.pushInstruction('A',r * Math.cos((i*360/4/45 + 270)* 2 * Math.PI / 360));
        //             this.pushInstruction('B',r * Math.sin((i*360/4/45 + 270)* 2 * Math.PI / 360));
        //             this.pushInstruction('C',0);
        //             this.pushInstruction('D',0);
        //             this.pushInstruction('p',2);
        //         },0.08*i)
        //     }
        // }else
        if(this.atTime(3)){
            for(let i = 0; i < 15; ++i){
                this.scheduleOnce(()=>{
                    this.pushInstruction('A',this.player.x);
                    this.pushInstruction('B',this.player.y);
                    this.pushInstruction('C',2);
                    this.pushInstruction('p',8);
                },i*0.3)
            }
        }

        /*
        ==================================================================================
        以下為使用的範例：

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
