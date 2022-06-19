
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
    onload(){

    }

    start(){
        this.background.color = cc.color(220,255,220);
        this.bgm_source = this.node.getComponent(cc.AudioSource);
        this.bgm_source.clip = this.bgm;
    }

    private pre_time = 0;
    private time = 0;

    update(dt){
        this.time = this.boss.getComponent("Boss").gamemgr.time;
        if(this.boss.getComponent("Boss").gamemgr.player_paused && this.bgm_source.isPlaying){
            this.bgm_source.pause();
            this.resume_from_pause = false;
        }
        this.bgm_source.volume = this.bgm_volume;
        if(this.time<this.pre_time) {
            this.pre_time = this.time;
            this.updateBGM(this.time);
        }
        this.Bgm_resume();
        this.bossSpirit();

        this.pre_time = this.time;
    }
    atTime(target_time){
        return (this.time>target_time&&target_time>=this.pre_time)
    }

    private start_time;
    playBGM(){
        this.bgm_source.play();
        this.start_time = this.time;
    }
    updateBGM(time_stamp){
        console.log(time_stamp-this.start_time);
        if(time_stamp-this.start_time<0){
            this.bgm_source.stop();
        }
        else{
            this.bgm_source.setCurrentTime(time_stamp-this.start_time)
            this.bgm_source.pause();
            this.resume_from_pause = false;
        }
    }

    /* 音樂調控 */
    private resume_from_pause : boolean = true;
    Bgm_resume(){
        if(!this.boss.getComponent("Boss").gamemgr.player_paused && !this.resume_from_pause){
            console.log("resume music");
            this.resume_from_pause = true;
            this.bgm_source.resume();
        }
    }
    /* 音樂調控 */

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

        剩下的彈幕請自行製作自己需要得

        關卡設計所需要的音效，請直接使用cc.audioEngine
        對話框的內容，請修改本腳本的talking變數
        ==================================================================================
        */
        
        //此處開始為BOSS的行動腳本
        if(this.atTime(1)){
             //在1秒的時候生成BOSS
            this.pushInstruction('b',4);
        }
        else if(this.atTime(5)){
            this.playBGM();
            this.talking = "我是RGB死神中的綠色死神";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(8)){
            this.bgm_pause = true;
            this.pushInstruction('t',0);
        }
        else if(this.atTime(10)){
            this.talking = "你能跟上我的腳步嗎!!!\n(預設 WASD 移動)";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(13)){
            this.attackPatternA(10);
            this.pushInstruction('t',0);
        }
        else if(this.atTime(13.5)){
            this.bgm_pause = false;
            this.attackPatternA(0);
        }
        else if(this.atTime(14)){
            this.attackPatternA(10);
        }
        else if(this.atTime(14.5)){
            this.attackPatternA(0);
        }
        else if(this.atTime(15)){
            this.attackPatternA(10);
        }
        else if(this.atTime(15.5)){
            this.attackPatternA(0);
        }
        else if(this.atTime(16)){
            this.attackPatternA(10);
        }
        else if(this.atTime(16.5)){
            this.attackPatternA(0);
        }
        else if(this.atTime(17)){
            this.attackPatternA(10);
        }
        else if(this.atTime(17.5)){
            this.attackPatternA(0);
        }
        else if(this.atTime(18)){
            this.talking = "難道你只會閃躲的嗎???\n(預設 J 攻擊)";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(21)){
            this.pushInstruction('t',0);
            this.talking = "也罷，畢竟你可能會需要專心躲避接下來的招式......";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(23)){
            this.pushInstruction('t',0);
            this.talking = "不然，你只有死路一條!!!\n(預設 K 閃躲)";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(25)){
            this.pushInstruction('t',0);
            this.pushInstruction('A',-400);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
            this.pushInstruction('b',1);
        }
        else if(this.atTime(28)){
            this.pushInstruction('A',-700);
            this.pushInstruction('C',6);
            for(let i = 400;i>=-400;i-=40){
                this.pushInstruction('B',i);
                this.pushInstruction('p',3)
            }
        }
        else if(this.atTime(30)){
            for(let i = 420;i>=-420;i-=40){
                this.pushInstruction('B',i);
                this.pushInstruction('p',3)
            }
        }
        else if(this.atTime(32)){
            this.pushInstruction('C',6);
            for(let i = 400;i>=-400;i-=40){
                this.pushInstruction('B',i);
                this.pushInstruction('p',3)
            }
        }
        else if(this.atTime(34)){
            this.pushInstruction('C',6);
            for(let i = 420;i>=-420;i-=40){
                this.pushInstruction('B',i);
                this.pushInstruction('p',3)
            }
        }
        else if(this.atTime(36)){
            this.pushInstruction('C',6);
            for(let i = 400;i>=-400;i-=40){
                this.pushInstruction('B',i);
                this.pushInstruction('p',3)
            }
        }
        else if(this.atTime(37)){
            this.pushInstruction('A',0);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
            this.pushInstruction('b',1);
        }
        else if(this.atTime(40)){
            this.talking = "是我高估你的實力了嗎?\n(預設 L 特殊攻擊)";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(43)){
            this.pushInstruction('t',0);
            this.talking = "我可是要使出全力了!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(46)){
            this.pushInstruction('t',0);
            this.talking = "做好心理準備吧!!!(預設 Q 存檔)";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
            this.attackPatternB(100,0);
        }
        else if(this.atTime(46.2)){
            this.attackPatternB(150,1);
        }
        else if(this.atTime(46.4)){
            this.attackPatternB(200,0);
        }
        else if(this.atTime(46.6)){
            this.attackPatternB(250,1);
        }
        else if(this.atTime(46.8)){
            this.attackPatternB(300,0);
        }
        else if(this.atTime(47)){
            this.attackPatternB(350,1);
        }
        else if(this.atTime(49)){
            this.pushInstruction('t',0);
        }
        else if(this.atTime(50)){
            this.pushInstruction('A',-400);
            this.pushInstruction('B',300);
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
            this.scheduleOnce(function(){
                this.pushInstruction('b',6);
            },0.5)
        }
        else if(this.atTime(52.5)){
            this.pushInstruction('A',400);
            this.pushInstruction('B',-300);
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
            this.scheduleOnce(function(){
                this.pushInstruction('b',7);
            },0.5)
        }
        else if(this.atTime(55)){
            this.pushInstruction('A',-400);
            this.pushInstruction('B',-300);
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
            this.scheduleOnce(function(){
                this.pushInstruction('b',6);
            },0.5)
        }
        else if(this.atTime(57.5)){
            this.pushInstruction('A',400);
            this.pushInstruction('B',300);
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
            this.scheduleOnce(function(){
                this.pushInstruction('b',7);
            },0.5)
        }
        else if(this.atTime(60)){
            this.pushInstruction('A',0);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
            this.pushInstruction('b',1);
            this.scheduleOnce(function(){
                this.pushInstruction('b',6);
            },0.5)
        }
        else if(this.atTime(61)){
            this.attackPatternC();
        }
        else if(this.atTime(62)){
            this.attackPatternD();
        }
        else if(this.atTime(63)){
            this.attackPatternC();
        }
        else if(this.atTime(64)){
            this.attackPatternD();
        }
        else if(this.atTime(65)){
            this.attackPatternC();
        }
        else if(this.atTime(70)){
            this.attackPatternE(500,350,-1);
            this.attackPatternE(-500,250,1);
            this.attackPatternE(500,150,-1);
            this.attackPatternE(-500,50,1);
            this.attackPatternE(500,-50,-1);
            this.attackPatternE(-500,-150,1);
            this.attackPatternE(500,-250,-1);
            this.attackPatternE(-500,-350,1);
        }
        else if(this.atTime(72.85)){
            this.attackPatternE(-500,350,1);
            this.attackPatternE(500,250,-1);
            this.attackPatternE(-500,150,1);
            this.attackPatternE(500,50,-1);
            this.attackPatternE(-500,-50,1);
            this.attackPatternE(500,-150,-1);
            this.attackPatternE(-500,-250,1);
            this.attackPatternE(500,-350,-1);
        }
        else if(this.atTime(75.7)){
            this.attackPatternE(500,350,-1);
            this.attackPatternE(-500,250,1);
            this.attackPatternE(500,150,-1);
            this.attackPatternE(-500,50,1);
            this.attackPatternE(500,-50,-1);
            this.attackPatternE(-500,-150,1);
            this.attackPatternE(500,-250,-1);
            this.attackPatternE(-500,-350,1);
        }
        else if(this.atTime(78.55)){
            this.attackPatternE(-500,350,1);
            this.attackPatternE(500,250,-1);
            this.attackPatternE(-500,150,1);
            this.attackPatternE(500,50,-1);
            this.attackPatternE(-500,-50,1);
            this.attackPatternE(500,-150,-1);
            this.attackPatternE(-500,-250,1);
            this.attackPatternE(500,-350,-1);
        }
        else if(this.atTime(81)){
            this.talking = "你還滿厲害的嘛!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(84)){
            this.pushInstruction('t',0);
            this.talking = "但是，可別小看我......";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(87)){
            this.pushInstruction('t',0);
            this.talking = "我這把鐮刀可是可以發射雷射光的!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(90)){
            this.pushInstruction('t',0);
            this.pushInstruction('A',-500)
            this.pushInstruction('B',0)
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
            this.scheduleOnce(function(){
                this.pushInstruction('b',6);
                this.attackPatternF();
            },0.5)
        }
        else if(this.atTime(94)){
            this.pushInstruction('A',500)
            this.pushInstruction('B',0)
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
            this.scheduleOnce(function(){
                this.pushInstruction('b',7);
                this.attackPatternF();
            },0.5)
        }
        else if(this.atTime(98)){
            this.pushInstruction('A',-500)
            this.pushInstruction('B',0)
            this.pushInstruction('b',0);
        }
        else if(this.atTime(99)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.5);
            this.pushInstruction('G',12);
            this.pushInstruction('H',0);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(100)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',-400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',11);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(101)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',10);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(102)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',-400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',9);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(103)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',8);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(104)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',-400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',7);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(105)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',6);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(106)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',-400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',5);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(107)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',4);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(108)){
            this.pushInstruction('A',this.boss.x)
            this.pushInstruction('B',-400)
            this.pushInstruction('C',this.player.x)
            this.pushInstruction('D',this.player.y)
            this.pushInstruction('G',3);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(110)){
            this.pushInstruction('A',0)
            this.pushInstruction('B',0)
            this.pushInstruction('b',0)
            this.pushInstruction('b',1)
            this.pushInstruction('b',6)
        }
        else if(this.atTime(112)){
            this.talking = "看來你死了X次才來到這邊阿......";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(115)){
            this.pushInstruction('t',0);
            this.talking = "竟然一次都沒死，你還挺厲害的嘛!!!";
            this.talking = "滿不錯的，我承認你了";
            this.talking = "費盡千辛萬苦來到這裡，感覺如何。";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(118)){
            this.pushInstruction('t',0);
            this.talking = "可惜，我的實力仍在你之上!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(120)){
            this.pushInstruction('t',0);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',10);
            this.pushInstruction('H',1);
            this.pushInstruction('C',0);
            this.pushInstruction('D',1);
            this.pushInstruction('p',15);
            this.pushInstruction('C',1);
            this.pushInstruction('D',0);
            this.pushInstruction('p',15);
            this.pushInstruction('C',0);
            this.pushInstruction('D',-1);
            this.pushInstruction('p',15);
            this.pushInstruction('C',-1);
            this.pushInstruction('D',0);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(122)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',-20);
            this.pushInstruction('p',9);
            this.pushInstruction('E',10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',0);
            this.pushInstruction('p',9);
            this.pushInstruction('E',-10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',20);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(124)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',-20);
            this.pushInstruction('p',9);
            this.pushInstruction('E',10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',0);
            this.pushInstruction('p',9);
            this.pushInstruction('E',-10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',20);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(126)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',-20);
            this.pushInstruction('p',9);
            this.pushInstruction('E',10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',0);
            this.pushInstruction('p',9);
            this.pushInstruction('E',-10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',20);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(128)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',-20);
            this.pushInstruction('p',9);
            this.pushInstruction('E',10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',0);
            this.pushInstruction('p',9);
            this.pushInstruction('E',-10);
            this.pushInstruction('p',9);
            this.pushInstruction('E',20);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(130)){
            this.pushInstruction('t',0);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',10);
            this.pushInstruction('H',-1);
            this.pushInstruction('C',0);
            this.pushInstruction('D',1);
            this.pushInstruction('p',15);
            this.pushInstruction('C',1);
            this.pushInstruction('D',0);
            this.pushInstruction('p',15);
            this.pushInstruction('C',0);
            this.pushInstruction('D',-1);
            this.pushInstruction('p',15);
            this.pushInstruction('C',-1);
            this.pushInstruction('D',0);
            this.pushInstruction('p',15);
        }
        else if(this.atTime(132.85)){
            this.attackPatternE(500,350,-1);
            this.attackPatternE(-500,250,1);
            this.attackPatternE(500,150,-1);
            this.attackPatternE(-500,50,1);
            this.attackPatternE(500,-50,-1);
            this.attackPatternE(-500,-150,1);
            this.attackPatternE(500,-250,-1);
            this.attackPatternE(-500,-350,1);
        }
        else if(this.atTime(135.7)){
            this.attackPatternE(-500,350,1);
            this.attackPatternE(500,250,-1);
            this.attackPatternE(-500,150,1);
            this.attackPatternE(500,50,-1);
            this.attackPatternE(-500,-50,1);
            this.attackPatternE(500,-150,-1);
            this.attackPatternE(-500,-250,1);
            this.attackPatternE(500,-350,-1);
        }
        else if(this.atTime(138.55)){
            this.attackPatternE(500,350,-1);
            this.attackPatternE(-500,250,1);
            this.attackPatternE(500,150,-1);
            this.attackPatternE(-500,50,1);
            this.attackPatternE(500,-50,-1);
            this.attackPatternE(-500,-150,1);
            this.attackPatternE(500,-250,-1);
            this.attackPatternE(-500,-350,1);
        }
        else if(this.atTime(140)){
            this.talking = "這樣都無法殺死你嗎？";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(143)){
            this.pushInstruction('t',0);
            this.talking = "看來......";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(146)){
            this.pushInstruction('t',0);
            this.talking = "我只好跟你同歸於盡了!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(150)){
            this.pushInstruction('t',0);
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(152)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(154)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(156)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(158)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(160)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(162)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(164)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(166)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(168)){
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('E',0);
            this.pushInstruction('F',0.7);
            this.pushInstruction('G',4);
            this.pushInstruction('H',0);
            this.pushInstruction('A',this.player.x);
            this.pushInstruction('B',this.player.y+800);
            this.pushInstruction('p',15)
            this.pushInstruction('A',this.player.x-1500);
            this.pushInstruction('B',this.player.y);
            this.pushInstruction('p',15)
            let tmp_x = this.player.x;
            let tmp_y = this.player.y;
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1)
            this.scheduleOnce(function(){
                this.attackPatternH(tmp_x,tmp_y);
            },1.4)
            this.scheduleOnce(function(){
                this.attackPatternG(tmp_x,tmp_y);
            },1.8)
        }
        else if(this.atTime(170)){
            //在關卡結束前十秒的時候殺死BOSS
            this.talking = "就算殺死了我......還有......";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
            this.pushInstruction('b',5);
        }
        else if(this.atTime(173)){
            this.pushInstruction('t',0);
        }
        
        //更新指令到BOSS身上*/
        if(this.instruction_list) this.endInstruction();
    }

    attackPatternA(initial){
        this.pushInstruction('A',this.boss.x); 
        this.pushInstruction('B',this.boss.y);
        this.pushInstruction('C',this.boss.x+1);
        this.pushInstruction('D',this.boss.y);
        this.pushInstruction('E',initial);
        this.pushInstruction('F',250);
        for(let i = initial;i<360;i+=20){
            this.pushInstruction('E',i);
            this.pushInstruction('p',0);
        }
    }

    attackPatternB(initial,shift){
        this.pushInstruction('E',0);
        this.pushInstruction('F',initial*2*Math.PI/240);
        this.pushInstruction('G',0);
        this.pushInstruction('H',0);
        for(let i = 0;i<12;i++){
            let distance = cc.v2(-Math.sin((i*30+shift*15)*Math.PI/180)*initial, Math.cos((i*30+shift*15)*Math.PI/180)*initial);
            this.pushInstruction('A',this.player.x+distance.x)
            this.pushInstruction('B',this.player.y+distance.y)
            let distance2 = cc.v2(Math.cos(90*Math.PI/180)*distance.x - Math.sin(90*Math.PI/180)*distance.y,Math.sin(90*Math.PI/180)*distance.x + Math.cos(90*Math.PI/180)*distance.y);
            this.pushInstruction('C',this.player.x + distance.x + distance2.x)
            this.pushInstruction('D',this.player.y + distance.y + distance2.y)
            this.pushInstruction('p',12);
        }
    }

    attackPatternC(){
        for(let i = 0;i<10;i++){
            this.pushInstruction('C',0);
            this.pushInstruction('D',0);
            this.pushInstruction('F',150);
            this.scheduleOnce(function(){
                this.pushInstruction('E',(i%10)*18-90);
                this.pushInstruction('A',400);
                this.pushInstruction('B',300);
                this.pushInstruction('p',0);
                this.pushInstruction('A',-400);
                this.pushInstruction('B',-300);
                this.pushInstruction('p',0);
                this.pushInstruction('A',400);
                this.pushInstruction('B',-300); 
                this.pushInstruction('p',0);
                this.pushInstruction('A',-400);
                this.pushInstruction('B',300);
                this.pushInstruction('p',0);
            },0.1*i)
        }
    }

    attackPatternD(){
        for(let i = 9;i>=0;i--){
            this.pushInstruction('C',0);
            this.pushInstruction('D',0);
            this.pushInstruction('F',150);
            this.scheduleOnce(function(){
                this.pushInstruction('E',(i%10)*18-90);
                this.pushInstruction('A',400);
                this.pushInstruction('B',300);
                this.pushInstruction('p',0);
                this.pushInstruction('A',-400);
                this.pushInstruction('B',-300);
                this.pushInstruction('p',0);
                this.pushInstruction('A',400);
                this.pushInstruction('B',-300); 
                this.pushInstruction('p',0);
                this.pushInstruction('A',-400);
                this.pushInstruction('B',300);
                this.pushInstruction('p',0);
            },0.1*(9-i))
        }
    }

    attackPatternE(pos_x,pos_y,direction){
        this.pushInstruction('E',0);
        this.pushInstruction('F',500);
        this.pushInstruction('G',0);
        this.pushInstruction('H',1);
        for(let i = 0;i<12;i++){
            let distance = cc.v2(-Math.sin((i*30)*Math.PI/180)*50, Math.cos((i*30)*Math.PI/180)*50);
            this.pushInstruction('A',pos_x+distance.x)
            this.pushInstruction('B',pos_y+distance.y)
            this.pushInstruction('C',pos_x+distance.x+direction)
            this.pushInstruction('D',pos_y+distance.y)
            this.pushInstruction('p',12)
        }
    }

    attackPatternF(){
        this.pushInstruction('C',this.player.x)
        this.pushInstruction('D',this.player.y)
        this.pushInstruction('F',1);
        this.pushInstruction('G',3);
        this.pushInstruction('H',0);
        for(let i = -70;i<=70;i+=10){
            this.pushInstruction('E',i);
            this.pushInstruction('p',15)
        }
    }

    attackPatternG(pos_x,pos_y){
        this.pushInstruction('E',0);
        this.pushInstruction('F',-250);
        this.pushInstruction('G',0);
        this.pushInstruction('H',0);
        for(let i = 0;i<12;i++){
            let distance = cc.v2(-Math.sin((i*30+15)*Math.PI/180)*50, Math.cos((i*30+15)*Math.PI/180)*50);
            this.pushInstruction('A',pos_x+distance.x)
            this.pushInstruction('B',pos_y+distance.y)
            this.pushInstruction('C',pos_x)
            this.pushInstruction('D',pos_y)
            this.pushInstruction('p',12);
        }
    }

    attackPatternH(pos_x,pos_y){
        this.pushInstruction('E',0);
        this.pushInstruction('F',-250);
        this.pushInstruction('G',0);
        this.pushInstruction('H',0);
        for(let i = 0;i<12;i++){
            let distance = cc.v2(-Math.sin((i*30)*Math.PI/180)*50, Math.cos((i*30)*Math.PI/180)*50);
            this.pushInstruction('A',pos_x+distance.x)
            this.pushInstruction('B',pos_y+distance.y)
            this.pushInstruction('C',pos_x)
            this.pushInstruction('D',pos_y)
            this.pushInstruction('p',12);
        }
    }
}