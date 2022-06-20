const {ccclass, property} = cc._decorator;
import Player from "../Player_script/Player";
import GameManager from "../Player_script/GameManager";

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


    @property(GameManager)
    game_manager: GameManager = null;
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

    @property(cc.AudioClip)
    fireball_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    energyball_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    cheer_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    cast_sfx: cc.AudioClip = null;


    //指令的列表
    @property([Instruction])
    instruction_list:Instruction[] = [];

    //==================================================================================
    //必要的程式碼，如無特殊需求請勿更動
    start(){
        this.background.color = cc.color(190,240,255);
        this.bgm_source = this.node.getComponent(cc.AudioSource);
        this.bgm_source.clip = this.bgm;

        this.nowWave = 0;
    }
    private pre_time = 0;
    private time = 0;
    update(dt){
        this.time = this.boss.getComponent("Boss").gamemgr.time;
        if(this.boss.getComponent("Boss").gamemgr.player_paused && this.bgm_source.isPlaying && this.player.getComponent(Player).music_stop == true){
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

        this.bgm_source.volume = this.node.getComponent("Boss").bgm_volume*this.node.getComponent("Boss").bgm_volume_smaller;

        this.pre_time = this.time;

        // 回溯時骷髏生成的判定
        if(this.game_manager.is_rewind && !this.rewind_detected) {
            this.rewind_detected = true;
            this.nowWave += 1000;
            console.log('rewind wave');
        }
        if(!this.game_manager.is_rewind && this.rewind_detected) {
            this.rewind_detected = false;
        }

        // 清彈幕時骷髏生成的判定
        if(this.player.getComponent(Player).bullet_clear && !this.clear_detected) {
            this.clear_detected = true;
            this.nowWave += 1000;
            console.log('clear pattern');
        }
        if(!this.player.getComponent(Player).bullet_clear && this.clear_detected) {
            this.clear_detected = false;
        }
    }
    atTime(target_time){
        return (this.time>target_time- this.skip_time&&target_time- this.skip_time>=this.pre_time); // for test
        // return (this.time>target_time&&target_time>=this.pre_time);
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
        
        // 玩家衝刺時腳下出現火焰
        if(this.player.getComponent(Player).dashDetection) {
            this.player.getComponent(Player).dashDetection = false;
            this.pushInstruction("A", this.player.x);
            this.pushInstruction("B", this.player.y);
            this.pushInstruction("C", 300);
            this.pushInstruction("p", 7);

            let item = [this.player.x, this.player.y, this.time];
            this.tombs = [...this.tombs, item];
        }

        //此處開始為BOSS的行動腳本
        if(this.atTime(1+this.skip_time)){
            //在1秒的時候生成BOSS
            this.pushInstruction('A',0);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
            this.pushInstruction('b',4);

        }
        
       /* ==================================================================================
        以下為使用的範例：
        */

        
        
        else if(this.atTime(2)) {

            this.talking = "我是RGB死神中的藍色死神。";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }

        else if(this.atTime(4)) {
            this.talking = "沒想到你能擊敗綠色死神。";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }

        else if(this.atTime(6)) {
            this.talking = "不過你的旅途到此為止了!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }

        else if(this.atTime(7)){ 
            this.playBGM();
            this.pushInstruction('t',0);
            this.tx = this.player.x;
            this.ty = this.player.y;
            this.fireAroundPlayer(100, 15, 5, 4);
        }
        else if(this.atTime(7.5)) {
            this.fireAroundPlayer(200, 15, 4, 12);
        }
        else if(this.atTime(8)) {
            this.fireAroundPlayer(300, 15, 3, 16);
        }
        else if(this.atTime(8.5)) {
            this.fireAroundPlayer(400, 15, 3, 20);
        }
        else if(this.atTime(9)) {
            this.fireAroundPlayer(500, 15, 3, 24);
        }
        

        else if(this.atTime(11)){
            //傳送到玩家右上，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(1,1);
            //此時 A = 300, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0
        }
        else if(this.atTime(12)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(12.5)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.rowOfFire(90, 6, 150, this.tx, this.ty, 12.5);
        }

        else if(this.atTime(14)){
            //傳送到玩家左上，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(-1,1);
        }
        else if(this.atTime(15)){
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(15.5)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.rowOfFire(90, 6, 150, this.tx, this.ty, 9.5);
        }

        else if(this.atTime(17)){
            //傳送到玩家左下，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(-1,-1);
        }
        else if(this.atTime(18)){
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(18.5)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.rowOfFire(90, 6, 150, this.tx, this.ty, 6.5);
        }

        else if(this.atTime(20)){
            //傳送到玩家右下，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(1,-1);
        }
        else if(this.atTime(21)){
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(21.5)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.rowOfFire(90, 6, 150, this.tx, this.ty, 3.5);
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
            cc.audioEngine.playEffect(this.cheer_sfx,false);
            this.talking = "注意到了嗎? 那些地面上的火焰。";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(27)){
            this.talking = "你已經被我施放了火焰詛咒。";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(29)){
            this.talking = "你的每一次閃躲，都只會加速自己的死亡。";
            this.pushInstruction('t',2);
        } // start from here
        else if(this.atTime(31)){
            this.talking = "用你的死亡來取悅偉大的火焰之主吧!!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);

        }

        else if(this.atTime(31.2)){
            // boss 旁生成一圈火焰
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.fireAroundBoss(100, 200, 10, 0);
            this.roundAttack(1, 200, 2, 20, 17);
        }
        else if(this.atTime(31.5)){
            this.roundAttack(1, 200, 2, 20, 17);
        }
        else if(this.atTime(31.8)){
            this.roundAttack(1, 200, 2, 20, 17);
        }
        else if(this.atTime(32.1)){
            this.roundAttack(1, 200, 2, 20, 17);
        }
        else if(this.atTime(32.334)){
            this.fireAroundBoss(200, 20, 10, 10);
        }
        else if(this.atTime(32.667)){
            this.fireAroundBoss(300, 20, 10, 20);
        }
        else if(this.atTime(33)){
            this.fireAroundBoss(400, 20, 10, 30);
            this.pushInstruction('t',0);
        } 

        else if(this.atTime(37)){
            this.talking = "接下來這招可沒那麼簡單";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(39)) {
            this.pushInstruction('t',0);
            this.pushInstruction('b', 3);
        }
        else if(this.atTime(39.5)) {
            cc.audioEngine.playEffect(this.cast_sfx,false);
            this.ballsOfp13Aiming(100, this.boss.x, this.boss.y+200, 300, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x, this.boss.y-200, 300, 0, 1, 20);
        }

        else if(this.atTime(43)) {
            this.pushInstruction('b', 3);
        }
        else if(this.atTime(43.5)) {
            cc.audioEngine.playEffect(this.cast_sfx,false);
            this.ballsOfp13Aiming(100, this.boss.x+150, this.boss.y+150, 300, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x+150, this.boss.y-150, 300, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x-150, this.boss.y+150, 300, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x-150, this.boss.y-150, 300, 0, 1, 20);
        }// to 55

        else if(this.atTime(59)){
            cc.audioEngine.playEffect(this.cheer_sfx,false);
            this.talking = "你居然還活著，看來你的實力還不錯。";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(62)){
            this.talking = "已經很多年沒人能闖過我這關了。";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(65)) {
            this.talking = "或許你可以讓我玩的盡興一點。";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(68)) {
            this.talking = "接下來我要稍微認真了。";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(71)) {
            this.talking = "接招吧，半徑二十公尺的太乙幽魂陣!!!";
            this.pushInstruction('t',2);
        }

        // 第三波攻勢
        else if(this.atTime(72)) {
            this.pushInstruction('t',0);
            this.nowWave += 1;
            // this.fireAroundBoss(400, 200, 50, 0);
            this.fireAroundBoss(500, 23, 70, 0);
            // this.fireAroundBoss(550, 200, 85, 0);
            this.fireAroundBoss(600, 23, 100, 0);
        }
        else if(this.atTime(74)) {
            this.nowWave += 1;
            this.createTombs(200, 21, 3, 60, 1);
        }
        else if(this.atTime(75)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(1);
            this.createTombs(300, 20, 5, 90, 4);
        }
        else if(this.atTime(76)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(2);
            this.createTombs(150, 19, 3, 120, 3);
        }
        else if(this.atTime(77)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(3);
            this.createTombs(250, 18, 9, 60, 5);
        }
        else if(this.atTime(78)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(4);
            this.createTombs(170, 17, 2, 30, 1);
        }
        else if(this.atTime(79)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(5);
            this.createTombs(130, 16, 20, 0, 16);
        }
        else if(this.atTime(80)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(6);
            this.createTombs(200, 15, 20, 60, 1);
            this.createTombs(300, 15, 20, 90, 7);
        }
        else if(this.atTime(81)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(7);
            this.createTombs(150, 14, 20, 120, 16);
            this.createTombs(250, 14, 20, 60, 13);
        }
        else if(this.atTime(82)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(8);
            this.createTombs(170, 13, 20, 30, 15);
            this.createTombs(130, 13, 20, 0, 2);
        }
        else if(this.atTime(83)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(9);
            this.createTombs(280, 12, 40, 0, 31);
            this.createTombs(330, 12, 40, 0, 12);
        }
        else if(this.atTime(84)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(10);
            this.createTombs(330, 11, 40, 0, 22);
            this.createTombs(260, 11, 40, 0, 38);
        }
        else if(this.atTime(85)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(11);
            this.createTombs(280, 10, 40, 0, 2);
            this.createTombs(390, 10, 40, 0, 16);
        }
        else if(this.atTime(86)) {
            this.nowWave += 1;
            this.createTombs(70, 9, 40, 0, 4);
            this.createTombs(160, 9, 40, 0, 35);
        }
        else if(this.atTime(87)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(13);
            this.createTombs(250, 8, 40, 0, 31);
            this.createTombs(200, 8, 40, 0, 12);
        }
        else if(this.atTime(88)) {
            this.nowWave += 1;
            this.createTombs(320, 7, 40, 0, 14);
            this.createTombs(10, 7, 40, 0, 38);
        }
        else if(this.atTime(89)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(15);
            this.createTombs(130, 6, 40, 0, 1);
            this.createTombs(380, 6, 40, 0, 12);
        }
        else if(this.atTime(90)) {
            this.nowWave += 1;
            this.createSkeletonFromTombs(16);
            this.createTombs(110, 5, 40, 0, 29);
            this.createTombs(160, 5, 40, 0, 35);
        }
        
        else if(this.atTime(95)){
            cc.audioEngine.playEffect(this.cheer_sfx,false);
            this.talking = "什麼!!!你居然活過了我的太乙幽魂陣!!!";
            this.pushInstruction('t',2);
            this.pushInstruction('t',1);
        }
        else if(this.atTime(98)){
            this.talking = "明明你那奇怪的能力無法阻止我對幽冥界亡魂的召喚...";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(101)) {
            this.talking = "看來你能來到這裡並不全是因為僥倖。";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(104)) {
            this.talking = "...";
            this.pushInstruction('t',2);
        }
        else if(this.atTime(108)) {
            this.talking = "我不會再放水了，直面地獄吧!!!!";
            this.pushInstruction('t',1);
            this.pushInstruction('t',2);
        }

        // 重複第一次攻擊的加強版，並放skeleton
        else if(this.atTime(110)){
            this.pushInstruction('t',0);
            //傳送到玩家右上，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(1,1);
        }
        else if(this.atTime(111.5)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(112)) {
            this.attackPatternA(180, 25);
            this.nowWave += 1;
            this.rowOfFire(70, 4, 150, this.tx, this.ty, 31);
        }
        else if(this.atTime(112.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(220, 30);
            this.nowWave += 1;
            this.rowOfFire(90, 6, 300, this.tx, this.ty, 30.5);
        }
        else if(this.atTime(113)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.rowOfFire(110, 9, 450, this.tx, this.ty, 30);
        }
        else if (this.atTime(115)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(3);
        }

        else if(this.atTime(117)){
            //傳送到玩家左上，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(-1,1);
        }
        else if(this.atTime(118.5)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(119)) {
            this.attackPatternA(180, 25);
            this.nowWave += 1;
            this.rowOfFire(70, 4, 150, this.tx, this.ty, 24);
        }
        else if(this.atTime(119.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(220, 30);
            this.nowWave += 1;
            this.rowOfFire(90, 6, 300, this.tx, this.ty, 23.5);
        }
        else if(this.atTime(120)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.rowOfFire(110, 9, 450, this.tx, this.ty, 23);
        }
        else if (this.atTime(120.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(7);
        }

        else if(this.atTime(123)){
            //傳送到玩家左下，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(-1,-1);
        }
        else if(this.atTime(124.5)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(125)) {
            this.attackPatternA(180, 25);
            this.nowWave += 1;
            this.rowOfFire(70, 4, 150, this.tx, this.ty, 18);
        }
        else if(this.atTime(125.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(220, 30);
            this.nowWave += 1;
            this.rowOfFire(90, 6, 300, this.tx, this.ty, 16.5);
        }
        else if(this.atTime(126)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.rowOfFire(110, 9, 450, this.tx, this.ty, 17);
        }
        else if(this.atTime(128)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(11);
        }

        else if(this.atTime(130)){
            //傳送到玩家左下，並揮刀射彈幕
            this.teleportAroundPlayerAndAttack(1,-1);
        }
        else if(this.atTime(131.5)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(132)) {
            this.attackPatternA(180, 25);
            this.nowWave += 1;
            this.rowOfFire(70, 4, 150, this.tx, this.ty, 11);
        }
        else if(this.atTime(132.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(220, 30);
            this.nowWave += 1;
            this.rowOfFire(90, 6, 300, this.tx, this.ty, 10.5);
        }
        else if(this.atTime(133)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.rowOfFire(110, 9, 450, this.tx, this.ty, 10);
        }
        else if(this.atTime(134)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(15);
        }

        else if(this.atTime(137)){
            this.pushInstruction('A', 0);
            this.pushInstruction('B', 100);
            this.pushInstruction('b', 0);
            this.pushInstruction('b', 1);
        }

        else if(this.atTime(138)){
            // boss 旁生成一圈火焰
            this.nowWave += 1;
            this.fireAroundBoss(100, 5, 10, 0);
            this.roundAttack(1, 200, 2, 20, 17);

        }
        else if(this.atTime(138.5)){
            this.roundAttack(1, 200, 4.5, 20, 17);
        }
        else if(this.atTime(138.8)){
            this.roundAttack(1, 200, 4.2, 20, 17);
        }
        else if(this.atTime(139.1)){
            this.roundAttack(1, 200, 4, 20, 17);
        }
        else if(this.atTime(139.334)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(200, 3.6, 10, 10);
        }
        else if(this.atTime(139.667)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(300, 3, 10, 20);
        }
        else if(this.atTime(140)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(400, 3, 10, 30);
        } 
        else if(this.atTime(140.3)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(400, 3, 10, 30);
            this.createSkeletonFromTombs(4);
        }

        // 最後的廢話
        else if(this.atTime(143)) {
            cc.audioEngine.playEffect(this.cheer_sfx,false);
            this.talking = "你居然撐過了我的攻擊？";
            this.pushInstruction('t', 2);
            this.pushInstruction('t', 1);
        }
        else if(this.atTime(146)) {
            this.talking = "...";
            this.pushInstruction('t', 2);
        }
        else if(this.atTime(148)) {
            this.talking = "看來沒辦法了...";
            this.pushInstruction('t', 2);
        }
        else if(this.atTime(151)) {
            this.talking = "就算拚著我這條命不要，我也會把你永遠留在這裡。";
            this.pushInstruction('t', 2);
        }
        else if(this.atTime(154)) {
            this.talking = "這是我最後的火焰了。接招吧，天魔解體大法!!!";
            this.pushInstruction('t', 2);
        }

        

        else if(this.atTime(154.5)) {
            this.pushInstruction('b', 3);
        }
        else if(this.atTime(155)) {
            this.ballsOfp13Aiming(100, this.boss.x+200, this.boss.y+200, 200, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x+200, this.boss.y-200, 200, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x-200, this.boss.y+200, 200, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x-200, this.boss.y-200, 200, 0, 1, 20);
        }

        else if(this.atTime(155.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(100, 200, 7, 0);
        }
        else if(this.atTime(156)){
            this.nowWave += 1;
            this.roundAttack(1, 200, 2, 7, 17);
        }
        else if(this.atTime(156.3)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(200, 200, 7, 10);
        }
        else if(this.atTime(156.6)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(3);
        }
        else if(this.atTime(157)) {
            this.pushInstruction('t', 0);
        }

        else if(this.atTime(158.5)) {
            this.pushInstruction('b', 3);
        }
        else if(this.atTime(159)) {
            this.ballsOfp13Aiming(100, this.boss.x+150, this.boss.y+150, 200, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x+150, this.boss.y-150, 200, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x-150, this.boss.y+150, 200, 0, 1, 20);
            this.ballsOfp13Aiming(100, this.boss.x-150, this.boss.y-150, 200, 0, 1, 20);
        }

        else if(this.atTime(159.5)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(400, 200, 7, 20);
        }
        else if(this.atTime(160)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(600, 200, 7, 30);
        } 
        else if(this.atTime(160.5)){
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.fireAroundBoss(700, 200, 7, 30);
        }
        else if(this.atTime(161)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(7);
        }

        else if(this.atTime(162)) {
            if(this.player.x >= this.boss.x) this.pushInstruction('b', 6);
            else this.pushInstruction('b', 7);
            this.pushInstruction('b', 3);
        }
        else if(this.atTime(162.5)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(163)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(180, 25);
            this.nowWave += 1;
            this.rowOfFire(70, 4, 150, this.tx, this.ty, 20);
        }
        else if(this.atTime(163.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(220, 30);
            this.nowWave += 1;
            this.rowOfFire(90, 6, 300, this.tx, this.ty, 20);
        }
        else if(this.atTime(164)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.rowOfFire(110, 9, 450, this.tx, this.ty, 20);
        }
        else if(this.atTime(165.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(11);
        }

        else if(this.atTime(166)) {
            if(this.player.x >= this.boss.x) this.pushInstruction('b', 6);
            else this.pushInstruction('b', 7);
            this.pushInstruction('b', 3);
        }
        else if(this.atTime(166.5)) {
            this.attackPatternA(140, 20);
            this.tx = this.player.x;
            this.ty = this.player.y;
        }
        else if(this.atTime(167)) {
            this.attackPatternA(180, 25);
            this.nowWave += 1;
            this.rowOfFire(70, 4, 150, this.tx, this.ty, 20);
        }
        else if(this.atTime(167.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.attackPatternA(220, 30);
            this.nowWave += 1;
            this.rowOfFire(90, 6, 300, this.tx, this.ty, 20);
        }
        else if(this.atTime(168)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.rowOfFire(110, 9, 450, this.tx, this.ty, 20);
        }
        else if(this.atTime(168.5)) {
            cc.audioEngine.playEffect(this.fireball_sfx,false);
            this.nowWave += 1;
            this.createSkeletonFromTombs(11);
        }
        

        
        /*==================================================================================
        */
        else if(this.atTime(this.level_length-10)){// 170
            //在關卡結束前十秒的時候殺死BOSS
            this.pushInstruction('b',5);
        }

        //更新指令到BOSS身上
        if(this.instruction_list) this.endInstruction();
    }
    skip_time = 0;     //                                                          在這裡跳過時間
    tombs = [];
    tx = 0;
    ty = 0;
    rewind_detected = false;
    clear_detected = false;
    nowWave = 0;// 每次放需要生骷髏的火時wave+1，回溯時+1000以捨棄回溯前的火
    createSkeletonFromTombs(createWaveNum) {
        // 製造從lastWave往前算createWaveNum數量內的wave
        for(let i in this.tombs) {
            if(this.nowWave-this.tombs[i][3] <= createWaveNum && this.tombs[i][3] <= this.nowWave) {
                // console.log(this.time, this.tombs[i][2], createWaveNum);
                let x = this.tombs[i][0], y = this.tombs[i][1];
                this.pushInstruction('A', this.tombs[i][0]);
                this.pushInstruction('B', this.tombs[i][1]);
                let vec = cc.v2(this.player.x-x, this.player.y-y);
                let degree = cc.misc.radiansToDegrees(vec.signAngle(cc.v2(1,0)));
                let c = 0;
                if(degree < -67.5 && degree <= -112.5) c = 0;
                else if(-157.5 < degree && degree <= -112.5 ) c = 1;
                else if(157.5 <= degree || degree <= -157.5) c = 2;
                else if(112.5 < degree && degree <= 157.5) c = 3;
                else if( 67.5 < degree  && degree <= 112.5) c = 4;
                else if(22.5 < degree && degree <= 67.5) c = 5;
                else if(-22.5 < degree || degree <= 22.5) c = 6;
                else if(-67.5 < degree && degree <= -22.5) c = 7;
                this.pushInstruction('C', c);
                this.pushInstruction('p',4);
            }

            // console.log(i);
        }
    }
    putTomb(x, y) {
        let already_have: boolean = false;
        for(let i in this.tombs) {
            if(x == this.tombs[i][0] && y == this.tombs[i][1]) {
                this.tombs[i] = [x,y,this.time, this.nowWave];
                already_have = true;
                break;
            }
        }
        if(!already_have) {
            let item = [x, y, this.time, this.nowWave];
            this.tombs = [...this.tombs, item];
        }
    }
    createTombs(radius, last_time, interval, start_angle, i) {
        let px = this.boss.x, py = this.boss.y;
        let x = px+radius*Math.cos((360/interval)*(i+start_angle)*Math.PI/180);
        let y = py+radius*Math.sin((360/interval)*(i+start_angle)*Math.PI/180);
        this.pushInstruction('A', x); 
        this.pushInstruction('B', y);
        this.pushInstruction("C", last_time);
        this.pushInstruction('p', 7);
        this.putTomb(x, y);
        
    }


    ballsOfp13Aiming(radius, startX, startY, speed, rpm, wait, interval) {
        for(let i = 0;i < 360; i += 360/interval) {
            this.scheduleOnce(()=>{
                let x = startX+radius*Math.cos(i*Math.PI/180);
                let y = startY+radius*Math.sin(i*Math.PI/180);
                this.pushInstruction('A',x); 
                this.pushInstruction('B',y);
                this.pushInstruction('C', (startX+this.player.x)/2);
                this.pushInstruction('D', (startY+this.player.y)/2);
                this.pushInstruction('E', 0);
                this.pushInstruction('F', speed);
                this.pushInstruction('G', rpm+i/360);
                this.pushInstruction('H', wait);
                this.pushInstruction('p', 13);
            }, 0.05);
        }
    }
    
    roundAttack(delay_time, speed, cycle, interval, offset) {
        let px = this.boss.x, py = this.boss.y;
        for(let i = 0; i < 360*cycle;i += 360/interval+offset) {
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
            this.pushInstruction("C", last_time);
            this.pushInstruction('p', 7);
            this.putTomb(x, y);

        }
    }

    teleportAroundPlayerAndAttack(dx, dy) {
        // 傳送到玩家右上/左上/左下/右下，並攻擊

        this.pushInstruction('A', this.boss.x);
        this.pushInstruction('B', this.boss.y);
        this.pushInstruction('A',this.player.x+dx*70);
        this.pushInstruction('B',this.player.y+dy*70);
        this.pushInstruction('b', 0);
        this.pushInstruction('b', 2);
        this.scheduleOnce(()=>{
            if(dx > 0) this.pushInstruction('b', 7);
            else this.pushInstruction('b', 6);
        }, 0.5)
        
    }

    fireAroundPlayer(radius, last_time, delay_time, interval) {
        let px = this.tx, py = this.ty;
        for(let i = 0; i < 360;i += 360/interval) {
            this.scheduleOnce(()=>{
                let x = px+radius*Math.cos(i*Math.PI/180);
                let y = py+radius*Math.sin(i*Math.PI/180);
                this.pushInstruction('A',x); 
                this.pushInstruction('B',y);
                this.pushInstruction("C", last_time)
                this.pushInstruction('p', 7);

                this.putTomb(x, y);
            }, delay_time*i/1000)
        }
    }

    rowOfFire(total_angle, interval, radius, px, py, last_time) {
        for(let i=0 ;i<total_angle;i+=total_angle/interval) {
            let len = Math.sqrt((Math.pow(px-this.boss.x, 2)+Math.pow(py-this.boss.y, 2)));
            let dx = (px-this.boss.x)/len;
            let dy = (py-this.boss.y)/len;
            let x = this.boss.x+dx*radius*Math.cos(i*Math.PI/180);
            let y = this.boss.y+dy*radius*Math.sin(i*Math.PI/180);
            this.pushInstruction('A', x);
            this.pushInstruction('B', y);
            this.pushInstruction('C', last_time);
            this.pushInstruction('p', 7);

            this.putTomb(x, y);

        }
    }

    attackPatternA(total_angle, interval){
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
            for(let i = -total_angle/2;i<=total_angle/2;i+=total_angle/interval){
                this.pushInstruction('E',i);
                this.pushInstruction('p',1);
            }
        }, 0.3);
    }
}
