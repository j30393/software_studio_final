import Player from "../Player_script/Player";
import GameManager from "../Player_script/GameManager";
const {ccclass, property} = cc._decorator;
declare const firebase: any;

@ccclass
export default class Menu extends cc.Component {

    // player
    @property(Player)
    Player: Player = null;
    @property(GameManager)
    GameManager: GameManager = null;

    @property(cc.VideoPlayer)
    RickRoll: cc.VideoPlayer = null;
    @property(cc.Camera)
    MainCamera: cc.Camera = null;
    @property(cc.Node)
    Background: cc.Node = null;
    @property(cc.Node)
    Background2: cc.Node = null;


    // 遊戲主要場景
    @property(cc.Node)
    MainSceneArea: cc.Node = null;

    // 菜單相關
    @property(cc.Node)
    MenuList: cc.Node = null;
    @property(cc.Node)
    MenuTitle: cc.Node = null;
    @property(cc.Button)
    OpenMenuBtn: cc.Button = null;
    @property(cc.Button)
    CloseMenuBtn: cc.Button = null;
    @property(cc.Button)
    CloseMenuBgBtn: cc.Button = null;

    @property(cc.Button)
    ChangePhotoBtn: cc.Button = null;
    @property(cc.Button)
    SignOutBtn: cc.Button = null;
    @property(cc.Button)
    RankBtn: cc.Button = null;

    // 登入相關
    // LogInBtn是叫出登入畫面的按鈕
    @property(cc.Button)
    GoogleLogInBtn: cc.Button = null;
    @property(cc.Button)
    LogInBtn: cc.Button = null;
    @property(cc.Button)
    LogInBtn2: cc.Button = null;

    // 進度條相關
    @property(cc.Node)
    UICameraProgressBar: cc.Node = null; // 在 ui camera 的 node
    @property(cc.Node)
    ProgressBarList: cc.Node = null;
    @property(cc.ProgressBar)
    ProgressBar: cc.ProgressBar = null;
    @property(cc.Node)
    ProgressBarArea: cc.Node = null; // progress bar 的區域，用來判斷滑鼠進出的區域
    @property(cc.Button)
    Sound: cc.Button = null;
    @property(cc.Slider)
    SoundSlider: cc.Slider = null;
    @property(cc.Node)
    SoundSliderHandle: cc.Node = null;
    @property(cc.Node)
    Time: cc.Node = null;
    @property(cc.Button)
    FullScreenBtn: cc.Button = null;
    @property(cc.Button)
    ZoomOutBtn: cc.Button = null;

    @property(cc.Button)
    PlayBtn: cc.Button = null;
    @property(cc.Button)
    PauseBtn: cc.Button = null;

    // 設定相關
    @property(cc.Node)
    SettingSheet: cc.Node = null;
    @property(cc.Button)
    SettingBtn: cc.Button = null; 
    @property(cc.Button)
    AttackKeyBtn: cc.Button = null; 
    @property(cc.Button)
    SpecialAttackKeyBtn: cc.Button = null; 
    @property(cc.Button)
    DashKeyBtn: cc.Button = null; 



    // 登入畫面相關
    @property(cc.Node)
    SignSheet: cc.Node = null;
    @property(cc.Label)
    SignTitle: cc.Label = null;
    @property(cc.Button)
    CloseSignBtn: cc.Button = null;
    @property(cc.Button)
    CloseSignBgBtn: cc.Button = null;
    // 按鈕
    @property(cc.Button)
    SwitchSignBtn: cc.Button = null;
    @property(cc.Button)
    SignInBtn: cc.Button = null;
    @property(cc.Button)
    SignUpBtn: cc.Button = null;
    // 輸入框
    @property(cc.EditBox)
    InputName: cc.EditBox = null;
    @property(cc.EditBox)
    InputEmail: cc.EditBox = null;
    @property(cc.EditBox)
    InputPassword: cc.EditBox = null;

    // 改名相關
    @property(cc.Label) 
    UserName: cc.Label = null
    @property(cc.Button)
    ChangeNameBtn: cc.Button = null; // 開啟改名
    @property(cc.Node)
    ChangeNameSheet: cc.Node = null;
    @property(cc.EditBox)
    InputNewName: cc.EditBox = null;
    @property(cc.Button)
    CloseChangeNameBtn: cc.Button = null;
    @property(cc.Button)
    ChangeNameConfirmBtn: cc.Button = null;
    @property(cc.Button)
    CloseChangeNameBgBtn: cc.Button = null;

    // 右側關卡
    @property(cc.Label) 
    NowStageName: cc.Label = null
    @property(cc.Label) 
    NowStageInfo: cc.Label = null
    @property(cc.Button) 
    LikeBtn: cc.Button = null
    @property(cc.Label) 
    LikeNumber: cc.Label = null
    @property(cc.Node)
    Stages: cc.Node = null;
    @property(cc.Button)
    Stage1Btn: cc.Button = null;
    @property(cc.Button)
    Stage2Btn: cc.Button = null;
    @property(cc.Button)
    Stage3Btn: cc.Button = null;
    @property(cc.Button)
    FakeStage1Btn: cc.Button = null;
    @property(cc.Button)
    FakeStage2Btn: cc.Button = null;
    @property(cc.Button)
    FakeStage3Btn: cc.Button = null;
    @property(cc.Button)
    FakeStage4Btn: cc.Button = null;
    @property(cc.Button)
    FakeStage5Btn: cc.Button = null;

    // 排行榜
    @property(cc.Node)
    RankSheet: cc.Node = null;
    @property(cc.Layout)
    RankContainer: cc.Layout = null;
    @property(cc.Button)
    CloseRankBtn: cc.Button = null;
    @property(cc.Button)
    CloseRankBgBtn: cc.Button = null;
    @property(cc.Prefab)
    RankRecordPrefab: cc.Prefab = null;
    @property(cc.Button)
    RankStage1Btn: cc.Button = null;
    @property(cc.Button)
    RankStage2Btn: cc.Button = null;
    @property(cc.Button)
    RankStage3Btn: cc.Button = null;
    @property(cc.Label)
    NowRank: cc.Label = null; // 發燒影片#



    // 判斷一般登入時，是否為登入(否則為註冊)
    private sign_in: boolean = true;

    // 判斷是否在更改按鍵
    private changing_key: boolean  = false;

    // 一些視窗比例問題
    public menu_list_hidden: boolean = true;
    public windows_ratio_w: number = 1;
    public windows_ratio_h: number = 1;

    // 判斷是否進入關卡
    public in_stage: boolean = false;

    // 判斷是否為全螢幕
    public full_screen: boolean = false;

    // 玩家排名
    public user_rank: number = 1;

    // 鍵位設置
    public attack_key = "J";
    public special_attack_key = "K";
    public dash_key = "L";
    public full_screen_key = "esc";

    public attack_key_code : number = 74;
    public dash_key_code : number = 75;
    public special_attack_key_code : number = 76;

    // 是否暫停
    public pause: boolean = false;

    // use to debug
    next_console: boolean = true;

    onload() {
        // this.MainCamera.getComponent(cc.Camera).backgroundColor.a = 0;
    }
    protected start () {
        // 抗鋸齒，但是好像沒甚麼用
        // cc.view.enableAntiAlias(false);
        // this.LogInBtn.normalSprite.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);

        // 綁定所有按紐
        this.bindAllBtn();

        // 某些按鈕會改變光標樣子
        this.changeHoverCursor();

        // 當滑鼠懸進入mainScene時，progress bar出現
        this.progressBarOn();

        // 當滑鼠懸浮在sound時，sound slider出現
        this.soundSliderOn();

        // 在開啟時登出原先帳號
        this.signOut();

        // 更新畫面比例
        this.updateRatio();

        // 如果用戶曾經修改過鍵位，登入時修改
        this.updateKey();


        // 如果menu start一秒後沒有開啟menu 且 非全螢幕，自動開啟menu
        //this.scheduleOnce(()=>{if(this.menu_list_hidden && !this.full_screen)this.menuListMove();}, 1);
    }

    protected update(dt: number) {
        // this.MainCamera.getComponent(cc.Camera).backgroundColor = cc.color(255,255,255, 0);
        // console.log(this.MainCamera.getComponent(cc.Camera).backgroundColor);
        // debug用
        this.consoleEveryHalfSecond();
        this.listenPause();
        // 讓progress bar每0.1秒增加一點
        this.timer();

        // 更新排行榜
        this.updateRank()

        // 更改音量
        this.updateVolume();
    }

    // debug用，每1秒輸出一次
    consoleEveryHalfSecond() {
        if(this.next_console) {
            this.next_console = false;
            this.scheduleOnce(()=>{
                // some console

                // console.log("width: "+cc.find("Canvas").width);
                // console.log("height: "+cc.find("Canvas").height);

                this.next_console = true;
            }, 1)
        }
    }

    listenPause() {
        if(!this.Player.player_stop) {
            if(this.pause)
                this.hideProgressBarList();
            this.startStage();
        }
        else {
            if(!this.pause)
                this.openProgressBarList();
            this.stopStage();
        }
    }

    // 更改音量
    updateVolume() {
        this.RickRoll.volume = this.SoundSlider.progress;
    }

    // todo: 增加實際用處
    stopStage() {
        this.PauseBtn.node.active = false;
        this.PlayBtn.node.active = true;
        this.pause = true; // 現在只能操縱進度條
        this.RickRoll.pause();
    }

    startStage() {
        this.PauseBtn.node.active = true;
        this.PlayBtn.node.active = false;
        this.pause = false; // 現在只能操縱進度條
        this.RickRoll.play();
    }

    // todo : 連結真的排行榜
    private rank_number = 1; // 目前放到第幾名
    private now_rank: string = "1";
    private rank_update_wait: boolean = false;  // 等待下次更新
    private rank_update_time: number = 0.5; // 每隔幾秒更新排行榜，更新時排行榜會有閃爍
    updateRank() {
        //  等待後從1開始重新instantiate排行榜
        if(this.rank_update_wait ) {
            this.scheduleOnce(()=>{this.rank_update_wait = false;}, this.rank_update_time);
            this.rank_number = 1;
            
            return;
        }
        else this.scheduleOnce(()=>{this.rank_update_wait = true;}, this.rank_update_time);
        

        this.NowRank.string = "發燒影片#" + this.user_rank.toString();
        let rank_data: Map<any, any>;
        firebase.database().ref('Rank').once('value',(snapshot)=>{
            if(this.rank_number == 1)
            for (let i in this.RankContainer.node.children)
                this.RankContainer.node.children[i].destroy();
            if(this.rank_number > 100) return;
            rank_data = snapshot.val()["Stage"+this.now_rank];
            for(let key in rank_data) {
                // console.log(rank_data[key].name);
                let record = cc.instantiate(this.RankRecordPrefab);
                record.getChildByName("Rank").getComponent(cc.Label).string = this.rank_number.toString();
                record.getChildByName("Name").getComponent(cc.Label).string = rank_data[key].name;
                record.getChildByName("Score").getComponent(cc.Label).string = rank_data[key].score;
                // this.scheduleOnce(()=>{record.destroy()}, this.rank_update_time);
                this.RankContainer.node.addChild(record);
                this.rank_number += 1;
            }
            while(this.rank_number <= 100) {
                let record = cc.instantiate(this.RankRecordPrefab);
                record.getChildByName("Rank").getComponent(cc.Label).string = this.rank_number.toString();
                // this.scheduleOnce(()=>{record.destroy()}, this.rank_update_time);
                this.RankContainer.node.addChild(record);
                this.rank_number += 1;
            }
        });
    }
    showRank1() {
        this.now_rank = "1";
    }
    showRank2() {
        this.now_rank = "2";
    }
    showRank3() {
        this.now_rank = "3";
    }

    // todo: 配合關卡
    // 讓progress bar每0.1秒增加一點，順便輸出目前音量
    private wait: boolean = true;
    private stage_time = 180;
    timer() {
        // console.log(this.GameManager);
        let time1 = this.GameManager.time, time2 = this.stage_time;
        this.ProgressBar.progress = time1/time2;
        let minute1 = (time1>=600)? Math.floor(time1/60).toString() : "0"+Math.floor(time1/60).toString();
        let second1 = (time1%60>=10)? Math.floor(time1%60).toString() : "0"+Math.floor(time1%60).toString();
        let minute2 = (time2>=600)? Math.floor(time2/60).toString() : "0"+Math.floor(time2/60).toString();
        let second2 = (time2%60>=10)? Math.floor(time2%60).toString() : "0"+Math.floor(time2%60).toString();
        this.Time.getComponentInChildren(cc.Label).string = minute1+":"+second1+"/"+minute2+":"+second2;

        // if(this.RickRoll.node.active) {
        //     this.ProgressBar.progress = this.RickRoll.currentTime/34;
        // }
    }

    // todo : 增加/減少按鍵、增加其他功能，配合實際使用
    // 更改按鍵
    changeAttackKey() {
        if(this.changing_key) return;
        else this.changing_key = true;
        this.AttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = "";
        cc.systemEvent.once(cc.SystemEvent.EventType.KEY_DOWN, (e)=>{
            if(!this.changing_key) return;
            else this.changing_key = false;
            if(e.keyCode >= cc.macro.KEY.a && e.keyCode <= cc.macro.KEY.z){
                this.attack_key = String.fromCharCode(e.keyCode);
                this.attack_key_code = e.keyCode;
            }
            this.AttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.attack_key;
            if(firebase.auth().currentUser) {
                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                    firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update(
                        {
                            attackKey: this.attack_key,
                            attack_code : this.attack_key_code,
                            specialAttackKey: this.special_attack_key, 
                            specialAttack_code : this.special_attack_key_code,
                            dashKey:this.dash_key, 
                            dash_code : this.dash_key_code
                        }
                    )
                })
            }
        });
    }
    changeSpecialAttackKey() {
        if(this.changing_key) return;
        else this.changing_key = true;
        this.SpecialAttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = "";
        cc.systemEvent.once(cc.SystemEvent.EventType.KEY_DOWN,(e)=>{
            if(!this.changing_key) return;
            else this.changing_key = false;

            if(e.keyCode >= cc.macro.KEY.a && e.keyCode <= cc.macro.KEY.z){
                this.special_attack_key = String.fromCharCode(e.keyCode);
                this.special_attack_key_code = e.keyCode;
            }
            this.SpecialAttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.special_attack_key;

            if(firebase.auth().currentUser) {
                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                    firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update(
                        {
                            attackKey: this.attack_key,
                            attack_code : this.attack_key_code,
                            specialAttackKey: this.special_attack_key, 
                            specialAttack_code : this.special_attack_key_code,
                            dashKey:this.dash_key, 
                            dash_code : this.dash_key_code
                        }
                    )
                })
            }
        });
    }
    changeDashKey() {
        if(this.changing_key) return;
        else this.changing_key = true;
        this.DashKeyBtn.getComponentsInChildren(cc.Label)[0].string = "";
        cc.systemEvent.once(cc.SystemEvent.EventType.KEY_DOWN,(e)=>{
            if(!this.changing_key) return;
            else this.changing_key = false;

            if(e.keyCode >= cc.macro.KEY.a && e.keyCode <= cc.macro.KEY.z){
                this.dash_key = String.fromCharCode(e.keyCode);
                this.dash_key_code = e.keyCode;
            }
            this.DashKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.dash_key;
            if(firebase.auth().currentUser) {
                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                    firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update(
                        {
                            attackKey: this.attack_key,
                            attack_code : this.attack_key_code,
                            specialAttackKey: this.special_attack_key, 
                            specialAttack_code : this.special_attack_key_code,
                            dashKey:this.dash_key, 
                            dash_code : this.dash_key_code
                        }
                    )
                })
            }
        });
    }


    
    // todo :　更改至實際鍵位
    updateKey() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                var uid = user.uid;
                if(uid) {
                    firebase.database().ref('userList/'+uid).once('value',(snapshot)=>{
                        // menulist 上方顯示的名稱
                        this.UserName.string = "名稱: " + snapshot.val().name;

                        this.attack_key = snapshot.val().attackKey;
                        this.special_attack_key = snapshot.val().specialAttackKey;
                        this.dash_key = snapshot.val().dashKey;
                        this.AttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.attack_key;
                        this.SpecialAttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.special_attack_key;
                        this.DashKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.dash_key;
                    })
                }
            } else {
                // User is signed out
                // ...
            }
        });
        
    }

    // todo: 不太重要的功能
    changePhoto() {

    }

    // 從全螢幕恢復
    zoomOut() {
        this.full_screen = false;

        // this.MainScene.x = -145;
        // this.MainScene.y = 20;
        // this.MainScene.scaleX = 1;
        // this.MainScene.scaleY = 1;


        // this.UICameraProgressBar.x = -200;
        // this.UICameraProgressBar.y = 20;
        // this.UICameraProgressBar.scaleX = 1;
        // this.UICameraProgressBar.scaleY = 1;


        this.FullScreenBtn.node.active = true;
        this.ZoomOutBtn.node.active = false;

        cc.game.canvas.style.cursor = "default";
    }

    // todo : 增加實際遊玩關卡
    // 將遊戲畫面放大到全螢幕
    fullScreen() {

        if(this.RickRoll.node.active) {
            this.RickRoll.isFullscreen = true;
            return;
        }

        let m = this;
        function zoomOutIfEsc(e) {
            if(e.keyCode == cc.macro.KEY.escape)
                m.zoomOut();
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, zoomOutIfEsc, this.node);
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,zoomOutIfEsc, this.node);

        this.full_screen = true;
        
        // this.UICameraProgressBar.x = 0;
        // this.UICameraProgressBar.y = 0;
        // this.UICameraProgressBar.scaleX = 1280/this.MainScene.width;
        // this.UICameraProgressBar.scaleY = 720/this.MainScene.height;

        // this.MainScene.x = 0;
        // this.MainScene.y = 0;
        // this.MainScene.scaleX = 1280/this.MainScene.width;
        // this.MainScene.scaleY = 720/this.MainScene.height;

        this.FullScreenBtn.node.active = false;
        this.ZoomOutBtn.node.active = true;
        // console.log(this.MainCamera.rect.y);

        cc.game.canvas.style.cursor = "default";
    }

    progressBarOn() {

        // 開啟progressBar
        this.MainSceneArea.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            if(this.pause) return; 
            // 全螢幕時非在progressBar，就讓progressBar縮起來
            if(!this.full_screen)
                this.openProgressBarList();
            else 
                this.hideProgressBarList();
        }, this.ProgressBarList);

        // 全螢幕時在progressBar，就讓progressBar出現
        this.ProgressBarArea.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            if(this.pause) return; 
            if(!this.full_screen) {
                this.openProgressBarList();
            }
        }, this.ProgressBarList);

        // 關閉progressBar，順便關設定
        this.Background.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            if(this.pause) return; 
            this.hideProgressBarList();
        }, this.ProgressBarList);
        this.Background2.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            if(this.pause) return; 
            this.hideProgressBarList();
        }, this.ProgressBarList);
    }
    hideProgressBarList() {
        // this.ProgressBarList.y = -40;
        cc.tween(this.ProgressBarList).to(0.2, {position: cc.v3(0, -40, 0)}).start();
        if(this.SettingSheet.active) {
            this.SettingSheet.active = false;
            this.changing_key = false;
            this.AttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.attack_key;
            this.SpecialAttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.special_attack_key;
            this.DashKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.dash_key;
        }
    }
    openProgressBarList() {
        // this.ProgressBarList.y = -5;
        cc.tween(this.ProgressBarList).to(0.2, {position: cc.v3(0, -5, 0)}).start();
    }

    // 滑鼠懸浮在sound時，time右移，讓sound slider出現
    soundSliderOn() {
        // time右移，sound slider出現
        this.Sound.node.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            cc.tween(this.Time).to(0.2, {position: cc.v3(-210, 0, 0)}).start();
        }, this.Sound.node);
        this.SoundSlider.node.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            cc.tween(this.Time).to(0.2, {position: cc.v3(-210, 0, 0)}).start();
        }, this.Sound.node);

        // time左移，sound slider被蓋住
        this.Background2.on(cc.Node.EventType.MOUSE_ENTER,()=>{
            cc.tween(this.Time).to(0.2, {position: cc.v3(-275, 0, 0)}).start();
        }, this.Sound.node);
        this.ProgressBarArea.on(cc.Node.EventType.MOUSE_LEAVE,()=>{
            cc.tween(this.Time).to(0.2, {position: cc.v3(-275, 0, 0)}).start();
        }, this.Sound.node);
    }



    // 開關排行榜
    openRank() {
        this.RankSheet.active = true;
        this.CloseRankBgBtn.node.active = true;
    }
    closeRank() {
        this.RankSheet.active = false;
        this.CloseRankBgBtn.node.active = false;
    }

    // todo
    stage1() {
        if(this.in_stage) return; // 已經在某一關的話就不執行
        this.RickRoll.node.active = false;
        this.NowStageName.string = "Stage1";
        // this.GameManager.boss.boss_name = "Boss1";
        // this.NowStageInfo.string = "";
    }
    // todo
    stage2() {
        if(this.in_stage) return;// 已經在某一關的話就不執行
        this.RickRoll.node.active = false;
        this.NowStageName.string = "Stage2";
        // this.GameManager.boss.boss_name = "Boss2";
        // this.NowStageInfo.string = "";
    }
    // todo
    stage3() {
        if(this.in_stage) return;// 已經在某一關的話就不執行
        this.RickRoll.node.active = false;
        this.NowStageName.string = "Stage3";
        // this.GameManager.boss.boss_name = "Boss3";
        // this.NowStageInfo.string = "";
    }

    fakeStage() {
        this.pause = false;
        if(this.in_stage) return;// 已經在某一關的話就不執行

        if(this.PlayBtn.node.active) { 
            // 調整進度條下的播放/暫停按鈕
            this.PlayBtn.node.active = false;
            this.PauseBtn.node.active = true;
        }
        this.RickRoll.node.active = true;
        this.ProgressBar.progress = 0;
        this.SoundSlider.progress = 0.5; // 音量調成一半
        if(this.RickRoll.isPlaying) {
            // 從頭播放
            this.RickRoll.stop(); 
            this.scheduleOnce(()=>{this.RickRoll.play();}, 0.1);
            // this.RickRoll.play();
        }
        this.NowStageName.string = "Rick Astley - Never Gonna Give You Up (Official Music Video)";
        this.NowStageInfo.string = "觀看次數: 1,228,531,093次 2009年10月25日"
    }

    changeLikeColor() {
        let r = (Math.random() * 255);
        let g = (Math.random() * 255);
        let b = (Math.random() * 255);
        this.LikeBtn.normalColor = cc.color(r, g, b);
        this.LikeBtn.hoverColor = cc.color(r, g, b);
        this.LikeBtn.pressedColor = cc.color(r, g, b);
        // console.log(r, g, b);
        // console.log(this.LikeBtn.node.color);
        // Math.random
    }

    // 開啟改名
    openChangeName() {
        this.ChangeNameSheet.active = true;
        this.CloseChangeNameBgBtn.node.active = true;
    }

    // 關閉改名
    closeChangeName() {
        this.ChangeNameSheet.active = false;
        this.CloseChangeNameBgBtn.node.active = false;
    }

    // 輸入新名字
    changeName() {
        let new_name = this.InputNewName.string;
        if(firebase.auth().currentUser.uid) {
            firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update(
                {
                    name: new_name
                }
            );
            this.UserName.string = "名稱: " + new_name;
            this.closeChangeName();
        } else {
            alert("You haven't log in");
        }
    }

    // 開關設定畫面
    openSetting() {
        if(this.SettingSheet.active) {
            this.changing_key = false;
        }
        this.SettingSheet.active = !this.SettingSheet.active;
    }

    // 切換未登入/以登入畫面
    changeScene() {
        // 切換菜單列
        this.MenuTitle.active = !this.MenuTitle.active;
        this.LogInBtn.node.active = !this.LogInBtn.node.active;
        this.GoogleLogInBtn.node.active = !this.GoogleLogInBtn.node.active;
        this.LogInBtn2.node.active = !this.LogInBtn2.node.active;

        this.UserName.node.active = !this.UserName.node.active;
        this.ChangeNameBtn.node.active = !this.ChangeNameBtn.node.active;
        this.ChangePhotoBtn.node.active = !this.ChangePhotoBtn.node.active;
        this.SignOutBtn.node.active = !this.SignOutBtn.node.active;
        this.RankBtn.node.active = !this.RankBtn.node.active;

        if(this.LogInBtn.node.active) {
            this.LikeBtn.node.x = 30
        } else {
            this.LikeBtn.node.x = -90;
        }
            

        // 更換背景
        this.Background2.active = !this.Background2.active;
        this.Background2.x = 1280;
        this.Background2.y = 720;
    }

    // 登出
    signOut() {
        if(this.SignOutBtn.node.active == true)
            this.changeScene();
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
            alert(error.message);
        });
          
    }

    // 登入
    signIn() {
        let menu = this;

        let email = this.InputEmail.string;
        let password = this.InputPassword.string;

        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            // console.log(userCredential);

            // 更改鍵位
            if(firebase.auth().currentUser.uid) {
                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                    this.attack_key = snapshot.val().attackKey;
                    this.special_attack_key = snapshot.val().specialAttackKey;
                    this.dash_key = snapshot.val().dashKey;
                    this.AttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.attack_key;
                    this.SpecialAttackKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.special_attack_key;
                    this.DashKeyBtn.getComponentsInChildren(cc.Label)[0].string = this.dash_key;
                })
            }

            // 關閉登入表單後更換一大堆東西
            menu.closeSign(); 
            menu.changeScene();
            })
        .catch((error) => {
            // let errorCode = error.code;
            let errorMessage = error.message;

            alert(errorMessage);

            });

    }

    // 註冊
    signUp() {
        let menu = this;

        let email = this.InputEmail.string;
        let password = this.InputPassword.string;
        let name = this.InputName.string;

        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // let user = userCredential.user;
            // console.log("sign up, user:" +userCredential.user);
            // console.log("signup success");

            let userData = {
            name: name,
            email: email,
            attackKey: this.attack_key,
            attack_code : this.attack_key_code,
            specialAttackKey: this.special_attack_key, 
            specialAttack_code : this.special_attack_key_code,
            dashKey:this.dash_key, 
            dash_code : this.dash_key_code,
            stage_1 : 0,
            stage_2 : 0,
            stage_3 : 0
            };
            firebase.database().ref('userList').child(userCredential.user.uid).set(userData);

            // 關閉登入表單後更換一大堆東西
            menu.closeSign();
            menu.changeScene();
        })
        .catch((error) => { 
            let errorMessage = error.message;
            alert(errorMessage);
            // console.log(errorMessage);
        });

    }

    // google 登入
    googleLogIn() {
        let menu = this;
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
          .then(function (result) {
            let user = result.user; 
            // console.log(user);
            
            // 將基本資料放到 realtime database
            let userData = {
                name: result.user.displayName,
                email: result.user.email,
                attackKey: menu.attack_key,
                attack_code : menu.attack_key_code,
                specialAttackKey: menu.special_attack_key, 
                specialAttack_code : menu.special_attack_key_code,
                dashKey:menu.dash_key, 
                dash_code : menu.dash_key_code,
                stage_1 : 0,
                stage_2 : 0,
                stage_3 : 0
            };
            firebase.database().ref('userList').child(user.uid).set(userData);

            // 切換菜單列
            menu.changeScene();
          }) 
          .catch(function (error) {
            var errorMessage = error.message;
            // let email = error.email;
            // let credential = error.credential;
            alert(errorMessage);
            // console.log(errorMessage);
          });
    }

    // 更換登入/註冊畫面
    switchSign() {
        if(this.sign_in) {
            this.sign_in = false;
            this.SignTitle.string = "註冊";
            this.SignInBtn.node.active = false;
            this.SignUpBtn.node.active = true;
            this.InputName.node.active = true;
        } else {
            this.sign_in = true;
            this.SignTitle.string = "登入";
            this.SignInBtn.node.active = true;
            this.SignUpBtn.node.active = false;
            this.InputName.node.active = false;
        }
    }

    // 打開登入畫面
    LogIn() {
        this.SignSheet.active = true;
        this.CloseSignBgBtn.node.active = true;

        // 初始為登入
        this.sign_in = true;
        this.SignTitle.string = "登入";
        this.InputName.node.active = false;
        this.SignInBtn.node.active = true;
        this.SignUpBtn.node.active = false;
    }

    // 關閉登入畫面
    closeSign() {
        this.SignSheet.active = false;
        this.CloseSignBgBtn.node.active = false;    
    }

    // 在不同視窗大小下調整比例
    updateRatio() {
        this.windows_ratio_w = cc.find("Canvas").width/1280;
        if(this.windows_ratio_w != 1) {
            this.node.scaleX = this.windows_ratio_w;
        }
        this.windows_ratio_h = cc.find("Canvas").height/720; 
        // console.log("cc.find(Canvas).height1: " + cc.find("Canvas").height);
        if(this.windows_ratio_h != 1) {
            this.node.scaleY = this.windows_ratio_h;
        }
    }

    // 開啟/關閉菜單列
    menuListMove() {
        if(this.RickRoll.node.active && this.menu_list_hidden) return; // rickroll時不要分心(其實是videoplayer只會在最上層，所以會蓋住menulist)
        if(this.menu_list_hidden) {
            // 將菜單列從左側叫出來
            cc.tween(this.MenuList).to(0.2, {position: cc.v3(-560, 0, 0)}).start();
            this.MenuList.active = true;
            this.menu_list_hidden = false;
            // 菜單列完整打開後，開啟CloseMenuBgBtn
            this.scheduleOnce(()=>{this.CloseMenuBgBtn.node.active = true;if(this.RickRoll.node.active) return;}, 0.2);
        } else {
            // 將菜單列放回左側
            cc.tween(this.MenuList).to(0.2, {position: cc.v3(-720, 0, 0)}).start();
            this.CloseMenuBgBtn.node.active = false;
            this.menu_list_hidden = true;
            this.scheduleOnce(()=>{this.MenuList.active = false;}, 0.2);
        }
    }

    changeHoverCursor() {
        // 滑鼠懸浮時更改滑鼠為pointer
        // todo : 增加後續新增node
        this.mouseOn(this.OpenMenuBtn.node);
        this.mouseOn(this.CloseMenuBtn.node);
        this.mouseOn(this.SettingBtn.node);
        this.mouseOn(this.LogInBtn.node);
        this.mouseOn(this.LogInBtn2.node);
        this.mouseOn(this.GoogleLogInBtn.node);

        this.mouseOn(this.ChangeNameBtn.node);
        this.mouseOn(this.ChangePhotoBtn.node);
        this.mouseOn(this.SignOutBtn.node);
        this.mouseOn(this.RankBtn.node);

        this.mouseOn(this.CloseSignBtn.node);
        this.mouseOn(this.SignInBtn.node);
        this.mouseOn(this.SignOutBtn.node);
        this.mouseOn(this.SwitchSignBtn.node);

        this.mouseOn(this.CloseChangeNameBtn.node);
        this.mouseOn(this.ChangeNameConfirmBtn.node);

        this.mouseOn(this.Sound.node);
        this.mouseOn(this.SoundSlider.node);
        this.mouseOn(this.SoundSliderHandle);

        this.mouseOn(this.SettingBtn.node);
        this.mouseOn(this.FullScreenBtn.node);
        this.mouseOn(this.ZoomOutBtn.node);

        this.mouseOn(this.PlayBtn.node);
        this.mouseOn(this.PauseBtn.node);

        this.mouseOn(this.Stage1Btn.node);
        this.mouseOn(this.Stage2Btn.node);
        this.mouseOn(this.Stage3Btn.node);
        this.mouseOn(this.FakeStage1Btn.node);
        this.mouseOn(this.FakeStage2Btn.node);
        this.mouseOn(this.FakeStage3Btn.node);
        this.mouseOn(this.FakeStage4Btn.node);
        this.mouseOn(this.FakeStage5Btn.node);
        this.mouseOn(this.LikeBtn.node);

        this.mouseOn(this.RankStage1Btn.node);
        this.mouseOn(this.RankStage2Btn.node);
        this.mouseOn(this.RankStage3Btn.node);
        this.mouseOn(this.CloseRankBtn.node);

    }

    // 在滑鼠放到node上時將其改為pointer
    mouseOn(target: cc.Node) {
        target.on(cc.Node.EventType.MOUSE_ENTER,()=>{cc.game.canvas.style.cursor = "pointer";}, target);
        target.on(cc.Node.EventType.MOUSE_LEAVE,()=>{cc.game.canvas.style.cursor = "default";}, target);
    }

    bindAllBtn() {
        // 打開/關閉菜單列
        // CloseMenuBgBtn是放在菜單列後方覆蓋全背景的按鈕，效果為點擊時關閉菜單列
        this.bindBtn(this.node, "Menu", "menuListMove", this.OpenMenuBtn);
        this.bindBtn(this.node, "Menu", "menuListMove", this.CloseMenuBtn);
        this.bindBtn(this.node, "Menu", "menuListMove", this.CloseMenuBgBtn);

        // 登入方式
        // google登入會直接跳出登入頁面，一般登入可以選擇登入或註冊
        this.bindBtn(this.node, "Menu", "googleLogIn", this.GoogleLogInBtn);
        this.bindBtn(this.node, "Menu", "LogIn", this.LogInBtn);
        this.bindBtn(this.node, "Menu", "LogIn", this.LogInBtn2);

        this.bindBtn(this.node, "Menu", "switchSign", this.SwitchSignBtn);
        this.bindBtn(this.node, "Menu", "signIn", this.SignInBtn);
        this.bindBtn(this.node, "Menu", "signUp", this.SignUpBtn);

        this.bindBtn(this.node, "Menu", "signOut", this.SignOutBtn);

        // 關閉一般登入的畫面
        // CloseSignBgBtn是放在登入畫面後方覆蓋全背景的按鈕，效果為點擊時關閉登入畫面
        this.bindBtn(this.node, "Menu", "closeSign", this.CloseSignBtn);
        this.bindBtn(this.node, "Menu", "closeSign", this.CloseSignBgBtn);

        // 開關設定畫面
        this.bindBtn(this.node, "Menu", "openSetting", this.SettingBtn);
        this.bindBtn(this.node, "Menu", "changeAttackKey", this.AttackKeyBtn);
        this.bindBtn(this.node, "Menu", "changeSpecialAttackKey", this.SpecialAttackKeyBtn);
        this.bindBtn(this.node, "Menu", "changeDashKey", this.DashKeyBtn);

        // 改名
        this.bindBtn(this.node, "Menu", "openChangeName", this.ChangeNameBtn);
        this.bindBtn(this.node, "Menu", "closeChangeName", this.CloseChangeNameBtn);
        this.bindBtn(this.node, "Menu", "closeChangeName", this.CloseChangeNameBgBtn);
        this.bindBtn(this.node, "Menu", "changeName", this.ChangeNameConfirmBtn);

        this.bindBtn(this.node, "Menu", "changePhoto", this.ChangePhotoBtn);

        // 進入/退出全螢幕
        this.bindBtn(this.node, "Menu", "fullScreen", this.FullScreenBtn);
        this.bindBtn(this.node, "Menu", "zoomOut", this.ZoomOutBtn);

        // 開始關卡/暫停關卡
        // 暫時讓按按鈕時不會觸發
        // this.bindBtn(this.node, "Menu", "startStage", this.PlayBtn);
        // this.bindBtn(this.node, "Menu", "stopStage", this.PauseBtn);

        // 選擇關卡
        this.bindBtn(this.node, "Menu", "stage1", this.Stage1Btn);
        this.bindBtn(this.node, "Menu", "stage2", this.Stage2Btn);
        this.bindBtn(this.node, "Menu", "stage3", this.Stage3Btn);

        this.bindBtn(this.node, "Menu", "fakeStage", this.FakeStage1Btn);
        this.bindBtn(this.node, "Menu", "fakeStage", this.FakeStage2Btn);
        this.bindBtn(this.node, "Menu", "fakeStage", this.FakeStage3Btn);
        this.bindBtn(this.node, "Menu", "fakeStage", this.FakeStage4Btn);
        this.bindBtn(this.node, "Menu", "fakeStage", this.FakeStage5Btn);

        // 點讚
        this.bindBtn(this.node, "Menu", "changeLikeColor", this.LikeBtn);

        // 排行榜 
        this.bindBtn(this.node, "Menu", "showRank1", this.RankStage1Btn);
        this.bindBtn(this.node, "Menu", "showRank2", this.RankStage2Btn);
        this.bindBtn(this.node, "Menu", "showRank3", this.RankStage3Btn);
        this.bindBtn(this.node, "Menu", "openRank", this.RankBtn);
        this.bindBtn(this.node, "Menu", "closeRank", this.CloseRankBtn);
        this.bindBtn(this.node, "Menu", "closeRank", this.CloseRankBgBtn);
    }

    // 動態綁定按鈕
    bindBtn(target:cc.Node,component:string, handler:string, btn:cc.Button) {
        let btn_handler = new cc.Component.EventHandler();
        btn_handler.target = target;
        btn_handler.component = component;
        btn_handler.handler = handler;
        btn.clickEvents.push(btn_handler);
    }
}
