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
    @property(cc.Node)
    red_line:cc.Node = null;
    @property()
    projetile_speed:number = 2500;
    @property()
    projetile_exist_time:number = 0;
    @property()
    projetile_aim_time:number = 1;
    @property()
    projetile_last_time:number = 15;

    private aiming = true;

    //start_x:projectile spawn at start_x
    //start_y:projectile spawn at start_y
    //face_x:projectile will fly to face_x
    //face_y:projectile will fly to face_y
    //rotate_from_original_direction: projectile will fly from (start_x,start_y) to (face_x,face_y), and rotate "rotate_from_original_direction" angle
    projectileInitialize (start_x,start_y,face_x,face_y,rotate_from_original_direction) {
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
        this.projetile_exist_time = 0;
        this.node.getComponent(cc.Sprite).enabled = false;
        this.aiming = true;
        this.red_line.active = true;

        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.projetile_target_position.x = face_x;
        this.projetile_target_position.y = face_y;
        this.projetile_rotate = rotate_from_original_direction*Math.PI/180;
        let distance = cc.v2(0,0);
        distance.x += this.projetile_target_position.x - this.projetile_position.x;
        distance.y += this.projetile_target_position.y - this.projetile_position.y;
        let tmp = distance.x;
        distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
        distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
        var angle = Math.atan2(distance.x, distance.y);
        this.node.rotation = angle*180/Math.PI-90;

        this.node.setPosition(this.projetile_position);
        
    }

    update (dt) {
        if(!this.node.parent.parent.getComponent("ProjectileSystem").projectile_pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time>this.projetile_last_time){
                //TODO:need to attach to right node
                this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
            }
            else{
                if(this.projetile_exist_time>this.projetile_aim_time&&this.aiming){
                    this.node.getComponent(cc.Sprite).enabled = true;
                    this.aiming = false;
                    this.red_line.active = false;
                }
                let distance = cc.v2(0,0);
                distance.x += this.projetile_target_position.x - this.projetile_position.x;
                distance.y += this.projetile_target_position.y - this.projetile_position.y;
                let tmp = distance.x;
                distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
                distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
                var angle = Math.atan2(distance.x, distance.y);
                this.node.rotation = angle*180/Math.PI-90;

                if(!this.aiming){
                    this.node.x += dt*distance.x/distance.mag()*this.projetile_speed;
                    this.node.y += dt*distance.y/distance.mag()*this.projetile_speed;
                }
            }
        }
        if(Math.abs(this.node.x*this.node.y)>3000000){
            this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
        }
        else if(this.node.parent!=null){
            if(this.node.parent.parent.getComponent("ProjectileSystem").projectile_kill){
                this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
            }
        }
    }
}
