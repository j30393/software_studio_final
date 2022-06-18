import Player from "./Player";
import Boss from "../Boss_script/Boss"
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    @property(cc.Camera)
    Camera: cc.Camera = null;

    @property(cc.Node)
    UICamera: cc.Node = null;

    @property(Player)
    Player: Player = null;

    @property(Boss)
    boss: Boss = null;

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
        for(var i = 0 ; i < 50 ; i++){
            this.record_data[i] = new Map<string,RecordBuffer>();  // we first set 50 record buffer , it not enough there's still room for space
        }
    }

    /********* !important    **********/
    public time : number = 0; // playing time
    /********* !important    **********/

    projectile_node : cc.Node = null;
    boss_node : cc.Node = null;
    player_node : cc.Node = null;
    counter : number = 0; // for the use of what stage it is -> if record_rewind is trigger -> +1
    cursor : number = 0; // cursor is for the index of record // record_data[counter][cursor]
    
    last_rewind_time : Array<number> = new Array<number>(); // the final of record_data[counter][x] (the array of x)
    record_data : Array<Map<string, RecordBuffer>> = new Array<Map<string, RecordBuffer>>();

    // uuids
    player_uuid : string = "";
    boss_uuid : string = "";
    // rewind parameter
    private rewind_once : boolean = false;
    private is_rewind : boolean = false;
    // load the key instructions from firebase


    start_record(){
        this.boss.boss_stop = true;
        this.projectile_node = cc.find("Canvas/Menu/MainScene/Environment/Projectiles");
        this.player_node = cc.find("Canvas/Menu/MainScene/Environment/Player");
        this.boss_node = cc.find("Canvas/Menu/MainScene/Environment/Boss");
        this.player_uuid = this.player_node.uuid;
        this.boss_uuid = this.boss_node.uuid;
        this.schedule(()=>{
            if(!this.is_rewind && !this.Player.player_stop){
                // record the player's status
                //console.log(this.Player.node.uuid);
                let player_buffer = this.record_data[this.counter].get(this.Player.node.uuid);
                if(!player_buffer){
                    this.record_data[this.counter].set(this.Player.node.uuid , new RecordBuffer());
                }
                player_buffer.push(new RecordItem(this.Player.node.getComponent(cc.RigidBody) , this.Player.node ));
                // record the boss status

                // record the projectile status

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
        console.log("one time rewind");
        this.Player.startRewind();
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

    update(dt) {
        this.cameraControl();
        if(this.Player.rewind_key_pressed && this.rewind_once == false){
            this.rewind_once = true;
            this.one_time_rewind();
        }
        // pop all thing when rewind also pause the music
        if(this.is_rewind){
            for(const uuid of Array.from(this.record_data[this.counter].keys())){
                // player rewind
                //console.log(uuid);
                if(uuid == this.player_uuid){
                    var player_buffer = this.record_data[this.counter].get(this.player_uuid);
                    if(player_buffer && player_buffer.length > 0){
                        //console.log("player rewinding");
                        const item  = player_buffer.pop();
                        RecordItem.RewindData(this.player_node ,this.player_node.getComponent(cc.RigidBody),item);
                        if(player_buffer.length == 0){
                            // after rewinding , set the screen to pause
                            this.is_rewind = false;
                            this.time_modify();
                            this.cursor = 0;
                        }
                    }
                }
                
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


// ************************************* implementation for rewind *****************************//