const {ccclass, property} = cc._decorator;

/*
==================================================================================
這是一個彈幕腳本的模板，我會盡力解釋如何新增並且自訂你自己的彈幕。
首先，在編號分配上的部分：
黃冠諺(綠色)可以自由使用且新增0 3 6 9 12 15......(%3=0)
黃昱嘉(藍色)可以自由使用且新增1 4 7 10 13 16......(%3=1)
簡家聖(紅色)可以自由使用且新增2 5 8 11 14 17......(%3=2)
再來，在腳本的分配上：
黃冠諺(綠色)可以自由使用彈幕的腳本15 18 21......(%3=0)
黃昱嘉(藍色)可以自由使用彈幕的腳本16 19 22......(%3=1)
簡家聖(紅色)可以自由使用彈幕的腳本17 20 23......(%3=2)

新增彈幕的Prefab必須要包含：正確的大、Group(BossAttack)、碰撞箱以及動畫(PXanimation)。可以直接根據之前的Prefab來修改。
再來，你必須為自己的彈幕新增一Pattern的腳本，該腳本會影響這個彈幕怎麼動，而這個腳本便是模板。
==================================================================================
*/

@ccclass
export default class ProjectilePattern extends cc.Component {
    //畫面暫停用，必要
    @property()
    pause:boolean = false;

    //彈幕的編號，請記得要在cocos引擎裡面挑整數值
    @property()
    projectile_number = 0;

    //彈幕生成的座標位置
    @property(cc.Vec2)
    projetile_position:cc.Vec2 = cc.v2(0,0);
    //彈幕面向的座標位置
    @property(cc.Vec2)
    projetile_target_position:cc.Vec2 = cc.v2(1,0);

    //彈幕面向的座標位置後，旋轉的角度(逆時鐘共360)
    @property()
    projetile_rotate:number = 0;
    //彈幕在發射的過程中，旋轉的角加速度(會更改面向)
    @property()
    projetile_rotate_acceleration:number = 20;

    //彈幕在移動到面向位置的速度
    @property()
    projetile_speed:number = 250;

    //彈幕在生存的時間(請不要有任何挑整)以及消失的時間(可挑整)
    @property()
    projetile_exist_time:number = 0;
    @property()
    projetile_last_time:number = 5;

    @property(cc.Node)
    red_line:cc.Node = null;
    @property()
    projetile_aim_time:number = 1;
    private aiming = true;

    //請在此處設置彈幕出生成時的參數，可以根據需求自行增減function可以接收的參數數量，最多可接收8個
    projectileInitialize (start_x,start_y,face_x,face_y,rotate_from_original_direction,size,last,rotate_acceleration) {
        //必要的兩行code
        cc.view.enableAntiAlias(false);
        this.node.getComponent(cc.Sprite).spriteFrame.getTexture().setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
        this.projetile_exist_time = 0;
        this.node.getComponent(cc.Sprite).enabled = false;
        this.node.getComponent(cc.BoxCollider).enabled = false;
        this.aiming = true;
        this.red_line.active = true;
        this.node.scaleY = 1;
        this.rotation_log = 0;

        /*
        ==================================================================================
        你可以在這邊自行添增初始化的東西，比方說：

        設定這個彈幕的基本參數
        */
        this.projetile_position.x = start_x;
        this.projetile_position.y = start_y;
        this.projetile_target_position.x = face_x;
        this.projetile_target_position.y = face_y;
        this.projetile_rotate = rotate_from_original_direction*Math.PI/180;
        this.node.scaleX = 3*size;
        this.red_line.scaleY = 0.5/size;
        this.projetile_last_time = last;
        this.projetile_rotate_acceleration = rotate_acceleration;

        let distance = cc.v2(0,0);
        distance.x += this.projetile_target_position.x - this.projetile_position.x;
        distance.y += this.projetile_target_position.y - this.projetile_position.y;
        let tmp = distance.x;
        distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
        distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
        var angle = Math.atan2(distance.x, distance.y);
        this.node.rotation = angle*180/Math.PI;

        //將座標改為起始座標
        this.node.setPosition(this.projetile_position);
        /*
        等等......。
        ==================================================================================
        */
    }

    private rotation_log = 0;
    update (dt) {
        //若是在暫停狀態則不會執行
        if(!this.node.parent.parent.getComponent("ProjectileSystem").projectile_pause){
            this.projetile_exist_time+=dt;
            if(this.projetile_exist_time>this.projetile_last_time){
                //時間到，此彈幕將會被移出
                this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
            }
            else{
                if(this.projetile_exist_time>this.projetile_aim_time&&this.aiming){
                    this.node.getComponent(cc.Sprite).enabled = true;
                    this.node.getComponent(cc.BoxCollider).enabled = true;
                    this.aiming = false;
                    this.red_line.active = false;
                    this.node.scaleY = 200;
                }
                let distance = cc.v2(0,0);
                distance.x += this.projetile_target_position.x - this.projetile_position.x;
                distance.y += this.projetile_target_position.y - this.projetile_position.y;
                if(!this.aiming){
                    let tmp = distance.x;
                    distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
                    distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
                    var angle = Math.atan2(distance.x, distance.y);
                    angle+=this.rotation_log;
                    this.rotation_log+=this.projetile_rotate_acceleration*dt;
                    this.node.rotation = angle*180/Math.PI;
                }
                else{
                    let tmp = distance.x;
                    distance.x = Math.cos(this.projetile_rotate)*distance.x - Math.sin(this.projetile_rotate)*distance.y;
                    distance.y = Math.sin(this.projetile_rotate)*tmp + Math.cos(this.projetile_rotate)*distance.y;
                    var angle = Math.atan2(distance.x, distance.y);
                    this.node.rotation = angle*180/Math.PI;
                }
            }
        }
        if(this.node.parent.parent.getComponent("ProjectileSystem").projectile_kill){
            this.node.parent.parent.getComponent("ProjectileSystem").killProjectile(this.node);
        }

    }
}
