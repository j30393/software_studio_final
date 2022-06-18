import GameManager from "../Player_script/GameManager";
import Player from "../Player_script/Player"
const {ccclass, property} = cc._decorator;

enum state{
    Idle,
    Move,
    Cast,
    Attack,
    Teleport,
    TeleportAttack,
    Dead,
    Spawn,
}

@ccclass
export default class Boss_1 extends cc.Component {

    @property(cc.Node)
    projectile_system: cc.Node = null;
    @property(cc.Node)
    boss_attack_box: cc.Node = null;
    @property(cc.AudioClip)
    boss_attack_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    boss_starttp_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    boss_endtp_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    boss_cast_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    boss_predead_sfx: cc.AudioClip = null;
    @property(cc.AudioClip)
    boss_dead_sfx: cc.AudioClip = null;

    @property
    boss_name: string = 'Boss0';
    @property
    boss_state: number = state.Dead;
    @property
    boss_speed: number = 100;
    @property
    boss_stop: boolean = false;
    @property(cc.v2)
    boss_move_target_position = cc.v2(0,0);
    @property
    boss_dead_delay: number = 3;


    //gamegmr
    @property(GameManager)
    gamemgr : GameManager = null;

    private anim: cc.Animation = null;



    @property(cc.Prefab)
    HitEffect : cc.Prefab = null;

    @property(cc.AudioClip)
    HitEffectSound : cc.AudioClip[] = [];
    
    @property(Player)
    player : Player = null;


    // get hurt array
    hurt = []

    onLoad(){

        this.player = this.node.parent.getChildByName("Player").getComponent(Player);
        //this.player = cc.find("Canvas/Player").getComponent(Player);

        // check whether boss get hurt per 0.16s
        this.schedule(this.bossGetHurt,0.16);





        cc.game.setFrameRate(60);
        cc.director.getPhysicsManager().enabled = true;
    }

    start () {
        this.bossInitialize();
    }

    update (dt) {
        this.bossMove(dt);
        this.bossAnimation(dt);
    }

    //Initialize boss script
    bossInitialize(){
        this.anim = this.getComponent(cc.Animation);
        this.anim.on('finished',this.bossAnimationEnd,this);

        this.getComponent(this.boss_name + "Spirit").enabled = true;
    }

    //boss execute list by order
    private A:number = 0;
    private B:number = 0;
    private C:number = 0;
    private D:number = 0;
    private E:number = 0;
    private F:number = 0;
    private G:number = 0;
    private H:number = 0;
    bossExe(list){
        list.forEach(value => {
            switch(value.instruction_name){
                case 'd':
                    // console.log(value.instruction_val);
                    break;
                case 'A':
                    this.A = value.instruction_val;
                    break;
                case 'B':
                    this.B = value.instruction_val;
                    break;
                case 'C':
                    this.C = value.instruction_val;
                    break;
                case 'D':
                    this.D = value.instruction_val;
                    break;
                case 'E':
                    this.E = value.instruction_val;
                    break;
                case 'F':
                    this.F = value.instruction_val;
                    break;
                case 'G':
                    this.G = value.instruction_val;
                    break;
                case 'H':
                    this.H = value.instruction_val;
                    break;
                case 'p':
                    this.bossCast();
                    this.projectile_system.getComponent("ProjectileSystem").spawnProjectile(value.instruction_val,this.A,this.B,this.C,this.D,this.E,this.F,this.G,this.H);
                    break;
                case 'b':
                    if(value.instruction_val==0){
                        this.boss_move_target_position = cc.v2(this.A,this.B);
                    }
                    else if(value.instruction_val==1){
                        this.bossTeleport();
                    }
                    else if(value.instruction_val==2){
                        this.bossTeleportAttack();
                    }
                    else if(value.instruction_val==3){
                        this.bossAttack();
                    }
                    else if(value.instruction_val==4){
                        this.bossSpawn(this.A,this.B);
                    }
                    else if(value.instruction_val==5){
                        this.bossDead();
                    }
                    break;
            }
        });
    }

    //Change boss state
    bossStateChange(state_name:state){
        this.boss_state = state_name;
    }

    //Detect current state and play the animation
    private dead_counter = 100;
    private casting_counter = 0;
    bossAnimation(dt){
        switch(this.boss_state){
            case state.Idle:
                if(!this.anim.getAnimationState(this.boss_name + "_idle").isPlaying){
                    this.anim.play(this.boss_name + "_idle")
                }
                break;
            case state.Move:
                if(!this.anim.getAnimationState(this.boss_name + "_flying").isPlaying){
                    this.anim.play(this.boss_name + "_flying")
                }
                break;
            case state.Cast:
                if(this.casting_counter>0){
                    if(!(this.anim.getAnimationState(this.boss_name + "_startcast").isPlaying||this.anim.getAnimationState(this.boss_name + "_casting").isPlaying||this.anim.getAnimationState(this.boss_name + "_endcast").isPlaying)){
                        this.anim.play(this.boss_name + "_startcast");
                        this.bossPlaySFX(this.boss_cast_sfx);
                    }
                    else if(this.anim.getAnimationState(this.boss_name + "_casting").isPlaying){
                        this.casting_counter -= dt;
                        if(this.casting_counter<0){
                            this.anim.play(this.boss_name + "_endcast")
                        }
                    }
                }
                break;
            case state.Attack:
                if(!this.anim.getAnimationState(this.boss_name + "_attack").isPlaying){
                    this.anim.play(this.boss_name + "_attack");
                    this.scheduleOnce(function(){
                        this.bossPlaySFX(this.boss_attack_sfx);
                        this.boss_attack_box.active = true;
                    },20/60)
                    this.scheduleOnce(function(){
                        this.boss_attack_box.active = false;
                    },28/60)
                }
                break;
            case state.Teleport:
                if(!(this.anim.getAnimationState(this.boss_name + "_starttp").isPlaying||this.anim.getAnimationState(this.boss_name + "_endtp").isPlaying)){
                    this.anim.play(this.boss_name + "_starttp");
                    this.bossPlaySFX(this.boss_starttp_sfx);
                }
                break;
            case state.TeleportAttack:
                if(!(this.anim.getAnimationState(this.boss_name + "_starttp").isPlaying||this.anim.getAnimationState(this.boss_name + "_endtpattack").isPlaying)){
                    this.anim.play(this.boss_name + "_starttp");
                    this.bossPlaySFX(this.boss_starttp_sfx);
                }
                break;
            case state.Dead:
                if(this.dead_counter<this.boss_dead_delay){
                    if(!(this.anim.getAnimationState(this.boss_name + "_predead").isPlaying||this.anim.getAnimationState(this.boss_name + "_dead").isPlaying)){
                        this.anim.play(this.boss_name + "_predead");
                        this.bossPlaySFX(this.boss_predead_sfx);
                    }
                    else if(this.anim.getAnimationState(this.boss_name + "_predead").isPlaying){
                        this.dead_counter += dt;
                        if(this.dead_counter>this.boss_dead_delay){
                            this.anim.play(this.boss_name + "_dead");
                            this.bossPlaySFX(this.boss_cast_sfx);
                        }
                    }
                }
                break;
            case state.Spawn:
                if(!this.anim.getAnimationState(this.boss_name + "_endtp").isPlaying){
                    this.anim.play(this.boss_name + "_endtp");
                    this.bossPlaySFX(this.boss_endtp_sfx);
                }
                break;
        }
    }

    bossAnimationEnd(e,animationState){
        let name = animationState.name;
        switch(name){
            case this.boss_name + "_attack":
                this.bossStateChange(state.Idle);
                break;
            case this.boss_name + "_starttp":
                this.node.setPosition(this.boss_move_target_position);
                this.bossPlaySFX(this.boss_endtp_sfx);
                if(this.boss_state==state.TeleportAttack){
                    this.anim.play(this.boss_name + "_endtpattack");
                    this.scheduleOnce(function(){
                        this.bossPlaySFX(this.boss_attack_sfx);
                        this.boss_attack_box.active = true;
                    },51/60)
                    this.scheduleOnce(function(){
                        this.boss_attack_box.active = false;
                    },59/60)
                }
                else{
                    this.anim.play(this.boss_name + "_endtp");
                }
                break;
            case this.boss_name + "_endtp":
                this.bossStateChange(state.Idle);
                break;
            case this.boss_name + "_endtpattack":
                this.bossStateChange(state.Idle);
                break;
            case this.boss_name + "_startcast":
                this.anim.play(this.boss_name + "_casting");
                break;
            case this.boss_name + "_endcast":
                this.bossStateChange(state.Idle);
                break;
            case this.boss_name + "_dead":
                this.getComponent(cc.Sprite).enabled = false;
                break;
            case this.boss_name + "_spawn":
                this.bossStateChange(state.Idle);
                break;
        }
    }

    bossMove(dt){
        let distance = cc.v2(0,0);
        distance.x += this.boss_move_target_position.x - this.node.x;
        distance.y += this.boss_move_target_position.y - this.node.y;
        if(distance.mag()>=0.01){
            if(this.boss_state<state.Move) this.bossStateChange(state.Move);
            if(this.boss_state<=state.Cast){
                this.node.x += dt*distance.x/distance.mag()*this.boss_speed;
                this.node.y += dt*distance.y/distance.mag()*this.boss_speed;
            }
        }
        else{
            if(this.anim.getAnimationState(this.boss_name + "_flying").isPlaying) this.bossStateChange(state.Idle);
        }
    }

    bossCast(){
        if(this.boss_state<state.Cast){
            this.casting_counter = 2;
            this.bossStateChange(state.Cast);
        }
    }

    bossAttack(){
        if(this.boss_state<state.Attack)this.bossStateChange(state.Attack);
    }

    bossTeleport(){
        if(this.boss_state<state.Teleport)this.bossStateChange(state.Teleport);
    }

    bossTeleportAttack(){
        if(this.boss_state<state.TeleportAttack)this.bossStateChange(state.TeleportAttack);
    }

    bossSpawn(x,y){
        this.node.x = x;
        this.node.y = y;
        if(this.boss_state<state.Spawn) this.bossStateChange(state.Spawn);
    }

    bossDead(){
        if(this.boss_state<state.Dead){
            this.dead_counter = 0;
            this.bossStateChange(state.Dead);
        }
    }

    bossPlaySFX(sfx){
        cc.audioEngine.playEffect(sfx,false);
    }






    onCollisionEnter(self : cc.Collider, other : cc.Collider){
        if(self.node.name == "BigFire"){
            for(let i = 0;i<4;++i)
                this.hurt.push(1);
        }else if(self.node.name == "FistAttack"){
            for(let i = 0;i<3;++i)
                this.hurt.push(2);
        }else if(self.node.name == "ComboSkill2"){
            this.hurt.push(1);
            this.hurt.push(1);
        }else if(self.node.name == "explosion"){
            for(let i = 0;i<3;++i)
                this.hurt.push(1);
        }else if(self.node.name == "NormalAttackEffect"){
            this.hurt.push(2);
        }else if(self.node.name == "FireAttackEffect")
            this.hurt.push(2);
        else
            this.hurt.push(1);
        self.enabled = false;
    }


    bossGetHurt(){
        // no get hurt
        if(this.hurt.length == 0){
            return;
        }
        this.hurt.pop();
        this.gamemgr.cameraVibrate();

        var hitEffectPrefab = cc.instantiate(this.HitEffect);
        hitEffectPrefab.setPosition(this.node.getPosition());
        hitEffectPrefab.parent = this.node.parent;
        this.scheduleOnce(()=>{
            hitEffectPrefab.destroy();
        },0.3)

        // random hit sound
        var seed = Math.round(Math.random()*10)% 2;
        cc.audioEngine.playEffect(this.HitEffectSound[seed], false);

        this.player.comboUpdate();

        this.player.getScore(10);
        this.player.updateMagicBar();
    }





}
