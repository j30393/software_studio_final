const {ccclass, property} = cc._decorator;

enum state{
    Idle,
    Move,
    Cast,
    Attack,
    Teleport,
    TeleportAttack,
    Spawn,
    Dead,
}

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    projectile_system: cc.Node = null;

    @property(cc.Node)
    boss_attack_box: cc.Node = null;

    @property
    boss_name: string = 'Boss0';

    @property
    boss_state: number = state.Spawn;

    @property
    boss_speed: number = 100;

    @property
    boss_stop: boolean = false;

    @property(cc.v2)
    boss_move_target_position = cc.v2(0,0);

    private anim: cc.Animation = null;

    private teleport_delay:number = 0.2;
    private teleport_attack_delay:number = 0.2;
    private attack_delay:number = 0.2;
    private attack_length:number = 0.05;

    onLoad(){
        cc.game.setFrameRate(60);
        cc.director.getPhysicsManager().enabled = true;
    }

    start () {
        this.bossInitialize();
    }

    update (dt) {
        //TODO:this.bossAnimation();
        this.bossMove(dt);
        this.bossCast();
    }

    //Initialize boss script
    bossInitialize(){
        this.anim = this.getComponent(cc.Animation);
    }

    //boss execute list by order
    private A:number = 0;
    private B:number = 0;
    private C:number = 0;
    private D:number = 0;
    private E:number = 0;
    private F:number = 0;
    bossExe(list){
        list.forEach(value => {
            switch(value.instruction_name){
                case 'd':
                    console.log(value.instruction_val);
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
                case 'p':
                    this.projectile_system.getComponent("ProjectileSystem").spawnProjectile(value.instruction_val,this.A,this.B,this.C,this.D,this.E,this.F);
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
                        this.bossSpawn(this.A,this.B);
                    }
                    else if(value.instruction_val==4){
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
    bossAnimation(){
        switch(this.boss_state){
            case state.Idle:
                break;
            case state.Move:
                break;
            case state.Cast:
                break;
            case state.Attack:
                break;
            case state.Teleport:
                break;
            case state.TeleportAttack:
                break;
            case state.TeleportAttack:
                break;
            case state.Spawn:
                break;
        }
    }

    bossMove(dt){
        let distance = cc.v2(0,0);
        distance.x += this.boss_move_target_position.x - this.node.x;
        distance.y += this.boss_move_target_position.y - this.node.y;
        if(distance.mag()>=0.01){
            if(this.boss_state<state.Move) this.boss_state=state.Move;
            this.node.x += dt*distance.x/distance.mag()*this.boss_speed;
            this.node.y += dt*distance.y/distance.mag()*this.boss_speed;
        }
    }

    bossCast(){
        if(this.boss_state<state.Cast) this.bossStateChange(state.Cast);
    }

    bossAttack(){
        if(this.boss_state<state.Attack) this.bossStateChange(state.Attack);
        this.scheduleOnce(function(){
            this.boss_attack_box.active = true;
        },0.2)
        this.scheduleOnce(function(){
            this.boss_attack_box.active = false;
        },0.25)
    }

    bossTeleport(){
        if(this.boss_state<state.Teleport) this.bossStateChange(state.Teleport);
        this.scheduleOnce(function(){
            this.node.setPosition(this.boss_move_target_position);
        },this.teleport_delay)
        this.scheduleOnce(function(){
            this.boss_attack_box.active = true;
        },this.attack_delay)
        this.scheduleOnce(function(){
            this.boss_attack_box.active = false;
        },this.attack_delay +this.attack_length)
    }

    bossTeleportAttack(){
        if(this.boss_state<state.TeleportAttack) this.bossStateChange(state.TeleportAttack);
        this.scheduleOnce(function(){
            this.node.setPosition(this.boss_move_target_position);
        },this.teleport_delay)
        this.scheduleOnce(function(){
            this.boss_attack_box.active = true;
        },this.teleport_attack_delay)
        this.scheduleOnce(function(){
            this.boss_attack_box.active = false;
        },this.teleport_attack_delay +this.attack_length)
    }

    bossSpawn(x,y){
        this.node.x = x;
        this.node.y = y;
        if(this.boss_state<state.Spawn) this.bossStateChange(state.Spawn);
    }

    bossDead(){
        if(this.boss_state<state.Dead) this.bossStateChange(state.Dead);
    }
}
