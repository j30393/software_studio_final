const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property()
    pause:boolean = false;

    @property()
    projectile_number = 0;

    @property(cc.Vec2)
    projetile_position:cc.Vec2 = cc.v2(0,0);

    @property(cc.Node)
    player:cc.Node = null;

    @property()
    projetile_speed:number = 200;

    @property()
    projetile_exist_time:number = 0;
    
    @property()
    projetile_last_time:number = 10;

    //call when spawn
    projectileInitialize (start_x,start_y) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);

        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.node.setPosition(this.projetile_position);
        //TODO:need to attach to right node
        this.player = cc.find("Canvas/Environment/Boss");
    }
    
    update (dt) {
        if(!this.pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time<this.projetile_last_time){
                //TODO:need to attach to right node
                cc.find("Canvas/Environment/Projectiles").getComponent("ProjectileSystem").killProjectile(this.node);
            }
            else{
                let distance = cc.v2(0,0);
                distance.x += this.player.x - this.node.x;
                distance.y += this.player.y - this.node.y;
                this.node.x += dt*distance.x/distance.mag()*this.projetile_speed;
                this.node.y += dt*distance.y/distance.mag()*this.projetile_speed;
                var angle = Math.atan2(distance.x, distance.y);
                this.node.rotation = angle*180/Math.PI-90;
            }
        }
    }
}

