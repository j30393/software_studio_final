import Player from "./Player";
import Menu from "../Menu_script/Menu"
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    @property(cc.Camera)
    Camera : cc.Camera = null;

    @property(cc.Node)
    UICamera : cc.Node = null;

    @property(Player)
    Player : Player = null;

    @property(cc.Node)
    Boss : cc.Node = null;

    @property(cc.Sprite)
    Background : cc.Sprite = null;
    
    @property(cc.Node)
    ComboUI : cc.Node = null;

    @property(cc.Node)
    ScoreUI : cc.Node = null;
    @property(cc.Node)
    Menu : cc.Node = null;

    fullscreen : boolean = false;
    vibrationAmplitude : number = 2;
    vibrationTime : number = 0.02

    isUsingCameraAnimation : boolean = false;
    // test(){
    //     this.Camera.node.setPosition(cc.v3(0,0,300))
    //     console.log(this.Camera.node.getPosition());
    // }

    onLoad () {
        cc.dynamicAtlasManager.enabled = false;
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0,0);
    }

    // slow motion
    setTimeScale(scale) {
        cc.director.calculateDeltaTime = function(now) {
          if (!now) now = performance.now();
          this._deltaTime = (now - this._lastUpdate) / 1000;
          this._deltaTime *= scale;
          this._lastUpdate = now;
        };
      }

    cameraFix(position : cc.Vec2 = cc.v2(5000,5000)){
        if(!position.equals(cc.v2(5000,5000)))
            this.Camera.node.setPosition(position);
        this.isUsingCameraAnimation = true;
    }

    cameraUnfix(){
        this.isUsingCameraAnimation = false;
    }

    // keep track with player and boss
    cameraControl(){
        // use camera for animation
        if(this.isUsingCameraAnimation) return;

        // camera position (on the midpoint between player and boss)
        var newX = (this.Player.node.x + this.Boss.x) / 2;
        var newY = (this.Player.node.y + this.Boss.y) / 2;
        var p = cc.v2(cc.misc.clampf(newX,-291,134),cc.misc.clampf(newY,-132,150));
        this.Camera.node.setPosition(p);
        // Zoom Ratio
        var playerPosition = this.Player.node.getPosition();
        var bossPosition = this.Boss.getPosition();
        var newZoomRatio = Math.min((1280 / Math.abs((playerPosition.x - bossPosition.x)))*1 - 0.4,(720 / Math.abs((playerPosition.y - bossPosition.y)))*1 - 0.4)*0.8;
        this.Camera.zoomRatio = 2//cc.misc.clampf(newZoomRatio,1,2.4);
    }

    cameraVibrate(amplitude : number = this.vibrationAmplitude){
        cc.tween(this.Camera.node)
        .by(this.vibrationTime,{position:cc.v3(-amplitude,amplitude)})
        .call(()=>this.cameraControl())
        .by(this.vibrationTime,{position:cc.v3(amplitude,-amplitude)})
        .call(()=>this.cameraControl())
        .by(this.vibrationTime,{position:cc.v3(-amplitude,-amplitude)})
        .call(()=>this.cameraControl())
        .by(this.vibrationTime,{position:cc.v3(amplitude,amplitude)})
        .call(()=>this.cameraControl())
        .union()
        .repeat(2)
        .start();
    }

    specailAttackCameraControl(){
        this.cameraFix();
        var originalRoomRatio = this.Camera.zoomRatio;
        var originalPosition = this.Camera.node.getPosition();

        // for vibration
        var vibration = cc.tween()
        .by(this.vibrationTime,{position:cc.v3(-this.vibrationAmplitude + 1,this.vibrationAmplitude)})
        .call(()=>this.cameraControl())
        .by(this.vibrationTime,{position:cc.v3(this.vibrationAmplitude - 1,-this.vibrationAmplitude + 1)})
        .call(()=>this.cameraControl())
        .by(this.vibrationTime,{position:cc.v3(-this.vibrationAmplitude + 1,-this.vibrationAmplitude + 1)})
        .call(()=>this.cameraControl())
        .by(this.vibrationTime,{position:cc.v3(this.vibrationAmplitude - 1,this.vibrationAmplitude - 1)})
        .call(()=>this.cameraControl())
        .union()
        .repeat(2)

        // cameraDisplacementd
        var enviroment = this.Background.node.parent.parent;
        cc.tween(this.Camera.node)
        .to(1,{position:cc.v3((this.Player.node.getPosition().add(cc.v2(0,10))).multiply(cc.v2(enviroment.scaleX,enviroment.scaleY)),0)},{easing:cc.easing.expoOut})
        .delay(0.5)
        .repeat(// fake parallel
            13,
            cc.tween().by(0.1,{position:cc.v3(0,-3)}).then(vibration)
        )
        .delay(1.5)
        .to(0.5,{position:cc.v3(originalPosition)})
        .start()

        // cameraZoom
        cc.tween(this.Camera)
        .to(2.5,{zoomRatio:9},{easing:cc.easing.expoOut})
        .delay(2.)
        .to(2,{zoomRatio:1.5},{easing:cc.easing.expoOut})
        .to(0.5,{zoomRatio:originalRoomRatio})
        .start()
        
    }

    update (dt) {
        this.cameraControl();
        this.fullscreen =  this.Menu.getComponent("Menu").full_screen;
    }
    
}
