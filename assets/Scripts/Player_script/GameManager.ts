import Player from "./Player";
import Boss_1 from "../Boss_script/Boss"
import ProjectileSystem from "../Boss_script/ProjectileSystem"
import Menu from "../Menu_script/Menu"
import EndingDisplaySystem from "../Boss_script/EndingDisplaySystem"
const { ccclass, property } = cc._decorator;
declare const firebase: any;

@ccclass
export default class GameManager extends cc.Component {

    @property(cc.Camera)
    Camera: cc.Camera = null;

    @property(cc.Node)
    UICamera: cc.Node = null;

    @property(Player)
    Player: Player = null;

    @property(cc.Node)
    Boss: cc.Node = null;

    @property(cc.Node)
    Bullet : cc.Node = null;

    @property(EndingDisplaySystem)
    EndingDisplaySystem: EndingDisplaySystem = null;

    @property(cc.Sprite)
    Background: cc.Sprite = null;

    @property(cc.Node)
    ComboUI: cc.Node = null;

    @property(cc.Node)
    ScoreUI: cc.Node = null;
    @property(Menu)
    Menu: Menu = null;

    // modify keycode
    public attack_key : number = 74;
    public dash_key : number = 75;
    public special_attack_key : number = 76;

    vibrationAmplitude: number = 2.7;
    vibrationTime: number = 0.02
    boss : Boss_1 = null;
    bullet : ProjectileSystem = null;
    isUsingCameraAnimation: boolean = false;
    // test
    public evitable : boolean = false;

    onKeyDown(event){
        if(event.keyCode === cc.macro.KEY["+"]){
            this.evitable = true;
        }
        else if(event.keyCode == cc.macro.KEY.Delete){
            this.Player.invisibleTime = 59;
            this.evitable = false;
        }
    }



    start() {
        this.load_key();
        this.start_record();
        this.Player.player_stop = true;
        this.Player._playerState = this.Player.playerState.startAnimation;
    }

    // ************************************* implementation for key_load *****************************//

    load_key(){
        this.schedule(()=>{
            if(firebase.auth().currentUser){
                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                    this.attack_key = snapshot.val().attack_code;
                    this.special_attack_key = snapshot.val().specialAttack_code;
                    this.dash_key = snapshot.val().dash_code;
                })
            }
            
        },5);
    }

    // ************************************* implementation for key_load *****************************//

    // ************************************* implementation for rewind *****************************//

    onLoad() {
        // test
        this.Player.player_stop = true;
        this.Player._playerState = this.Player.playerState.startAnimation;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // test
        cc.dynamicAtlasManager.enabled = false;
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, 0);
        this.boss = this.Boss.getComponent(Boss_1);
        this.bullet = this.Bullet.getComponent(ProjectileSystem);
        this.time = 0;
        // console.log(this.bullet);
        if(!firebase.auth().currentUser){
            alert("Sign in to have best experience");
        }
        // console.log(this.boss);
        for(var i = 0 ; i < 50 ; i++){
            this.bullet_record_data[i] = new Map<string,Bullet_RecordBuffer>();  // we first set 50 record buffer , it not enough there's still room for space
            this.score_record[i] = new Array<number>();
        }
    }

    /********* !important    **********/
    public time : number = 0; // playing time
    public player_paused : boolean = false;
    /********* !important    **********/

    projectile_node : cc.Node = null;
    boss_node : cc.Node = null;
    player_node : cc.Node = null;
    boss_node_get : cc.Node = null;
    counter : number = 0; // for the use of what stage it is -> if record_rewind is trigger -> +1
    cursor : number = 0; // cursor is for the index of record // record_data[counter][cursor]
    
    last_rewind_time : Array<number> = new Array<number>(); // the final of record_data[counter][x] (the array of x)
    player_record_data : Array<RecordBuffer> = new Array<RecordBuffer>();
    boss_record_data : Array<Boss_RecordBuffer> = new Array<Boss_RecordBuffer>();
    bullet_record_data : Array<Map<string,Bullet_RecordBuffer>> = new Array<Map<string,Bullet_RecordBuffer>>();
    score_record : Array<Array<number>> = new Array<Array<number>>(); 

    // uuids
    player_uuid : string = "";
    boss_uuid : string = "";
    // rewind parameter
    rewind_once : boolean = false;
    public is_rewind : boolean = false;
    private show_ending : boolean = false;
    // load the key instructions from firebase


    start_record(){
        
        this.projectile_node = cc.find("Canvas/Menu/MainScene/Environment/Projectiles");
        this.player_node = cc.find("Canvas/Menu/MainScene/Environment/Player");
        this.boss_node = cc.find("Canvas/Menu/MainScene/Environment/Boss");
        this.player_uuid = this.player_node.uuid;
        this.boss_uuid = this.boss_node.uuid;

        this.schedule(()=>{
            if(!this.is_rewind && !this.Player.player_stop){
                // record the player's status
                //console.log(this.Player.node.uuid);
                let player_buffer = this.player_record_data[this.counter];
                if(!player_buffer){
                    this.player_record_data[this.counter] = new RecordBuffer();
                }
                if(player_buffer){
                    player_buffer.push(new RecordItem(this.player_node.getComponent(cc.RigidBody) , this.player_node ));
                }
                
                // record the boss status
                let boss_buffer = this.boss_record_data[this.counter];
                if(!boss_buffer){
                    this.boss_record_data[this.counter] = new Boss_RecordBuffer();
                }
                if(boss_buffer){
                    boss_buffer.push(new Boss_RecordItem(this.boss_node , this.boss ));
                }
                // record score 
                let score_buffer = this.score_record[this.counter];
                if(!score_buffer){
                    score_buffer = new Array<number>;
                }
                else{
                    score_buffer.push(this.Player.score);
                }
                // record the projectile status
                for(const arr of this.projectile_node.children){
                    if(arr.children.length != 0){
                        for(const child of arr.children){
                            if(child.x > -640 && child.x < 640 && child.y > -360 && child.y < 360 && child.active){
                                let bullet_buffer = this.bullet_record_data[this.counter].get(child.uuid);
                                if(!bullet_buffer){
                                    this.bullet_record_data[this.counter].set(child.uuid , new Bullet_RecordBuffer());
                                }
                                else{
                                    bullet_buffer.push(new Bullet_RecordItem( child, this.time ));
                                }
                            }
                        }
                    }
                }
                this.cursor += 1;
                this.last_rewind_time[this.counter] = this.cursor;
                this.time += 0.2;

            }
        },0.2);
    }

    time_modified : boolean = false; // for time deduct after rewind

    one_time_rewind(){
        this.is_rewind = true; 
        this.time_modified = false;
        // make the type of object
        cc.director.getCollisionManager().enabled = false;
        // console.log("one time rewind" , this.last_rewind_time[this.counter]);
        this.Player.startRewind(this.last_rewind_time[this.counter]/120);
        //console.log(this.last_rewind_time[this.counter]/60);
        if(this.cursor == 0 && this.counter > 0){
            this.cursor = this.last_rewind_time[--this.counter];
        }
    }

    time_modify(){
        // after rewind we set our time to the correct one
        if(!this.time_modified){
            this.time -= 0.2 * this.last_rewind_time[this.counter];
            this.time_modified = true;
        }
    }

    next_section(){
        // the function helped us to jump to next section as we make a command for record and turn the request to false
        // console.log("recorded_data");
        this.Player.rewind_record = false;
        this.last_rewind_time[this.counter] = this.cursor;
        this.counter += 1;
        this.cursor = 0;
    }

    update(dt) {
        // test
        if(this.evitable) this.Player.invisibleTime = 0;
        // test
        this.boss.bgm_volume = this.Menu.SoundSlider.progress;
        this.boss.sfx_volume = this.Menu.SoundSlider.progress;

        if(this.time >= 180 && !this.show_ending){
            // console.log("hi");
            this.show_ending = true;
            this.Player._playerState = this.Player.playerState.specialAttack;
            this.EndingDisplaySystem.callEnding(this.Player.score , this.boss.boss_name);
            if(firebase.auth().currentUser){
                var past_best;
                if(this.boss.boss_name == "Boss1"){
                    firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                        past_best = snapshot.val().stage_1;
                        this.scheduleOnce(()=>{
                            if(this.Player.score > past_best){
                                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                                    firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update({
                                        stage_1: this.Player.score
                                        }
                                    )
                                })
                            }
                        },1);
                    })
                }
                else if(this.boss.boss_name == "Boss2"){
                    firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                        past_best = snapshot.val().stage_2;
                        this.scheduleOnce(()=>{
                            if(this.Player.score > past_best){
                                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                                    firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update({
                                        stage_2: this.Player.score
                                        }
                                    )
                                })
                            }
                        },1);
                    })
                }
                else if(this.boss.boss_name == "Boss3"){
                    firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                        past_best = snapshot.val().stage_3;
                        this.scheduleOnce(()=>{
                            if(this.Player.score > past_best){
                                firebase.database().ref('userList/'+firebase.auth().currentUser.uid).once('value',(snapshot)=>{
                                    firebase.database().ref('userList').child(firebase.auth().currentUser.uid).update({
                                        stage_3: this.Player.score
                                        }
                                    )
                                })
                            }
                        },1);
                    })
                }
            }
        }
        this.cameraControl();
        this.player_paused = this.Player.player_stop;
        this.boss.boss_stop = this.Player.player_stop;
        this.bullet.projectile_pause = this.Player.player_stop;
        // pop all thing when rewind also pause the music
        if(this.is_rewind){
            for(const uuid of Array.from(this.bullet_record_data[this.counter].keys())){
                // player rewind
                // console.log(uuid);
                for(const arr of this.projectile_node.children){
                    if(arr.children.length != 0){
                        for(const child of arr.children){
                            if(child.uuid == uuid){
                                var bullet_buffer = this.bullet_record_data[this.counter].get(uuid);
                                if(bullet_buffer && bullet_buffer.length > 0){
                                    const item = bullet_buffer.pop();
                                    if(item.record_time > this.time - this.last_rewind_time[this.counter]){
                                        Bullet_RecordItem.RewindData(child,item);
                                        this.scheduleOnce(()=>{
                                            child.active = false;
                                        },0.03);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            var player_buffer = this.player_record_data[this.counter];
            if(player_buffer && player_buffer.length > 0){
                const item  = player_buffer.pop();
                RecordItem.RewindData(this.player_node ,this.player_node.getComponent(cc.RigidBody) ,item);
                if(player_buffer.length == 0){
                    // after rewinding , set the screen to pause
                    this.is_rewind = false;
                    this.time_modify();
                    this.cursor = 0;
                    this.bullet.projectile_kill = true;
                    this.scheduleOnce(()=>{
                        this.bullet.projectile_kill = false;
                    },2);
                    // console.log("end the rewind");
                }
            }

            var boss_buffer = this.boss_record_data[this.counter];
            if(boss_buffer && boss_buffer.length > 0){
                const item  = boss_buffer.pop();
                Boss_RecordItem.RewindData(this.boss_node , this.boss ,item);
            }

            // score rewind
            var score_buffer = this.score_record[this.counter];
            if(score_buffer && score_buffer.length > 0){
                var cur_score = score_buffer.pop();
                // console.log(cur_score);
                this.Player.score = cur_score;
            }
        }
        // if player make the request to create record fulfill it
        else{
            if(this.Player.rewind_record){
                this.next_section();
            }
        }
    }


    // ************************************* implementation for rewind *****************************//

    undo_ending(){
        if(this.boss.boss_name == "Boss1"){
            this.boss.boss_name = "Boss1";
            cc.director.loadScene("Boss_scene_1");
        }
        else if(this.boss.boss_name == "Boss2"){
            this.boss.boss_name = "Boss2";
            cc.director.loadScene("Boss_scene_2");
        }
        else{   
            this.boss.boss_name = "Boss3";
            cc.director.loadScene("Boss_scene_3");
        }
    }

    call_next_stage(){
        if(this.boss.boss_name == "Boss1"){
            this.boss.boss_name = "Boss2";
            cc.director.loadScene("Boss_scene_2");
        }
        else if(this.boss.boss_name == "Boss2"){
            this.boss.boss_name = "Boss3";
            cc.director.loadScene("Boss_scene_3");
        }
        else{
            this.boss.boss_name = "Boss1";
            cc.director.loadScene("Boss_scene_1");
        }
    }

    // slow motion
    setTimeScale(scale) {
        cc.director.calculateDeltaTime = function (now) {
            if (!now) now = performance.now();
            this._deltaTime = (now - this._lastUpdate) / 1000;
            this._deltaTime *= scale;
            this._lastUpdate = now;
        };
    }

    cameraFix(position: cc.Vec2 = cc.v2(5000, 5000)) {
        if (!position.equals(cc.v2(5000, 5000)))
            this.Camera.node.setPosition(position);
        this.isUsingCameraAnimation = true;
    }

    cameraUnfix() {
        this.isUsingCameraAnimation = false;
    }

    // keep track with player and boss
    cameraControl() {
        // use camera for animation
        if (this.isUsingCameraAnimation) return;

        // camera position (on the midpoint between player and boss)
        //var p = cc.v2(cc.misc.clampf(this.Player.node.x, -188, 91), cc.misc.clampf(this.Player.node.y, -86, 96));
        this.Camera.node.setPosition(cc.v2(0,0));
        // Zoom Ratio
        var playerPosition = this.Player.node.getPosition();
        var bossPosition = this.boss.node.getPosition();
        var newZoomRatio = Math.min((1280 / Math.abs((playerPosition.x - bossPosition.x))) * 1 - 0.4, (720 / Math.abs((playerPosition.y - bossPosition.y))) * 1 - 0.4) * 0.8;
        this.Camera.zoomRatio = 1//cc.misc.clampf(newZoomRatio,1,2.4);
    }

    cameraVibrate(amplitude: number = this.vibrationAmplitude) {
        cc.tween(this.Camera.node)
            .by(this.vibrationTime, { position: cc.v3(-amplitude, amplitude) })
            .call(() => this.cameraControl())
            .by(this.vibrationTime, { position: cc.v3(amplitude, -amplitude) })
            .call(() => this.cameraControl())
            .by(this.vibrationTime, { position: cc.v3(-amplitude, -amplitude) })
            .call(() => this.cameraControl())
            .by(this.vibrationTime, { position: cc.v3(amplitude, amplitude) })
            .call(() => this.cameraControl())
            .union()
            .repeat(2)
            .start();
    }

    specailAttackCameraControl() {
        this.cameraFix();
        var originalRoomRatio = this.Camera.zoomRatio;
        var originalPosition = this.Camera.node.getPosition();

        // for vibration
        var vibration = cc.tween()
            .by(this.vibrationTime, { position: cc.v3(-this.vibrationAmplitude + 1, this.vibrationAmplitude) })
            .call(() => this.cameraControl())
            .by(this.vibrationTime, { position: cc.v3(this.vibrationAmplitude - 1, -this.vibrationAmplitude + 1) })
            .call(() => this.cameraControl())
            .by(this.vibrationTime, { position: cc.v3(-this.vibrationAmplitude + 1, -this.vibrationAmplitude + 1) })
            .call(() => this.cameraControl())
            .by(this.vibrationTime, { position: cc.v3(this.vibrationAmplitude - 1, this.vibrationAmplitude - 1) })
            .call(() => this.cameraControl())
            .union()
            .repeat(2)

        // cameraDisplacementd

        cc.tween(this.Camera.node)
            .to(1, { position: cc.v3(this.Player.node.getPosition().multiply(cc.v2(this.Background.node.parent.parent.scaleX, this.Background.node.parent.parent.scaleY)).add(cc.v2(-130, 25)), 0).multiply(cc.v3(cc.find("Canvas").width/1280,1,1)) }, { easing: cc.easing.expoOut })
            .delay(0.5)
            .repeat(// fake parallel
                13,
                cc.tween().by(0.1, { position: cc.v3(0, -2) }).then(vibration)
            )
            .call(() => console.log(this.Player.node.getPosition()))
            .delay(1.5)
            .to(0.5, { position: cc.v3(originalPosition) })
            .start()

        // cameraZoom
        cc.tween(this.Camera)
            .to(2.5, { zoomRatio: 12 }, { easing: cc.easing.expoOut })
            .delay(2.)
            .to(1.7, { zoomRatio: 1.2 }, { easing: cc.easing.expoOut })
            .to(0.5, { zoomRatio: originalRoomRatio })
            .start()

    }
}

// ************************************* implementation for rewind *****************************//

class RecordItem{
    public position : cc.Vec2;
    public active : boolean;
    public angle : number;
    public constructor (rig : cc.RigidBody , node : cc.Node){
        this.position = rig.node.getPosition();
        this.angle = node.rotation;
        this.active = node.active;
    }
    // function that we can call to rewind data
    public static RewindData(node : cc.Node , rig : cc.RigidBody , item : RecordItem){
        rig.node.setPosition(item.position);
        node.active = item.active;
        node.rotation = item.angle;
    }
}

class RecordBuffer extends Array<RecordItem>{

}

class Boss_RecordItem{
    public boss_move_target_position : cc.Vec2;
    public boss_speed : number;
    public boss_content: string ;
    public boss_face: boolean ;
    public position : cc.Vec2;
    public active : boolean;
    public angle : number;
    public boss_talk_active : boolean;
    public constructor ( node : cc.Node , script : Boss_1){
        this.position = node.getPosition();
        this.angle = node.rotation;
        this.active = node.active;
        this.boss_move_target_position = script.boss_move_target_position;
        this.boss_speed = script.boss_speed;
        this.boss_content = script.boss_content;
        this.boss_face = script.boss_face;
        this.boss_talk_active = script.boss_talk_active;
    }
    // function that we can call to rewind data
    public static RewindData(node : cc.Node  , script : Boss_1 , item : Boss_RecordItem){
        if(item.position.x < - 700 && item.position.y < -340){
            node.setPosition(0,0);
        }
        else{
            node.setPosition(item.position);
        }
        node.active = item.active;
        node.rotation = item.angle;
        script.boss_move_target_position = item.boss_move_target_position;
        script.boss_speed = item.boss_speed;
        script.boss_content = item.boss_content;
        script.boss_face = item.boss_face;
        script.boss_talk_active = item.boss_talk_active;
    }
}

class Boss_RecordBuffer extends Array<Boss_RecordItem>{

}


class Bullet_RecordItem{
    public position : cc.Vec2;
    public active : boolean;
    public angle : number;
    public record_time : number;
    public constructor (node : cc.Node , time : number){
        this.position = node.getPosition();
        this.angle = node.rotation;
        this.active = node.active;
        this.record_time = time;
    }
    // function that we can call to rewind data
    public static RewindData(node : cc.Node , item : RecordItem){
        node.setPosition(item.position);
        node.active = item.active;
        node.rotation = item.angle;
    }
}

class Bullet_RecordBuffer extends Array<Bullet_RecordItem>{

}



// ************************************* implementation for rewind *****************************//

