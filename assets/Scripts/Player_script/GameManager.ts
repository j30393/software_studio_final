import Player from "./Player";
import Boss_1 from "../Boss_script/Boss"
import ProjectileSystem from "../Boss_script/ProjectileSystem"
const { ccclass, property } = cc._decorator;

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

    @property(cc.Sprite)
    Background: cc.Sprite = null;

    @property(cc.Node)
    ComboUI: cc.Node = null;

    @property(cc.Node)
    ScoreUI: cc.Node = null;
    @property(cc.Node)
    Menu: cc.Node = null;

    vibrationAmplitude: number = 2.7;
    vibrationTime: number = 0.02
    boss : Boss_1 = null;
    bullet : ProjectileSystem = null;
    isUsingCameraAnimation: boolean = false;
    // test(){
    //     this.Camera.node.setPosition(cc.v3(0,0,300))
    //     console.log(this.Camera.node.getPosition());
    // }


    

    start() {
        this.load_key();
        this.start_record();
    }

    // ************************************* implementation for key_load *****************************//

    load_key(){
        
    }

    // ************************************* implementation for key_load *****************************//

    // ************************************* implementation for rewind *****************************//

    onLoad() {
        cc.dynamicAtlasManager.enabled = false;
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, 0);
        this.boss = this.Boss.getComponent(Boss_1);
        this.bullet = this.Bullet.getComponent(ProjectileSystem);
        this.time = 0;
        console.log(this.bullet);
        // console.log(this.boss);
        for(var i = 0 ; i < 50 ; i++){
            this.bullet_record_data[i] = new Map<string,Bullet_RecordBuffer>();  // we first set 50 record buffer , it not enough there's still room for space
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
    // uuids
    player_uuid : string = "";
    boss_uuid : string = "";
    // rewind parameter
    rewind_once : boolean = false;
    private is_rewind : boolean = false;
    // load the key instructions from firebase


    start_record(){
        
        this.projectile_node = cc.find("Canvas/Menu/MainScene/Environment/Projectiles");
        this.player_node = cc.find("Canvas/Menu/MainScene/Environment/Player");
        this.boss_node = cc.find("Canvas/Menu/MainScene/Environment/Boss");
        this.player_uuid = this.player_node.uuid;
        this.boss_uuid = this.boss_node.uuid;
        /*
        let player_buffer = this.player_record_data[this.counter].get(this.player_node.uuid);
                if(!player_buffer){
                    this.record_data[this.counter].set(this.player_node.uuid , new RecordBuffer());
                }
        */
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
                    boss_buffer.push(new Boss_RecordItem(this.boss_node.getComponent(cc.RigidBody) , this.boss_node , this.boss ));
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
                                    bullet_buffer.push(new Bullet_RecordItem( child ));
                                }
                            }
                        }
                    }
                }
                this.cursor += 1;
                this.last_rewind_time[this.counter] = this.cursor;
                this.time += 0.1;

            }
        },0.1);
    }

    time_modified : boolean = false; // for time deduct after rewind

    one_time_rewind(){
        this.is_rewind = true; 
        this.time_modified = false;
        // make the type of object
        this.Player.rewind_key_pressed = false;
        // console.log("one time rewind");
        this.Player.startRewind(this.last_rewind_time[this.counter]/10);
        cc.director.getCollisionManager().enabled = false;
        if(this.cursor == 0 && this.counter > 0){
            this.cursor = this.last_rewind_time[--this.counter];
        }
    }

    time_modify(){
        // after rewind we set our time to the correct one
        if(!this.time_modified){
            this.time -= 0.1 * this.last_rewind_time[this.counter];
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
        this.cameraControl();
        this.player_paused = this.Player.player_stop;
        this.boss.boss_stop = this.Player.player_stop;
        this.bullet.projectile_pause = this.Player.player_stop;
        if(this.Player.rewind_key_pressed && this.rewind_once == false){
            this.rewind_once = true;
            this.one_time_rewind();
        }
        // pop all thing when rewind also pause the music
        if(this.is_rewind){
            for(const uuid of Array.from(this.bullet_record_data[this.counter].keys())){
                // player rewind
                console.log(uuid);
                for(const arr of this.projectile_node.children){
                    if(arr.children.length != 0){
                        for(const child of arr.children){
                            if(child.uuid == uuid){
                                var bullet_buffer = this.bullet_record_data[this.counter].get(uuid);
                                if(bullet_buffer && bullet_buffer.length > 0){
                                    const item = bullet_buffer.pop();
                                    Bullet_RecordItem.RewindData(child,item);
                                    this.scheduleOnce(()=>{
                                        child.active = false;
                                    },0.2);
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
                Boss_RecordItem.RewindData(this.boss_node ,this.boss_node.getComponent(cc.RigidBody), this.boss ,item);
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
        var p = cc.v2(cc.misc.clampf(this.Player.node.x, -188, 91), cc.misc.clampf(this.Player.node.y, -86, 96));
        this.Camera.node.setPosition(p);
        // Zoom Ratio
        var playerPosition = this.Player.node.getPosition();
        var bossPosition = this.boss.node.getPosition();
        var newZoomRatio = Math.min((1280 / Math.abs((playerPosition.x - bossPosition.x))) * 1 - 0.4, (720 / Math.abs((playerPosition.y - bossPosition.y))) * 1 - 0.4) * 0.8;
        this.Camera.zoomRatio = 1.5//cc.misc.clampf(newZoomRatio,1,2.4);
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
            .to(1, { position: cc.v3(this.Player.node.getPosition().multiply(cc.v2(this.Background.node.parent.parent.scaleX, this.Background.node.parent.parent.scaleY)).add(cc.v2(-125, 25)), 0) }, { easing: cc.easing.expoOut })
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
            .to(2, { zoomRatio: 1.5 }, { easing: cc.easing.expoOut })
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
    public constructor (rig : cc.RigidBody , node : cc.Node , script : Boss_1){
        this.position = rig.node.getPosition();
        this.angle = node.rotation;
        this.active = node.active;
        this.boss_move_target_position = script.boss_move_target_position;
        this.boss_speed = script.boss_speed;
        this.boss_content = script.boss_content;
        this.boss_face = script.boss_face;
        this.boss_talk_active = script.boss_talk_active;
    }
    // function that we can call to rewind data
    public static RewindData(node : cc.Node , rig : cc.RigidBody , script : Boss_1 , item : Boss_RecordItem){
        rig.node.setPosition(item.position);
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
    public constructor (node : cc.Node){
        this.position = node.getPosition();
        this.angle = node.rotation;
        this.active = node.active;
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