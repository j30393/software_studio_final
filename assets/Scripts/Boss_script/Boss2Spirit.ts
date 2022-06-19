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
        this.background.color = cc.color(190,240,255);
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
        
        

        // if(this.player.dete) {
        //     this.player.dash = false;
        //     this.pushInstruction("A", this.player.x);
        //     this.pushInstruction("B", this.player.y);
        //     this.pushInstruction("C", 300);
        //     this.pushInstruction("p", 7);
        // }

        //此處開始為BOSS的行動腳本
        if(this.atTime(1)){
            //在1秒的時候生成BOSS
            this.pushInstruction('A',0);
            this.pushInstruction('B',0);
            this.pushInstruction('b',4);

        }
        
       /* ==================================================================================
        以下為使用的範例：
        */

        /*

        else if(this.atTime(2)) {

            this.talking = "我是RGB死神中的藍色死神";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }

        else if(this.atTime(4)) {
            this.talking = "沒想到你能擊敗綠色死神";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }

        else if(this.atTime(6)) {
            this.talking = "不過你的旅途到此為止了!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
            // this.playBGM();
        }

        else if(this.atTime(7)){ 
            this.playBGM();
            this.pushInstruction('t',0);

            this.fireAroundPlayer(100,3,5);
            this.fireAroundPlayer(150,3,4);
            this.fireAroundPlayer(200,3,3);
            this.fireAroundPlayer(250,3,2);
            this.fireAroundPlayer(300,3,1);
        }


        else if(this.atTime(11)){
            //傳送到玩家右上，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(1,1);
            //此時 A = 300, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0
        }
        else if(this.atTime(12)) {
            this.attackPatternA();
        }

        else if(this.atTime(14)){
            //傳送到玩家左上，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(-1,1);
        }
        else if(this.atTime(15)){
            this.attackPatternA();
        }

        else if(this.atTime(17)){
            //傳送到玩家左下，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(-1,-1);
        }
        else if(this.atTime(18)){
            this.attackPatternA();
        }

        else if(this.atTime(20)){
            //傳送到玩家右下，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(1,-1);
        }
        else if(this.atTime(21)){
            this.attackPatternA();
        }


        else if(this.atTime(23)){
            //boss 傳送，第一次獎勵時間
            this.pushInstruction('A', 0);
            this.pushInstruction('B', 100);
            this.pushInstruction('b', 0);
            this.pushInstruction('b', 1);
            //此時 A = this.boss.x, B = this.boss.y, C = this.player.x, D = this.player.y, E = 0, F = 250, G = 0, H = 0
        }

        else if(this.atTime(25)){
            this.talking = "注意到了嗎? 那些地面上的火焰";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(27)){
            this.talking = "在吞噬你的生命之前，它們將永遠燃燒";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(29)){
            this.talking = "你的每一次閃躲，都只會加速自己的死亡";
            this.pushInstruction('t',2);
        }*/ // +28                                                                     在這停頓!!!!!!!
        else if(this.atTime(3)){
            this.talking = "用你的死亡來取悅偉大的火焰之主吧!!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);

        }

        else if(this.atTime(3.2)){
            this.fireAroundBoss(100, 200, 5, 0);
            this.roundAttack(1, 200, 6);
        }
        else if(this.atTime(4.334)){
            this.fireAroundBoss(200, 200, 5, 10);
        }
        else if(this.atTime(4.667)){
            this.fireAroundBoss(300, 200, 5, 20);
        }
        else if(this.atTime(5)){
            this.fireAroundBoss(400, 200, 5, 30);
            this.pushInstruction('t',0);
        }
        // else if(this.atTime(40)){
        //     this.attackPatternA();
        // }
        
        /*==================================================================================
        */
        else if(this.atTime(this.level_length-10)){
            //在關卡結束前十秒的時候殺死BOSS
            this.pushInstruction('b',5);
        }

        //更新指令到BOSS身上
        if(this.instruction_list) this.endInstruction();
    }

    roundAttack(delay_time, speed, cycle) {
        let px = this.boss.x, py = this.boss.y;
        for(let i = 0; i < 360*cycle;i += 13) {
            this.scheduleOnce(()=>{
                this.pushInstruction('A', px);
                this.pushInstruction('B', py);
                this.pushInstruction('C', px+1);
                this.pushInstruction('D', py);
                this.pushInstruction('E', i%360);
                this.pushInstruction('F', speed);
                this.pushInstruction('p', 1);
            }, delay_time*i/1000)
        }
    }

    fireAroundBoss(radius, last_time, interval, start_angle) {
        let px = this.boss.x, py = this.boss.y;
        for(let i = 0+start_angle; i < 360+start_angle;i += (360/interval)) {
            let x = px+radius*Math.cos(i*Math.PI/180);
            let y = py+radius*Math.sin(i*Math.PI/180);
            this.pushInstruction('A',x); 
            this.pushInstruction('B',y);
            this.pushInstruction("C", last_time)
            this.pushInstruction('p', 7);
        }
    }

    teleportAroundPlayerAndAttack(dx, dy) {
        // 傳送到玩家右上/左上/左下/右下，並攻擊
        this.pushInstruction('A', this.boss.x);
        this.pushInstruction('B', this.boss.y);
        this.pushInstruction('C', 200);
        this.pushInstruction('p', 7);
        this.pushInstruction('A',this.player.x+dx*70);
        this.pushInstruction('B',this.player.y+dy*70);
        this.pushInstruction('b', 0);
        this.pushInstruction('b', 2);
        this.scheduleOnce(()=>{
            if(dx > 0) this.pushInstruction('b', 7);
            else this.pushInstruction('b', 6);
        }, 0.5)
        
    }

    fireAroundPlayer(radius, last_time, delay_time) {
        let px = this.player.x, py = this.player.y;
        for(let i = 0; i < 360;i += 10) {
            this.scheduleOnce(()=>{
                let x = px+radius*Math.cos(i*Math.PI/180);
                let y = py+radius*Math.sin(i*Math.PI/180);
                this.pushInstruction('A',x); 
                this.pushInstruction('B',y);
                this.pushInstruction("C", last_time)
                this.pushInstruction('p', 7);
            }, delay_time*i/1000)
        }
    }

    attackPatternA(){
        // 揮刀，並向玩家射出一排彈幕
        if(this.player.x <= this.boss.x) this.pushInstruction('b',7);
        else this.pushInstruction('b',6);
        this.pushInstruction('b', 3);
        this.scheduleOnce(()=>{
            this.pushInstruction('A',this.boss.x); 
            this.pushInstruction('B',this.boss.y);
            this.pushInstruction('C',this.player.x);
            this.pushInstruction('D',this.player.y);
            this.pushInstruction('F',250);
            for(let i = -70;i<=70;i+=10){
                this.pushInstruction('E',i);
                this.pushInstruction('p',1);
            }
        }, 0.3);
    }
}
