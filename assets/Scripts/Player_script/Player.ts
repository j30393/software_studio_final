import Boss from "./Boss_in_player";
import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;


@ccclass
export default class Player extends cc.Component {

    @property(cc.Node)
    Background : cc.Node = null;

    @property(cc.Node)
    UICamera : cc.Node = null;

    @property(cc.SpriteFrame)
    IdleSpriteFrame : cc.SpriteFrame[] = [];
    
    @property(cc.AudioClip)
    EffectSoundClips : cc.AudioClip[] = [];

    @property(cc.Prefab)
    Effects : cc.Prefab[] = [];

    @property(cc.Prefab)
    AttackEffect : cc.Prefab[] = [];

    @property(cc.Prefab)
    ParticleEffectPrefab : cc.Prefab[] = [];

    @property(cc.SpriteFrame)
    ComboDigit : cc.SpriteFrame[] = [];
    
    @property(cc.Material)
    ComboDigitEdgeFire : cc.Material[] = [];

    @property(cc.SpriteFrame)
    ScoreDigit : cc.SpriteFrame[] = [];

    _gameManager: GameManager = null;
    _animation : cc.Animation = null;

    // union
    input = {};
    lastInput = {};
    playerState = {
        idle:0,
        moveHorizontal:1,
        moveUpward:2,
        moveDownward:3,
        dash:4,
        specialAttackSpelling:5,
        specialAttack:6,
        attack:7,
        rewindStop:8,
    };
    playerSpriteFrame = {
        downward:0,
        upward:1,
        horizontal:2,
        spelling:3,
        comoboSkill2Dash:4,
    };
    playerAttackEffect = {
        normalAttack:0,
        fireAttack:1,
        fistAttack:2,
        comboSkill1:3,
        comboSkill2Dash:4,
        comboSkill2Explosion:5,
        comboSkill3:6,
        comboSkill3Shoot:7,
    };
    effectSound = {
        dash:0,
        normalAttack:1,
        fireAttack:2,
        waterAttack:3,
        circleAttack:4,
        specialAttackTrigger:5,
        specialAttackWait:6,
        specialAttackRelease:7,
        specialAttackSpelling:8,
        comboSkill:9,
        comboSkill1Fire:10,
        comboSkill2Dash:11,
        comboSkill2Lighting:12,
        comboSkill2Explosion:13,
        comboSkill3Summon:14,
        comboSkill3Circle:15,
        comboSkill3ZoomIn:16,
        ComboSkill3Lighting:17,
        ComboSkill3ShootStart:18,
        ComboSkill3ShootLoop:19,
        ComboSkill3ShootEnd:20,
        ComboSkill3Don:21,
    };
    otherEffects = {
        dashCircles:0,
        specialAttackTrigger:1,
        specialAttackBall:2,
        specialAttackCircle:3,
        specialAttackSpelling:4,
        rewind:5,
    };
    particleEffect = {
        fireParticle:0,
        gatheringParticle:1,
        dashParticle:2,
    };

    // dicide the direction of movement and attack
    directionToDistanceOffset : number = 20;
    playerDirection = [
        cc.v2(-this.directionToDistanceOffset,this.directionToDistanceOffset), cc.v2(0,this.directionToDistanceOffset), cc.v2(this.directionToDistanceOffset,this.directionToDistanceOffset),
        cc.v2(-this.directionToDistanceOffset,0),                              cc.v2(0,0),                              cc.v2(this.directionToDistanceOffset,0),
        cc.v2(-this.directionToDistanceOffset,-this.directionToDistanceOffset),cc.v2(0,-this.directionToDistanceOffset),cc.v2(this.directionToDistanceOffset,-this.directionToDistanceOffset)
    ];
    directionIndexToAngle = new Map([
        [5,0],
        [2,45],
        [1,90],
        [0,135],
        [3,180],
        [6,225],
        [7,270],
        [8,315]    
    ]);

    _playerLastState : number = 0;
    _playerState : number = 0;
    _speed : cc.Vec2;
    _moveSpeed : number;
    _directionIndex : number = 0;
    _canDash : boolean;


    magicBar : cc.Node = null
    invisibleTime : number;
    MP : number = 0;
    score : number = 0;
    combo : number;
    hitCombo : number = 0;
    cameraVibrationCounter : number;
    isHurt : boolean = false;

    // for special node
    spellingEffect : cc.Node = null;
    spellingEffectSoundID : number = 0; 
    rewind : cc.Node = null;

    // rewind usage 
    public rewind_key_pressed : boolean = false;
    public rewind_record : boolean = false;
    public player_stop : boolean = false;
    public rewind_duplicate_detection : boolean = false; // only when the signal is false can we set this scheduleOnce in startrewind
    test(){
        this.specialAttack();
    }

    onLoad () {
        // keyboard
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        // get component
        this._gameManager = cc.find("GameManager").getComponent(GameManager);
        this._animation = this.getComponent(cc.Animation);
        this._animation.on('finished',this.playerAnimationEnd, this);

        cc.game.setFrameRate(60);
        
    }

    onKeyDown(key){
        this.input[key.keyCode] = 1;
    }

    onKeyUp(key){
        this.input[key.keyCode] = 0;
    }

    playSoundEffect(audio : cc.AudioClip, amplitude : number = 1) : number {
        return cc.audioEngine.play(audio, false, amplitude);
    }

    start () {
        this.playerInit();
    }

    playerInit(){
        this._speed = cc.v2(0,0);
        this._moveSpeed = 200;
        this._playerState = this.playerState.moveDownward;
        this._playerLastState = this.playerState.moveDownward;
        this._directionIndex = 7; // downward
        this._canDash = true;

        this.magicBar = this._gameManager.UICamera.getChildByName("MagicBar");

        this.invisibleTime = 5000;
        this.MP = 30;
        this.score = 0;
        this.combo = 0;
        this.hitCombo = 0;
        this.isHurt = false;
    }

    playerAttack(){
        if(this.input[cc.macro.KEY.j]){

            if(this.combo < 4)
                this.playerAttackAnimation();

            if(this.combo == 0){
                this.playerAttackEffectAnimation("Normal attack");
            }else if(this.combo == 1){
                this.playerAttackEffectAnimation("Fire attack");
            }else if(this.combo == 2){
                this.playerAttackEffectAnimation("Fist attack");
            }else if(this.combo == 3){
                this.scheduleOnce(()=>{
                    this._playerState = this._playerLastState;
                    this.combo = 0;
                },0.2)
            }
        }
    }

    playerAttackAnimation(){
        switch(this._directionIndex){
            case 1: // up
                this._animation.play("PlayerAttackUpward");
                break;
            case 7: // down
                this._animation.play("PlayerAttackDownward");
                break;
            default:
                var seed = Math.floor(Math.random()*10);
                if(seed % 2)
                    this._animation.play("PlayerAttackHorizontal1");
                else
                    this._animation.play("PlayerAttackHorizontal2");
                break;
        }
    }

    playerAnimationEnd(e,animationState){
        if(animationState.name == "PlayerAttackHorizontal2" || animationState.name == "PlayerAttackHorizontal1" || animationState.name == "PlayerAttackUpward" || animationState.name == "PlayerAttackDownward"){
            var currentCombo = this.combo;
            var delayTime = 0;
            if(currentCombo ==  1) // fire attack need delay
                delayTime = 0.25;
            this.scheduleOnce(()=>{ // for combo
                this._playerState = this._playerLastState;
                this.combo = (this.combo + 1) % 4;
                this.scheduleOnce(()=>{
                    if(this._playerState == this.playerState.attack) return;
                    this.combo = 0;
                },0.2)// 0.2 = next attack instructions time 
            },delayTime)
        }
    }

    playerAttackEffectAnimation(type : string){
        var effect : cc.Node;
        var direction : number = this.directionIndexToAngle.get(this._directionIndex);
        var effectDistance = 30;
        if(type == "Normal attack"){
            effect = cc.instantiate(this.AttackEffect[this.playerAttackEffect.normalAttack]);
            effect.setPosition(this.node.getPosition().add(this.playerDirection[this._directionIndex].normalizeSelf().mul(effectDistance)));
            effect.angle += direction;
            effect.scaleX = -0.3;
            effect.parent = this.node.parent;
            this.scheduleOnce(()=>{
                effect.destroy();
            },0.6)
            this.playSoundEffect(this.EffectSoundClips[this.effectSound.normalAttack]);
        }else if(type == "Fire attack"){
            // first fire attack
            effect = cc.instantiate(this.AttackEffect[this.playerAttackEffect.fireAttack]);
            effect.setPosition(this.node.getPosition().add(this.playerDirection[this._directionIndex].normalizeSelf().mul(effectDistance)));
            effect.angle += direction;
            effect.parent = this.node.parent;
            this.scheduleOnce(()=>{
                effect.destroy();
            },0.65)
            this.playSoundEffect(this.EffectSoundClips[this.effectSound.fireAttack]);

            // second fire attack
            this.scheduleOnce(()=>{
                var effect2 = cc.instantiate(this.AttackEffect[this.playerAttackEffect.fireAttack]);
                effect2.setPosition(this.node.getPosition().add(this.playerDirection[this._directionIndex].normalizeSelf().mul(effectDistance)));
                effect2.angle += direction + 180;
                effect2.scaleY *= -1;
                effect2.parent = this.node.parent;
                    this.scheduleOnce(()=>{
                        effect2.destroy();
                },0.65)
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.fireAttack]);
            },0.2)
        }else if(type == "Fist attack"){
            effect = cc.instantiate(this.AttackEffect[this.playerAttackEffect.fistAttack]);
            effect.setPosition(this.node.getPosition().add(this.playerDirection[this._directionIndex].normalizeSelf().mul(effectDistance)));
            if(direction >= 135 && direction <= 225){
                effect.scaleX *= -1;
                direction -= 180;
            }
            effect.angle += direction;
            effect.parent = this.node.parent;
            this.scheduleOnce(()=>{
                effect.destroy();
            },0.8)
            this.playSoundEffect(this.EffectSoundClips[this.effectSound.circleAttack]);
        }
    }

    canUseComboSkill(){
        return this.hitCombo >= 10;
    }

    playerComboSkill(){
        // gathering particle
        var gatheringParticle = cc.instantiate(this.ParticleEffectPrefab[this.particleEffect.gatheringParticle]);
        gatheringParticle.setPosition(cc.v2(0,0));
        gatheringParticle.parent = this.node;

        var skill : cc.Node;
        var direction : number = this.directionIndexToAngle.get(this._directionIndex);

        //slow motion
        this._gameManager.setTimeScale(0.2);
        this.scheduleOnce(()=>{
            this._gameManager.setTimeScale(1);  
        },0.1)


        this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill]);

        // priority: 3 -> 2 -> 1. From high to low
        if(this.hitCombo >= 30){// this.hitcombo >= 30
            // 0.5s trigger -> 1.2s summon -> 1.5s circle -> 0.3s move -> 1.5s zoomIn -> 
            this.stopComboUIAnimation();

            this._animation.play("PlayerComboSkill3");

            var radius = 78;
            var angle = Math.PI * 1 * 2 / 5;
            var playerPosition = this.node.getPosition();
            var p1 = cc.v2(0,0).add(cc.v2(0,radius));
            var p2 = cc.v2(0,0).add(p1.sub(cc.v2(0,0)).rotate(angle));
            var p3 = cc.v2(0,0).add(p2.sub(cc.v2(0,0)).rotate(angle));
            var p4 = cc.v2(0,0).add(p3.sub(cc.v2(0,0)).rotate(angle));
            var p5 = cc.v2(0,0).add(p4.sub(cc.v2(0,0)).rotate(angle));

            var comboSkill3 = cc.instantiate(this.AttackEffect[this.playerAttackEffect.comboSkill3]);
            var comboSkill3Shoot = cc.instantiate(this.AttackEffect[this.playerAttackEffect.comboSkill3Shoot]);

            comboSkill3Shoot.setPosition(cc.v2(1280 / 2 - 470,720 / 2 - 330))
            comboSkill3.setPosition(playerPosition.div(2));
            this.scheduleOnce(()=>{
                comboSkill3.parent = this.node.parent.getChildByName("BackGround").getChildByName("Forest");
            },0.5)
            this.scheduleOnce(()=>{
                comboSkill3.destroy();
            },5.0)
            this.scheduleOnce(()=>{
                comboSkill3Shoot.parent = this.node.parent;
                this.scheduleOnce(()=>{
                    for(let i = 0; i < 10;++i)
                        this._gameManager.boss.getComponent(Boss).hurt.push(1);
                },1)
                this.scheduleOnce(()=>{
                    // combo skill 3 end
                    comboSkill3Shoot.destroy();
                    this.comboSkillGetScore(3);
                    this._playerState = this.playerState.idle;
                    this._gameManager.cameraUnfix();
                    this.invisibleTime = 59.9;
                },3.2)
            },7.2)

            var wind = comboSkill3.getChildByName("Wind");
            var fire = comboSkill3.getChildByName("Fire");
            var dark = comboSkill3.getChildByName("Dark");
            var lighting = comboSkill3.getChildByName("Lighting");
            var earth = comboSkill3.getChildByName("Earth");

            var elementMoveTime = 0.3;
        
            wind.setPosition(p1);
            cc.tween(wind)
            .delay(3.2)
            .to(elementMoveTime,{position:cc.v3(cc.v2(0,0))},{easing:cc.easing.expoOut})
            .start();

            fire.setPosition(p5);
            cc.tween(fire)
            .delay(3.2)
            .to(elementMoveTime,{position:cc.v3(cc.v2(0,0))},{easing:cc.easing.expoOut})
            .start();

            dark.setPosition(p4);
            cc.tween(dark)
            .delay(3.2)
            .to(elementMoveTime,{position:cc.v3(cc.v2(0,0))},{easing:cc.easing.expoOut})
            .start();

            lighting.setPosition(p3);
            cc.tween(lighting)
            .delay(3.2)
            .to(elementMoveTime,{position:cc.v3(cc.v2(0,0))},{easing:cc.easing.expoOut})
            .start();

            earth.setPosition(p2);
            cc.tween(earth)
            .delay(3.2)
            .to(elementMoveTime,{position:cc.v3(cc.v2(0,0))},{easing:cc.easing.expoOut})
            .start();

            // camera
            var parentNode = this.node.parent
            this.scheduleOnce(()=>{
                this._gameManager.cameraFix();
            },0.4)
            cc.tween(this._gameManager.Camera.node)
            .delay(0.4)
            .to(0.1,{position:(cc.v3(playerPosition).multiply(cc.v3(parentNode.scaleX,parentNode.scaleY)).add(cc.v3(-100,20)))},{easing:cc.easing.expoOut})
            .delay(2.8)
            .to(0.1,{position:(cc.v3(playerPosition).multiply(cc.v3(parentNode.scaleX,parentNode.scaleY)).add(cc.v3(-136,20)))},{easing:cc.easing.expoOut})
            .delay(3.4)
            .to(0.5,{position:cc.v3(0,0)},{easing:cc.easing.quadIn})
            .start()

            cc.tween(this._gameManager.Camera)
            .delay(0.4)
            .to(0.1,{zoomRatio:2.2},{easing:cc.easing.expoOut})
            .delay(2.8)
            .to(1.5,{zoomRatio:22},{easing:cc.easing.expoOut})
            .delay(1.2)
            .to(0.01,{zoomRatio:26})
            .to(0.3,{zoomRatio:22})
            .delay(0.5)
            .to(0.5,{zoomRatio:1},{easing:cc.easing.quadOut})
            .start();
            

            // effect sound
            cc.tween(this.node)
            .delay(0.5)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill3Summon]))
            .delay(1.5)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill3Circle]))
            .delay(1.2)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill3ZoomIn]))
            .delay(1.3)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.ComboSkill3Lighting]))
            .delay(1.4)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.ComboSkill3Don]))
            .delay(1.1)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.ComboSkill3ShootStart]))
            .delay(0.7)
            .call(()=>{
                this.schedule(()=>{this.playSoundEffect(this.EffectSoundClips[this.effectSound.ComboSkill3ShootLoop])},0.2,4);
            })
            .delay(1.8)
            .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.ComboSkill3ShootEnd]))
            .start();

        }else if(this.hitCombo >= 20){
            this.stopComboUIAnimation();

            var radius = 130;
            var bossPosition = this._gameManager.boss.node.getPosition();
            var angle = Math.PI * 2 * 2 / 5;
            var p1 = bossPosition.add(cc.v2(0,radius));
            var p2 = bossPosition.add(p1.sub(bossPosition).rotate(angle));
            var p3 = bossPosition.add(p2.sub(bossPosition).rotate(angle));
            var p4 = bossPosition.add(p3.sub(bossPosition).rotate(angle));
            var p5 = bossPosition.add(p4.sub(bossPosition).rotate(angle));
            var explosion = cc.instantiate(this.AttackEffect[this.playerAttackEffect.comboSkill2Explosion])

            var originalPosition = this.node.getPosition();
            

            var dash :cc.Node[] = [];
            for(var i=0;i<5;++i){
                var tmp = cc.instantiate(this.AttackEffect[this.playerAttackEffect.comboSkill2Dash]);
                dash.push(tmp);
            }

            cc.tween(this.node)
            .delay(0.5)
            .call(()=>{
                this.node.setPosition(p1);
                this.node.opacity = 0;
                this._gameManager.cameraFix(bossPosition.multiply(cc.v2(this.node.parent.scaleX,this.node.parent.scaleY)).add(cc.v2(-100,20)));
            })
            .call(()=>{
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Dash]);
                dash[0].setPosition(this.node.getPosition().add(p2.sub(p1).mul(0.5)));
                dash[0].angle = cc.v2(1,0).signAngle(p2.sub(p1))  / Math.PI * 180;
                dash[0].parent = this.node.parent;
            })
            .to(0.08,{position:cc.v3((p2.add(p1)).div(2))},{easing:cc.easing.expoIn})
            .to(0.08,{position:cc.v3(p2)},{easing:cc.easing.expoOut})
            .call(()=>{
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Dash]);
                dash[1].setPosition(this.node.getPosition().add(p3.sub(p2).mul(0.5)));
                dash[1].angle = cc.v2(1,0).signAngle(p3.sub(p2)) / Math.PI * 180;
                dash[1].parent = this.node.parent;
            })
            .to(0.08,{position:cc.v3((p3.add(p2)).div(2))},{easing:cc.easing.expoIn})
            .to(0.08,{position:cc.v3(p3)},{easing:cc.easing.expoOut})
            .call(()=>{
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Dash]);
                dash[2].setPosition(this.node.getPosition().add(p4.sub(p3).mul(0.5)));
                dash[2].angle = cc.v2(1,0).signAngle(p4.sub(p3)) / Math.PI * 180;
                dash[2].parent = this.node.parent;
            })
            .to(0.08,{position:cc.v3((p3.add(p4)).div(2))},{easing:cc.easing.expoIn})
            .to(0.08,{position:cc.v3(p4)},{easing:cc.easing.expoOut})
            .call(()=>{
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Dash]);
                dash[3].setPosition(this.node.getPosition().add(p5.sub(p4).mul(0.5)));
                dash[3].angle = cc.v2(1,0).signAngle(p5.sub(p4)) / Math.PI * 180;
                dash[3].parent = this.node.parent;
            })
            .to(0.08,{position:cc.v3((p4.add(p5)).div(2))},{easing:cc.easing.expoIn})
            .to(0.08,{position:cc.v3(p5)},{easing:cc.easing.expoOut})
            .call(()=>{
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Dash]);
                dash[4].setPosition(this.node.getPosition().add(p1.sub(p5).mul(0.5)));
                dash[4].angle = cc.v2(1,0).signAngle(p1.sub(p5)) / Math.PI * 180;
                dash[4].parent = this.node.parent;
            })
            .to(0.08,{position:cc.v3((p5.add(p1)).div(2))},{easing:cc.easing.expoIn})
            .to(0.08,{position:cc.v3(p1)},{easing:cc.easing.expoOut})
            .delay(0.2)
            .call(()=>{
                this.node.setPosition(originalPosition);
                this._gameManager.cameraUnfix();
                this._playerState = this._playerLastState;
                this.node.opacity = 255;
                for(let i = 0; i < 5;++i){
                    dash[i].destroy();
                }
                explosion.setPosition(bossPosition.multiply(cc.v2(this.node.parent.scaleX,this.node.parent.scaleY)));
                explosion.parent = this.node.parent.getChildByName("BackGround").getChildByName("Forest");
                this.schedule(()=>{
                    this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Lighting]);
                },0.25,6)
                this.schedule(()=>{
                    explosion.getChildByName("ball").getComponent(cc.BoxCollider).enabled = true;
                },0.4,2)
                this.scheduleOnce(()=>{
                    explosion.getChildByName("explosion").getComponent(cc.BoxCollider).enabled = true;
                    this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill2Explosion]);
                },2)
                this.scheduleOnce(()=>{
                    // combo skill 2 end
                    explosion.destroy();
                    this.comboSkillGetScore(2);
                    this.invisibleTime = 59.9;
                }, 3)
            })
            .start();


        }else if(this.hitCombo >= 10){
            this.stopComboUIAnimation();

            this._animation.play("PlayerComboSkill1");

            // fire particle
            var particle = cc.instantiate(this.ParticleEffectPrefab[this.particleEffect.fireParticle]);
            particle.setPosition(this.node.getPosition().add(this.playerDirection[this._directionIndex].mul(0.5)));

            var skill = cc.instantiate(this.AttackEffect[this.playerAttackEffect.comboSkill1]);
            skill.setPosition(this.node.getPosition().add(this.playerDirection[this._directionIndex].mul(0.4)));
            skill.angle += direction;

            this.scheduleOnce(()=>{
                skill.parent = this.node.parent;
                particle.parent = this.node.parent;
                this.playSoundEffect(this.EffectSoundClips[this.effectSound.comboSkill1Fire], 3.5)
            },0.5)

            // big fire done
            this.scheduleOnce(()=>{
                // combo skill 1 end
                this._playerState = this.playerState.idle
                this.comboSkillGetScore(1);
                this.invisibleTime = 59.9;
                particle.destroy();
                skill.destroy();
            },1.5)


        }
    }


    playerMove(dt : number){
        if(this._playerState == this.playerState.dash || this._playerState == this.playerState.specialAttackSpelling) return;

        // horizontal movement
        if(this.input[cc.macro.KEY.d]){
            this._speed.x = 1
        }else if(this.input[cc.macro.KEY.a]){
            this._speed.x = -1;
        }else{
            this._speed.x = 0;
        }

        // vertical movement
        if(this.input[cc.macro.KEY.w]){
            this._speed.y = 1
        }else if(this.input[cc.macro.KEY.s]){
            this._speed.y = -1;
        }else{
            this._speed.y = 0;
        }

        // position update
        this.node.x += this._speed.x * this._moveSpeed * dt;
        this.node.x = cc.misc.clampf(this.node.x, -640,640);
        this.node.y += this._speed.y * this._moveSpeed * dt;
        this.node.y = cc.misc.clampf(this.node.y, -360,360);
    }

    // player animation
    playerAnimation(){
        if(this._playerState == this.playerState.dash) return;
        
        if(this._playerState == this.playerState.specialAttackSpelling)
            this.getComponent(cc.Sprite).spriteFrame = this.IdleSpriteFrame[this.playerSpriteFrame.spelling];
        else if(this._playerState == this.playerState.idle){
            this._animation.stop();
            switch(this._playerLastState){
                case this.playerState.idle:
                case this.playerState.moveDownward:
                    this.getComponent(cc.Sprite).spriteFrame = this.IdleSpriteFrame[this.playerSpriteFrame.downward];
                    break;
                case this.playerState.moveUpward:
                    this.getComponent(cc.Sprite).spriteFrame = this.IdleSpriteFrame[this.playerSpriteFrame.upward];
                    break;
                case this.playerState.moveHorizontal:
                    this.getComponent(cc.Sprite).spriteFrame = this.IdleSpriteFrame[this.playerSpriteFrame.horizontal];
                    break;
            }
        }else if(this._playerState == this.playerState.moveDownward && !this._animation.getAnimationState("PlayerMoveDownward").isPlaying)
            this._animation.play("PlayerMoveDownward")
        else if(this._playerState == this.playerState.moveUpward && !this._animation.getAnimationState("PlayerMoveUpward").isPlaying)
            this._animation.play("PlayerMoveUpward")
        else if(this._playerState == this.playerState.moveHorizontal && !this._animation.getAnimationState("PlayerMoveHorizontal").isPlaying)
            this._animation.play("PlayerMoveHorizontal")
        
    }

    playerDash(){
        // invisible for 15 frames
        this.invisibleTime = 59.8;

        var dashDisplacement : cc.Vec2;
        var directionForCircles : number;
        // position transition animations
        dashDisplacement = this.playerDirection[this._directionIndex].normalizeSelf().mul(100); // 100 = dash distance
        directionForCircles = this.directionIndexToAngle.get(this._directionIndex);
        
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
        .by(0.4,{position:cc.v3(dashDisplacement,0)},{easing:cc.easing.expoOut})
        .delay(0.001)
        .call(()=>this._playerState = this._playerLastState)
        .delay(0.2)
        .call(()=>{
            this._canDash = true
            var p = cc.instantiate(this.ParticleEffectPrefab[this.particleEffect.dashParticle]);
            p.setPosition(cc.v2(0,0));
            p.parent = this.node;
        })
        .start();

        // player animations
        this._animation.stop();
        if(this._playerState == this.playerState.moveHorizontal)
            this._animation.play("DashHorizontal")
        else if(this._playerState == this.playerState.moveUpward)
            this._animation.play("DashUpward");
        else if(this._playerState == this.playerState.moveDownward)
            this._animation.play("DashDownward");
        else{
            if(this._playerLastState == this.playerState.moveHorizontal)
                this._animation.play("DashHorizontal")
            else if(this._playerLastState == this.playerState.moveUpward)
                this._animation.play("DashUpward");
            else if(this._playerLastState == this.playerState.moveDownward)
                this._animation.play("DashDownward");
        }

        // dash effect
        var dashCirclePrefab = cc.instantiate(this.Effects[this.otherEffects.dashCircles]);
        dashCirclePrefab.setPosition(this.node.getPosition());
        dashCirclePrefab.angle += directionForCircles;
        dashCirclePrefab.parent = this.node.parent;
        this.scheduleOnce(()=>{
             dashCirclePrefab.destroy();
        },0.5);

        this.playSoundEffect(this.EffectSoundClips[this.effectSound.dash]);
    }

    playerFSM(dt){
        // console.log(this._playerState);
        // if is using special attack, don't do anything, just watch animation !! 
        if(this._playerState == this.playerState.specialAttack) return;

        switch(this._playerState){
            case this.playerState.idle:
            case this.playerState.moveDownward:
            case this.playerState.moveUpward:
            case this.playerState.moveHorizontal:
            case this.playerState.attack:
            case this.playerState.dash:
            case this.playerState.specialAttackSpelling:
                if(this.isHurt && this.invisibleTime >= 60){
                    if(this._playerState != this.playerState.idle)
                        this._playerLastState = this._playerState;
                    this._playerState = this.playerState.specialAttack;
                    this.rewind_key_pressed = true;
                    this.player_stop = true;
                }
            default:
                break;
        }

        this.isHurt = false;

        switch(this._playerState){
            case this.playerState.idle:
            case this.playerState.moveDownward:
            case this.playerState.moveUpward:
            case this.playerState.moveHorizontal:
                // time rewind
                if(this.input[cc.macro.KEY.left] && !this.lastInput[cc.macro.KEY.left]){
                    if(this._playerState != this.playerState.idle)
                        this._playerLastState = this._playerState;
                    this._playerState = this.playerState.specialAttack;
                    this.rewind_key_pressed = true;
                    // console.log("left");
                    this.player_stop = true;
                    break;
                }

                // special attack TODO: MP setting
                if(this.input[cc.macro.KEY.q] && this.MP >= 30){
                    if(this._playerState != this.playerState.idle)
                        this._playerLastState = this._playerState;
                    this._playerState = this.playerState.specialAttackSpelling;
                    this.specialAttackStartSpelling();
                    break;
                }

                // player is moving
                if(this.input[cc.macro.KEY.d] || this.input[cc.macro.KEY.a])
                    this._playerState = this.playerState.moveHorizontal;
                else if(this.input[cc.macro.KEY.w])
                    this._playerState = this.playerState.moveUpward;
                else if(this.input[cc.macro.KEY.s])
                    this._playerState = this.playerState.moveDownward;
                else if(this._playerState != this.playerState.idle && this._playerState != this.playerState.dash){
                    this._playerLastState = this._playerState;
                    this._playerState = this.playerState.idle;
                }
                // dicide which direction player aim at.
                this.getPlayerDirection();
                // other instructions

                if(this.input[cc.macro.KEY.space] && !this.lastInput[cc.macro.KEY.space]){
                    this._playerState = this.playerState.rewindStop;
                    this.player_stop = true;
                }
                // stop added

                else if(this.input[cc.macro.KEY.l] && this.canUseComboSkill()){ // combo skill
                    if(this._playerState != this.playerState.idle)
                        this._playerLastState = this._playerState;
                    this._playerState = this.playerState.specialAttack;
                    this.playerComboSkill();
                }else if(this.input[cc.macro.KEY.j]){ // attack
                    if(this._playerState != this.playerState.idle)
                        this._playerLastState = this._playerState;
                    this._playerState = this.playerState.attack;
                    this.playerAttack();
                }else if(this.input[cc.macro.KEY.k] && this._canDash == true){ // dash
                    this._canDash = false;
                    this.playerDash();
                    if(this._playerState != this.playerState.idle)
                        this._playerLastState = this._playerState;
                    this._playerState = this.playerState.dash;
                }
                break;
            case this.playerState.specialAttackSpelling:
                if(!this.input[cc.macro.KEY.q]){
                    this._playerState = this._playerLastState;
                    this.specialAttackStopSpelling();
                }
                break;
            case this.playerState.rewindStop:
                if(this.input[cc.macro.KEY.space] && !this.lastInput[cc.macro.KEY.space]){
                    this.resumeGameFromRewind();
                    cc.director.getCollisionManager().enabled = true;
                    this.player_stop = false;
                    break;
                }
                else if(this.input[cc.macro.KEY.left] && !this.lastInput[cc.macro.KEY.left]){
                    this.rewind_key_pressed = true;
                    this.player_stop = true;
                    break;
                }
                break;
            default:
                break;
        }
        if(this._playerState <= this.playerState.moveDownward){
            this.playerMove(dt);
        }
        this.playerAnimation();

        this.lastInput[cc.macro.KEY.space] = this.input[cc.macro.KEY.space];
    }

    getPlayerDirection(){
        var newArmPositionIndex = 4; // all are not pressed at default
        if(this.input[cc.macro.KEY.w])
            newArmPositionIndex = 1;
        else if(this.input[cc.macro.KEY.s])
            newArmPositionIndex = 7;
        
        if(this.input[cc.macro.KEY.d]){
            this.node.scaleX = 1;
            newArmPositionIndex += 1;
        }else if(this.input[cc.macro.KEY.a]){
            this.node.scaleX = -1;
            newArmPositionIndex -= 1;
        }if(newArmPositionIndex != 4) // if a button is pressed, change direction
            this._directionIndex = newArmPositionIndex;
    }
    time = 5;
    update (dt : number) {
        this.invisibleTime += dt;
        this.playerFSM(dt);
        //console.log(this._gameManager.Boss.getPosition(),this.node.getPosition());
    }
    // ========== magic bar ============
    updateMagicBar(){
        this.MP+=1;
        if(this.MP >= 30 && !this.magicBar.getChildByName("Boundary").getComponent(cc.Animation).getAnimationState("MagicBar").isPlaying)
            this.magicBar.getChildByName("Boundary").getComponent(cc.Animation).play("MagicBar");
        this.magicBar.getChildByName("MP").width= Math.min(this.MP * 9, 270);
    }
    // ========= magic bar =========

    // ========== rewind =============
    startRewind(rewind_time : number){
        // TODO: stop BGM
        if(!this.rewind_duplicate_detection ){
            console.log(rewind_time);
            this.time = rewind_time/2;
            this.rewind_duplicate_detection = true;
            this.scheduleOnce(()=>{
                this._gameManager.rewind_once = false;
                this.rewind_key_pressed = false;
                this.rewind_duplicate_detection = false;
            },rewind_time + 0.7);
        }

        this._animation.stop();
        this.MP = 0;
        this.rewind = cc.instantiate(this.Effects[this.otherEffects.rewind]);
        this.rewind.getChildByName("Time").getComponent(cc.Animation).play("RewindStart");
        // console.log(this.UICamera.getPosition());
        this.rewind.setPosition(cc.v2(-145,20).multiply(cc.v2(1/this.node.parent.scaleX,1/this.node.parent.scaleY)));
        this.rewind.parent = this.UICamera;
        this.rewind.getChildByName("Time").getComponent(cc.Animation).on("finished",this.rewindAnimation, this);
        this.time -= 1.2;
        console.log(this.time);
    }

    resumeGameFromRewind(){
        this._playerState = this.playerState.idle;
    }

    rewindAnimation(){
        var state = this.rewind.getChildByName("Time").getComponent(cc.Animation);
        if(this.time >= 1.2)
            state.play("RewindLoop");
        else{
            state.play("RewindEnd");
            this.rewind.getChildByName("Time").getComponent(cc.Animation).off("finished", this.rewindAnimation, this);
            this.scheduleOnce(()=>{
                this._playerState = this.playerState.rewindStop;
                this.rewind.destroy();
            },1.2)
        }
        this.time -= 1.2;
    }
    // ========== rewind =============

    // ========== update combo =================
    stopComboUIAnimation(){
        cc.Tween.stopAllByTarget(this._gameManager.ComboUI);
        this._gameManager.ComboUI.opacity = 255;
    }
    comboUpdate(){
        this.hitCombo += 1;
        var comboUI = this._gameManager.ComboUI;
        var unit = comboUI.getChildByName("Unit");
        var ten = comboUI.getChildByName("Ten");
        var hundred = comboUI.getChildByName("Hundred");

        var edgeFire : cc.Material = this.ComboDigitEdgeFire[0];
        if(this.hitCombo >= 10)
            edgeFire = this.ComboDigitEdgeFire[1];

        // digit
        if(this.hitCombo > 0){
            unit.getComponent(cc.Sprite).spriteFrame = this.ComboDigit[this.hitCombo%10];
            unit.getComponent(cc.Sprite).setMaterial(0,edgeFire);
            this.digitAnimation(unit);
        }else
            unit.getComponent(cc.Sprite).spriteFrame = null;

        if(this.hitCombo >= 10){
            ten.getComponent(cc.Sprite).spriteFrame = this.ComboDigit[Math.floor(this.hitCombo/10) % 10];
            ten.getComponent(cc.Sprite).setMaterial(0,edgeFire);
            if(this.hitCombo % 10 == 0)
                this.digitAnimation(ten);
        }else
            ten.getComponent(cc.Sprite).spriteFrame = null;

        if(this.hitCombo >= 100){
            hundred.getComponent(cc.Sprite).spriteFrame = this.ComboDigit[Math.floor(this.hitCombo/100)];
            hundred.getComponent(cc.Sprite).setMaterial(0,edgeFire);
            if(this.hitCombo % 100 == 0)
                this.digitAnimation(hundred);
        }else
            hundred.getComponent(cc.Sprite).spriteFrame = null;

        // no more combo animation
        this.stopComboUIAnimation();
        cc.tween(comboUI)
        .to(5,{opacity:0},{easing:cc.easing.sineInOut})
        .call(()=>this.hitCombo = 0)
        .start();
    }

    digitAnimation(digitNode : cc.Node){
        cc.tween(digitNode)
        .by(0.1,{position:cc.v3(0,50)})
        .by(0.15,{position:cc.v3(0,-50)},{easing:cc.easing.expoOut})
        .call(()=>digitNode.y = 0)
        .start();
    }

    // ========== update combo =================

    // ========== update score =================
    getScore(numbers : number){
        this.score += numbers;
        this.scoreUpdate();
    }
    scoreUpdate(){
        var score = this._gameManager.ScoreUI;

        score.getChildByName("Unit").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[this.score % 10];
        score.getChildByName("Ten").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[Math.floor(this.score / 10) % 10];
        score.getChildByName("Hundred").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[Math.floor(this.score / 100) % 10];
        score.getChildByName("Thousand").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[Math.floor(this.score / 1000) % 10];
        score.getChildByName("TenThousand").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[Math.floor(this.score / 10000) % 10];
        score.getChildByName("HundredThousand").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[Math.floor(this.score / 100000) % 10];
        score.getChildByName("Million").getComponent(cc.Sprite).spriteFrame = this.ScoreDigit[Math.floor(this.score / 1000000) % 10];
    }
    comboSkillGetScore(type : number){
        var scoreClone = cc.instantiate(this._gameManager.ComboUI);
        var hitComboNow = this.hitCombo;

        cc.tween(scoreClone)
        .call(()=>{
            this.hitCombo = -1
            this.comboUpdate();
        })
        .by(1,{position:cc.v3(-1000,0),opacity:-255,scale:-1})
        .call(()=>{
            scoreClone.destroy()
            if(type == 1){
                this.getScore(hitComboNow*100);
            }else if(type == 2){
                this.getScore(hitComboNow*300);
            }else if(type == 3){
                this.getScore(hitComboNow*500);
            }
        })
        .start();

        scoreClone.parent = this._gameManager.UICamera;
    }
    // ========== update score =================

    // ========== special attack below =============
    cameraVibration(){
        this.cameraVibrationCounter += 0.25;
        this._gameManager.cameraVibrate(this.cameraVibrationCounter);
    }

    specialAttackStartSpelling(){
        // stop animation
        this._animation.stop();

        // spelling circle effect
        var magicCircle = cc.instantiate(this.Effects[this.otherEffects.specialAttackSpelling]);
        magicCircle.setPosition((this.node.getPosition().add(cc.v2(0,-15))).divide(2));
        magicCircle.parent = this.node.parent.getChildByName("BackGround").getChildByName("Forest");

        // record object
        this.spellingEffect = magicCircle;
        this.spellingEffectSoundID = this.playSoundEffect(this.EffectSoundClips[this.effectSound.specialAttackSpelling], 2);

        // count for 2s
        this.scheduleOnce(this.specialAttack,2)

        // camera
        this._gameManager.isUsingCameraAnimation = true;
        this.schedule(this.cameraVibration,0.2);
        this.cameraVibrationCounter = 0;
    }

    specialAttackStopSpelling(){
        cc.audioEngine.stop(this.spellingEffectSoundID); // stop spelling effectSound
        this.spellingEffect.destroy(); // destroy spelling circle effect
        this.unschedule(this.specialAttack);

        // camera
        this._gameManager.isUsingCameraAnimation = false;
        this.unschedule(this.cameraVibration);
    }

    specialAttack () {
        this.magicBar.getChildByName("Boundary").getComponent(cc.Animation).stop();
        this._playerState = this.playerState.specialAttack;
        cc.audioEngine.stop(this.spellingEffectSoundID); // stop spelling effectSound
        this.unschedule(this.cameraVibration);

        // player animation
        this._animation.play("PlayerSpecialAttack");
        
        // camera
        this._gameManager.specailAttackCameraControl();

        // effect
        var trigger = cc.instantiate(this.Effects[this.otherEffects.specialAttackTrigger]);
        trigger.setPosition(cc.v2(0,0));
        cc.tween(trigger)
        .call(()=>trigger.parent = this.node)
        .delay(1.8)
        .call(()=>trigger.destroy())
        .start();

        var ball = cc.instantiate(this.Effects[this.otherEffects.specialAttackBall]);
        ball.setPosition(cc.v2(0,30));

        var release = cc.instantiate(this.Effects[this.otherEffects.specialAttackCircle])
        release.setPosition(cc.v2(0,-5));
        cc.tween(this.node)
        .delay(1.8)
        .call(()=>{ball.parent = this.node})
        .delay(1.7)
        .call(()=>ball.setPosition(10,0))
        .delay(1)
        .call(()=>ball.destroy())
        .start();

        cc.tween(release)
        .delay(4.5)
        .call(()=>{
            release.parent = this.node;
            this.spellingEffect.destroy()
            this.makeEarthquack();
            this._gameManager.setTimeScale(0.2);
            this.scheduleOnce(()=>{
                this._gameManager.setTimeScale(1);  
            },0.2)
        })
        .to(1.5,{scale:8})
        .call(()=>release.destroy())
        .start();

        // effect sound
        cc.tween(this.node)
        .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.specialAttackTrigger]))
        .delay(1.5)
        .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.specialAttackWait]))
        .delay(3)
        .call(()=>this.playSoundEffect(this.EffectSoundClips[this.effectSound.specialAttackRelease]))
        .start();

        // player and camera state
        this.scheduleOnce(()=>{
            this._playerState = this.playerState.idle;
            this.MP = -1;
            this.updateMagicBar();
            this.rewind_record = true;
            this.scheduleOnce(()=>{
                this._gameManager.isUsingCameraAnimation = false;
            },0.5)
        },6.5)
    }

    makeEarthquack(){
        var material = this.node.parent.getChildByName("BackGround").getChildByName("Forest").getComponent(cc.Sprite).getMaterial(0);
        //var material = cc.find("Canvas/Background").getComponent(cc.Sprite).getMaterial(0);
        material.setProperty('playerX', this.node.x / 2);
        material.setProperty('playerY', -this.node.y / 2);
        material.setProperty('offsetX', (this._gameManager.Background.spriteFrame.getOriginalSize().width));
        material.setProperty('offsetY', (this._gameManager.Background.spriteFrame.getOriginalSize().height));
        material.setProperty('u_time', 0.01);
        this.schedule(this.earthquackDiffuse,0.016);
        this.scheduleOnce(()=>this.unschedule(this.earthquackDiffuse),5);
    }

    earthquackDiffuse(){
        this._gameManager.Background.getMaterial(0).setProperty('u_time', Math.max(this._gameManager.Background.getMaterial(0).getProperty('u_time',0)*1.07,0.05))
    }

    // collision
    onCollisionEnter(self : cc.Collider, other : cc.Collider){
        if(self.tag == 3)
            this.isHurt = true;
        console.log(self,other);
    }
}
