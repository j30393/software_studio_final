const {ccclass, property} = cc._decorator;

@ccclass
export default class ProjectilePattern extends cc.Component {

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
    projetile_rotate_acceleration:number = 20;
    @property()
    projetile_speed:number = 250;
    @property()
    projetile_exist_time:number = 0;
    @property()
    projetile_last_time:number = 15;
    @property()
    projetile_ready_time:number = 0;

    //start_x:projectile spawn at start_x
    //start_y:projectile spawn at start_y
    //face_x:projectile will fly to face_x
    //face_y:projectile will fly to face_y
    //rotate_from_original_direction: projectile will fly from (start_x,start_y) to (face_x,face_y), and rotate "rotate_from_original_direction" angle
    //speed:projectile's speed
    //rotate_acceleration: projectile will rotate when flying, this is its acceleration
    projectileInitialize (start_x,start_y,face_x,face_y,rotate_from_original_direction,speed,rotate_acceleration,ready_time) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
        this.projetile_exist_time = 0;

        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.projetile_target_position.x = face_x;
        this.projetile_target_position.y = face_y;
        this.projetile_rotate = rotate_from_original_direction*Math.PI/180;
        this.projetile_speed = speed;
        this.projetile_rotate_acceleration = rotate_acceleration;
        this.projetile_ready_time = ready_time;

        this.node.setPosition(this.projetile_position);
    }

    private rotation_log = 0;
    update (dt) {
        if(!this.node.parent.parent.getComponent("ProjectileSystem").projectile_pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time>this.projetile_last_time){
                //TODO:need to attach to right node
                this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
            }
            else if(this.projetile_exist_time>this.projetile_ready_time){
                let distance = cc.v2(0,0);
                distance.x += this.projetile_target_position.x - this.projetile_position.x;
                distance.y += this.projetile_target_position.y - this.projetile_position.y;
                let tmp = distance.x;
                this.projetile_rotate += this.projetile_rotate_acceleration*dt;
                distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
                distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
                this.node.x += dt*distance.x/distance.mag()*this.projetile_speed;
                this.node.y += dt*distance.y/distance.mag()*this.projetile_speed;
                var angle = Math.atan2(distance.x, distance.y);
                angle+=this.rotation_log;
                this.rotation_log+=this.projetile_rotate_acceleration*dt;
                this.node.rotation = angle*180/Math.PI;
            }
        }
        if(Math.abs(this.node.x*this.node.y)>3000000||this.node.parent.parent.getComponent("ProjectileSystem").projectile_kill){
            this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
        }
    }
}
