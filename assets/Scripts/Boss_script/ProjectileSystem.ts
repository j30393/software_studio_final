const {ccclass, property} = cc._decorator;

@ccclass
export default class ProjectileSystem extends cc.Component {

    @property()
    projectile_pause: boolean = false;

    @property()
    projectile_kinds = 26;

    @property()
    pattern_kinds = 26;

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
    }

    //initialize pool
    poolInitialize(){
        for(let i = 0;i<this.projectile_kinds;i++){
            this.projectile_parent_node[i] = new cc.Node('pool'+i);
            this.node.addChild(this.projectile_parent_node[i]);

            // console.log(this.projectile_parent_node[i])
            this.projectile_node_pool[i] = new cc.NodePool();
            let max_ammount = 100;
            //===============================================================
            // 如何更改彈幕的總量的範例如下(限定P99最多只會出現十個)
            switch(i){
                case 2:
                    max_ammount = 300;
                case 99:
                    max_ammount = 10;
                    break;
            }
            //===============================================================
            for(let j = 0;j<max_ammount;j++){
                this.projectile_node_pool[i].put(cc.instantiate(this.projectile[i]));
            }
        }
    }

    //生成彈幕
    spawnProjectile(type,A,B,C,D,E,F,G,H){
        
        let tmp = null;
        if (this.projectile_node_pool[type].size() > 0) {
            tmp = this.projectile_node_pool[type].get();
        } 
        else {
            tmp = cc.instantiate(this.projectile[type]);
        }
        tmp.parent = this.projectile_parent_node[type];
        // console.log(A,B);
        if(tmp.getComponent('ProjectilePattern1')){
            tmp.getComponent('ProjectilePattern1').projectileInitialize(A,B,C,D,E,F);
        }
        else if(tmp.getComponent('ProjectilePattern2')){
            tmp.getComponent('ProjectilePattern2').projectileInitialize(A,B,C);
        }
        else if(tmp.getComponent('ProjectilePattern3')){
            tmp.getComponent('ProjectilePattern3').projectileInitialize(A,B,C);
        }
        else if(tmp.getComponent('ProjectilePattern4')){
            tmp.getComponent('ProjectilePattern4').projectileInitialize(A,B,C,D,E);
        }
        else if(tmp.getComponent('ProjectilePattern5')){
            tmp.getComponent('ProjectilePattern5').projectileInitialize(A,B,C,D,E,F,G,H);
        }
        else if(tmp.getComponent('ProjectilePattern6')){
            tmp.getComponent('ProjectilePattern6').projectileInitialize(A,B,C,D,E,F,G,H);
        }
        else if(tmp.getComponent('ProjectilePattern7')){
            tmp.getComponent('ProjectilePattern7').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern8')){
            tmp.getComponent('ProjectilePattern8').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern9')){
            tmp.getComponent('ProjectilePattern9').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern10')){
            tmp.getComponent('ProjectilePattern10').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern11')){
            tmp.getComponent('ProjectilePattern11').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern12')){
            tmp.getComponent('ProjectilePattern12').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern13')){
            tmp.getComponent('ProjectilePattern13').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern14')){
            tmp.getComponent('ProjectilePattern14').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern15')){
            tmp.getComponent('ProjectilePattern15').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern16')){
            tmp.getComponent('ProjectilePattern16').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern17')){
            tmp.getComponent('ProjectilePattern17').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern18')){
            tmp.getComponent('ProjectilePattern18').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern19')){
            tmp.getComponent('ProjectilePattern19').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern20')){
            tmp.getComponent('ProjectilePattern20').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern21')){
            tmp.getComponent('ProjectilePattern21').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern22')){
            tmp.getComponent('ProjectilePattern22').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern23')){
            tmp.getComponent('ProjectilePattern23').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern24')){
            tmp.getComponent('ProjectilePattern24').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern25')){
            tmp.getComponent('ProjectilePattern25').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
        else if(tmp.getComponent('ProjectilePattern26')){
            tmp.getComponent('ProjectilePattern26').projectileInitialize(/* 請放入這個彈幕所需要的參數 */);
        }
    }

    //清理彈幕
    killProjectile(target){
        let type = 0;
        for(let i = 1;i<=this.pattern_kinds;i++){
            if(target.getComponent('ProjectilePattern' + i)){
                type = target.getComponent('ProjectilePattern' + i).projectile_number;
                break;
            }
        }
        this.projectile_node_pool[type].put(target);
    }
}
