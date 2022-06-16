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
export default class NewClass extends cc.Component {

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Node)
    boss: cc.Node = null;

    @property([Instruction])
    instruction_list:Instruction[] = [];
    
    //debug
    //  d 0 => console.log(0)

    //set variable number
    //  A 0.3 => set A = 0.3

    //spawn projectile
    //  p 0 => spawn projectile type 0(use the variables you set before)

    //boss action
    //  b 0 => set moving point (A,B) and start moving
    //  b 1 => teleport to the moving point
    //  b 2 => teleport to the moving point and attack
    //  b 3 => boss attack
    //  b 4 => spawn boss at (A,B)
    //  b 5 => kill boss

    //please directly play sfx here
    
    update(dt){
        // TODO:connect to the game time-
        this.time += dt;
        if(this.time<this.pre_time) this.pre_time = this.time;

        this.bossSpirit();

        this.pre_time = this.time;
    }

    private pre_time = 0;
    private time = 0;
    atTime(target_time){
        return (this.time>target_time&&target_time>this.pre_time)
    }

    pushInstruction(name,value){
        this.instruction_list.push(new Instruction(name,value));
    }

    endInstruction(){
        this.getComponent("Boss").bossExe(this.instruction_list);
        this.instruction_list = [];
    }

    //design your own boss script here
    bossSpirit(){
        if(this.atTime(1)){//execute when 1 second pass
            this.pushInstruction('b',4);
        }
        else if(this.atTime(5)){//execute when 5 second pass
            this.pushInstruction('A',-300);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
        }
        else if(this.atTime(5.5)){//execute when 5.5 second pass
            this.attackPatternB();
        }
        else if(this.atTime(6)){
            this.attackPatternA();
        }
        else if(this.atTime(6.5)){
            this.attackPatternB();
        }
        else if(this.atTime(7)){
            this.attackPatternA();
        }
        else if(this.atTime(7.5)){
            this.attackPatternB();
        }
        else if(this.atTime(8)){
            this.attackPatternA();
        }
        else if(this.atTime(10)){
            this.pushInstruction('A',0);
            this.pushInstruction('B',0);
            this.pushInstruction('b',0);
            this.pushInstruction('b',2);
        }
        else if(this.atTime(15)){
            this.pushInstruction('b',3);
        }
        else if(this.atTime(20)){
            this.pushInstruction('b',5);
        }
        if(this.instruction_list) this.endInstruction();
    }

    attackPatternA(){
        this.pushInstruction('A',this.boss.x); 
        this.pushInstruction('B',this.boss.y);
        this.pushInstruction('C',this.boss.x+1);
        this.pushInstruction('D',this.boss.y);
        this.pushInstruction('E',0);
        this.pushInstruction('F',250);
        //finsih setting basic: start at (A,B), aim (A+1,B) , no rotation, speed at 250
        for(let i = 0;i<360;i+=20){
            this.pushInstruction('E',i);//rotate the direction 20 degree
            this.pushInstruction('p',0);//fire projectile 1
        }
    }

    attackPatternB(){
        this.pushInstruction('A',this.boss.x);
        this.pushInstruction('B',this.boss.y);
        this.pushInstruction('C',this.boss.x+1);
        this.pushInstruction('D',this.boss.y);
        this.pushInstruction('E',10);
        this.pushInstruction('F',250);
        for(let i = 10;i<360;i+=20){
            this.pushInstruction('E',i);
            this.pushInstruction('p',0);
        }
    }
}
