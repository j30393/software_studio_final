const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property()
    projectile_kinds = 12;

    @property([cc.Prefab])
    projectile:cc.Prefab[] = [];

    @property([cc.NodePool])
    projectile_node_pool:cc.NodePool[] = [];

    @property([cc.Node])
    projectile_parent_node:cc.Node[] = [];

    onLoad(){
        this.poolInitialize();
    }

    start(){
        this.spawnProjectile(0,0,0,1,0,0,250);
        this.spawnProjectile(1,0,0,1,0,60,250);
        this.spawnProjectile(2,0,0,1,0,30,250);
        
        this.spawnProjectile(3,50,50,7,0,0,0);
        this.spawnProjectile(4,0,50,0,0,0,0);
        this.spawnProjectile(5,-50,0,1,0,0,0);

        this.spawnProjectile(6,200,-250,6,0,0,0);
        this.spawnProjectile(7,200,-300,7,0,0,0);
        this.spawnProjectile(8,200,-350,8,0,0,0);

        this.spawnProjectile(9,200,1000,200,0,0,0);
        this.spawnProjectile(10,300,1000,300,0,0,0);
        this.spawnProjectile(11,400,1000,400,0,0,0);
    }

    //initialize pool
    poolInitialize(){
        for(let i = 0;i<this.projectile_kinds;i++){
            this.projectile_parent_node[i] = new cc.Node('pool'+i);
            this.node.addChild(this.projectile_parent_node[i]);
            console.log(this.projectile_parent_node[i])
            this.projectile_node_pool[i] = new cc.NodePool();
            let max_ammount = 100;
            for(let j = 0;j<max_ammount;j++){
                this.projectile_node_pool[i].put(cc.instantiate(this.projectile[i]));
            }
        }
    }

    //need to modify if add additional pattern
    spawnProjectile(type,A,B,C,D,E,F){
        let tmp = null;
        if (this.projectile_node_pool[type].size() > 0) {
            tmp = this.projectile_node_pool[type].get();
        } 
        else {
            tmp = cc.instantiate(this.projectile[type]);
        }
        tmp.parent = this.projectile_parent_node[type];
        if(tmp.getComponent('ProjectilePatternA')){
            tmp.getComponent('ProjectilePatternA').projectileInitialize(A,B,C,D,E,F);
        }
        else if(tmp.getComponent('ProjectilePatternB')){
            tmp.getComponent('ProjectilePatternB').projectileInitialize(A,B,C);
        }
        else if(tmp.getComponent('ProjectilePatternC')){
            tmp.getComponent('ProjectilePatternC').projectileInitialize(A,B,C);
        }
        else if(tmp.getComponent('ProjectilePatternD')){
            tmp.getComponent('ProjectilePatternD').projectileInitialize(A,B,C,D,E);
        }
    }

    //need to modify if add additional pattern
    killProjectile(target){
        let type = 0;
        if(target.getComponent('ProjectilePatternA')){
            type = target.getComponent('ProjectilePatternA').projectile_number;
        }
        else if(target.getComponent('ProjectilePatternB')){
            type = target.getComponent('ProjectilePatternB').projectile_number;
        }
        else if(target.getComponent('ProjectilePatternC')){
            type = target.getComponent('ProjectilePatternC').projectile_number;
        }
        else if(target.getComponent('ProjectilePatternD')){
            type = target.getComponent('ProjectilePatternD').projectile_number;
        }
        this.projectile_node_pool[type].put(target);
    }
}
