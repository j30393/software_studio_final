const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property()
    pause:boolean = false;

    @property()
    projectile_number = 0;
    @property(cc.Vec2)
    projetile_position:cc.Vec2 = cc.v2(0,0);
    @property()
    projetile_exist_time:number = 0;
    @property()
    projetile_last_time:number = 15;

    //call when spawn
    projectileInitialize (start_x,start_y,last_time) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
        
        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.projetile_last_time = last_time;
        this.node.setPosition(this.projetile_position);
    }

    update (dt) {
        if(!this.pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time>this.projetile_last_time){
                //TODO:need to attach to right node
                cc.find("Canvas/Environment/Projectiles").getComponent("ProjectileSystem").killProjectile(this.node);
            }
        }
    }
}
