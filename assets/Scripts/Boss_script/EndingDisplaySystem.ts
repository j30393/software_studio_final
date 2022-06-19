const {ccclass, property} = cc._decorator;

@ccclass
export default class EndingDisplaySystem extends cc.Component {

    @property(cc.Sprite)
    thumbnail: cc.Sprite = null;

    @property(cc.SpriteFrame)
    thumbnail1:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    thumbnail2:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    thumbnail3:cc.SpriteFrame = null;
    @property(cc.Label)
    score:cc.Label = null;

    callEnding(score,stage_number){
        if(stage_number==1){
            this.thumbnail.spriteFrame = this.thumbnail1;
        }
        else if(stage_number==2){
            this.thumbnail.spriteFrame = this.thumbnail2;
        }
        else if(stage_number==3){
            this.thumbnail.spriteFrame = this.thumbnail3;
        }
        this.node.opacity = 255;
        this.score.string = "Your score is " + score;
    }
}
