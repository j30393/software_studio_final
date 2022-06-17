import GameManager from "./GameManager";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Boss extends cc.Component {

    @property(cc.Prefab)
    HitEffect : cc.Prefab = null;

    @property(cc.AudioClip)
    HitEffectSound : cc.AudioClip[] = [];
    
    @property(Player)
    player : Player = null;

    _gameManager : GameManager = null;

    // get hurt array
    hurt = []

    onLoad () {
        this._gameManager = cc.find("GameManager").getComponent(GameManager);
        this.player = this.node.parent.getChildByName("Player").getComponent(Player);
        //this.player = cc.find("Canvas/Player").getComponent(Player);

        // check whether boss get hurt per 0.16s
        this.schedule(this.bossGetHurt,0.16);
    }

    start () {

    }

    update (dt) {
    }

    // collision
    onCollisionEnter(self : cc.Collider, other : cc.Collider){
        if(self.node.name == "BigFire"){
            for(let i = 0;i<4;++i)
                this.hurt.push(1);
        }else if(self.node.name == "FistAttack"){
            for(let i = 0;i<3;++i)
                this.hurt.push(1);
        }else if(self.node.name == "ComboSkill2"){
            this.hurt.push(1);
            this.hurt.push(1);
        }else if(self.node.name == "explosion"){
            for(let i = 0;i<3;++i)
                this.hurt.push(1);
        }else
            this.hurt.push(1);
        self.enabled = false;
    }


    bossGetHurt(){
        // no get hurt
        if(this.hurt.length == 0){
            return;
        }
        this.hurt.pop();
        this._gameManager.cameraVibrate();

        var hitEffectPrefab = cc.instantiate(this.HitEffect);
        hitEffectPrefab.setPosition(this.node.getPosition());
        hitEffectPrefab.parent = this.node.parent;
        this.scheduleOnce(()=>{
            hitEffectPrefab.destroy();
        },0.3)

        // random hit sound
        var seed = Math.round(Math.random()*10)% 2;
        cc.audioEngine.playEffect(this.HitEffectSound[seed], false);

        this.player.comboUpdate();

        this.player.getScore(10);
        this.player.updateMagicBar();
    }

}
