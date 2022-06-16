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
    projetile_rotate:number = 0;

    @property()
    projetile_speed:number = 250;

    @property()
    projetile_exist_time:number = 0;

    @property()
    projetile_last_time:number = 10;

    //call when spawn
    projectileInitialize (start_x,start_y,face_x,face_y,rotate_from_original_direction,speed) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);

        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.projetile_target_position.x = face_x;
        this.projetile_target_position.y = face_y;
        this.projetile_rotate = rotate_from_original_direction*Math.PI/180;
        this.projetile_speed = speed;

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
                distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
                distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
                this.node.x += dt*distance.x/distance.mag()*this.projetile_speed;
                this.node.y += dt*distance.y/distance.mag()*this.projetile_speed;
                var angle = Math.atan2(distance.x, distance.y);
                this.node.rotation = angle*180/Math.PI-90;
            }
        }

    }
}
