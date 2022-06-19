const {ccclass, property} = cc._decorator;

@ccclass
export default class ProjectilePattern extends cc.Component {

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

    //start_x:projectile spawn at start_x
    //start_y:projectile spawn at start_y
    //last_time:will last for "last_time" time
    projectileInitialize (start_x,start_y,last_time) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
        this.projetile_exist_time = 0;
        
        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.projetile_last_time = last_time;
        this.node.setPosition(this.projetile_position);
    }

    update (dt) {
        if(!this.node.parent.parent.getComponent("ProjectileSystem").projectile_pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time>this.projetile_last_time){
                //TODO:need to attach to right node
                this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
            }
        }
        if(Math.abs(this.node.x*this.node.y)>3000000){
            this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
        }
    }
}
