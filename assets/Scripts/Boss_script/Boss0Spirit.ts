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
    //  b 3 => spawn boss at (A,B)
    //  b 4 => kill boss
    
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
        if(this.atTime(3)){//execute when 5 second pass
            //this.pushInstruction('b',3);
        }
        else if(this.atTime(5)){//execute when 10 second pass
            this.pushInstruction('A',-300);//set A = -300
            this.pushInstruction('b',0);//boss move to (A,B) wich is (-300,0)
            this.pushInstruction('b',1);
        }
        else if(this.atTime(5.5)){//execute when 10.5 second pass
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
        else if(this.atTime(9)){
            this.pushInstruction('A',-500);
            this.pushInstruction('B',300);
            this.pushInstruction('C',0);
            this.pushInstruction('D',300);
            this.pushInstruction('E',0);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(9.1)){
            this.pushInstruction('B',200);
            this.pushInstruction('D',200);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(9.2)){
            this.pushInstruction('B',100);
            this.pushInstruction('D',100);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(9.3)){
            this.pushInstruction('B',0);
            this.pushInstruction('D',0);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(9.4)){
            this.pushInstruction('B',-100);
            this.pushInstruction('D',-100);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(9.5)){
            this.pushInstruction('B',-200);
            this.pushInstruction('D',-200);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(9.6)){
            this.pushInstruction('B',-300);
            this.pushInstruction('D',-300);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11)){
            this.pushInstruction('A',-500);
            this.pushInstruction('B',-300);
            this.pushInstruction('D',-300);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11.1)){
            this.pushInstruction('B',-200);
            this.pushInstruction('D',-200);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11.2)){
            this.pushInstruction('B',-100);
            this.pushInstruction('D',-100);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11.3)){
            this.pushInstruction('B',0);
            this.pushInstruction('D',0);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11.4)){
            this.pushInstruction('B',100);
            this.pushInstruction('D',100);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11.5)){
            this.pushInstruction('B',200);
            this.pushInstruction('D',200);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(11.6)){
            this.pushInstruction('B',300);
            this.pushInstruction('D',300);
            this.pushInstruction('p',9);
        }
        else if(this.atTime(13)){
            this.attackPatternC(300)
        }
        else if(this.atTime(13.2)){
            this.attackPatternC(200)
        }
        else if(this.atTime(13.4)){
            this.attackPatternC(100)
        }
        else if(this.atTime(13.6)){
            this.attackPatternC(0)
        }
        else if(this.atTime(13.8)){
            this.attackPatternC(-100)
        }
        else if(this.atTime(14)){
            this.attackPatternC(-200)
        }
        else if(this.atTime(14.2)){
            this.attackPatternC(-300)
        }

        else if(this.atTime(95)){//execute when 10 second pass
            //this.pushInstruction('b',4);
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
            this.pushInstruction('p',1);//fire projectile 1
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
            this.pushInstruction('p',1);
        }
    }

    attackPatternC(height){
        this.pushInstruction('C',5);
        for(let i = 0;i<=440;i+=40){
            this.pushInstruction('A',Math.random()*40+i-20);
            this.pushInstruction('B',Math.random()*100+height-50);
            this.pushInstruction('p',5);
            this.pushInstruction('A',Math.random()*40+i-20);
            this.pushInstruction('B',Math.random()*100+height-50);
            this.pushInstruction('p',5);
            this.pushInstruction('A',Math.random()*40+i-20);
            this.pushInstruction('B',Math.random()*100+height-50);
            this.pushInstruction('p',5);
        }
    }
}
