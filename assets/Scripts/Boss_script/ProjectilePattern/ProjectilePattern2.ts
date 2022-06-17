const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property()
    pause:boolean = false;

    @property()
    projectile_number = 0;
    @property(cc.Vec2)
    projetile_position:cc.Vec2 = cc.v2(0,0);
    @property(cc.Vec2)
    projetile_target_position:cc.Vec2 = cc.v2(1,0);
    @property()
    projetile_speed:number = 100;
    @property()
    projetile_exist_time:number = 0;
    @property()
    projetile_last_time:number = 15;

    //start_x:projectile spawn at start_x
    //start_y:projectile spawn at start_y
    //direction:0=>up,1=>up left,2=>left,3=>down_left,4=>down,5=>down_right,6=>right,7=>up_right
    projectileInitialize (start_x,start_y,direction) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);

        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        switch(direction%8){
            case 0://↑
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-0");
                this.projetile_target_position.x = this.projetile_position.x+0;
                this.projetile_target_position.y = this.projetile_position.y+1;
                break;
            case 1://↖
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-1");
                this.projetile_target_position.x = this.projetile_position.x-1;
                this.projetile_target_position.y = this.projetile_position.y+1;
                break;
            case 2://←
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-2");
                this.projetile_target_position.x = this.projetile_position.x-1;
                this.projetile_target_position.y = this.projetile_position.y+0;
                break;
            case 3://↙
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-3");
                this.projetile_target_position.x = this.projetile_position.x-1;
                this.projetile_target_position.y = this.projetile_position.y-1;
                break;
            case 4://↓
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-4");
                this.projetile_target_position.x = this.projetile_position.x+0;
                this.projetile_target_position.y = this.projetile_position.y-1;
                break;
            case 5://↘
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-3");
                this.projetile_target_position.x = this.projetile_position.x+1;
                this.projetile_target_position.y = this.projetile_position.y-1;
                this.node.scaleX = -this.node.scaleX;
                break;
            case 6://→
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-2");
                this.projetile_target_position.x = this.projetile_position.x+1;
                this.projetile_target_position.y = this.projetile_position.y+0;
                this.node.scaleX = -this.node.scaleX;
                break;
            case 7://↗
                this.getComponent(cc.Animation).play("P" + this.projectile_number + "animation-1");
                this.projetile_target_position.x = this.projetile_position.x+1;
                this.projetile_target_position.y = this.projetile_position.y+1;
                this.node.scaleX = -this.node.scaleX;
                break;
        }

        this.node.setPosition(this.projetile_position);
    }

    update (dt) {
        if(!this.pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time>this.projetile_last_time){
                //TODO:need to attach to right node
                cc.find("Canvas/Environment/Projectiles").getComponent("ProjectileSystem").killProjectile(this.node);
            }
            else{
                let distance = cc.v2(0,0);
                distance.x += this.projetile_target_position.x - this.projetile_position.x;
                distance.y += this.projetile_target_position.y - this.projetile_position.y;
                let tmp = distance.x;
                this.node.x += dt*distance.x/distance.mag()*this.projetile_speed;
                this.node.y += dt*distance.y/distance.mag()*this.projetile_speed;
                var angle = Math.atan2(distance.x, distance.y);
            }
        }

    }
}
