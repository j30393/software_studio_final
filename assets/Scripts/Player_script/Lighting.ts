// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Lighting extends cc.Component {

    draw : cc.Graphics;
    curDetail : number;

    onLoad() {
        this.draw = this.node.getComponent(cc.Graphics); // 获取本节点的Graphics组件
        this.curDetail = 10; // 这个参数影响闪电每一段的长度，值越小，闪电越细腻

        this.schedule(this.drawUpdate,0.01)
    }

    // 画一条线段。线段的宽度、颜色等参数在外面Graphics面板设置好了。
    drawLine(x1, y1, x2, y2) {
        this.draw.moveTo(x1, y1); // 设置路径起点
        this.draw.lineTo(x2, y2); // 终点
        this.draw.stroke(); // 填充路径
    }

    // 画一条闪电。闪电由多条线段组成。参数displace影响闪电的剧烈程度，值越大越剧烈。
    drawLighting(x1, y1, x2, y2, displace) {
        if (displace < this.curDetail) {
            this.drawLine(x1, y1, x2, y2);
        } else {
            let mid_x = (x1 + x2) / 2;
            let mid_y = (y1 + y2) / 2;
            mid_x += (Math.random() - 0.5) * displace;
            mid_y += (Math.random() - 0.5) * displace;
            this.drawLighting(x1, y1, mid_x, mid_y, displace / 2);
            this.drawLighting(x2, y2, mid_x, mid_y, displace / 2);
        }
    }

    drawUpdate(){
        // 先清空Graphics已绘制的所有东西，不然会和上一帧的叠加在一起。
        this.draw.clear();
        // 画个闪电
        this.drawLighting(Math.random()*10 - 5, Math.random()*10 - 5 - 20, Math.random()*10 - 5, Math.random()*10 - 5 + 20, Math.random()*10 + 20);
        this.drawLighting(Math.random()*15 - 5, Math.random()*10 - 5 - 20, Math.random()*15 - 5, Math.random()*10 - 5 + 20, Math.random()*10 + 30);
        this.drawLighting(Math.random()*10 - 5, Math.random()*10 - 5 - 20, Math.random()*10 - 5, Math.random()*10 - 5 + 20, Math.random()*10 + 10);
        //this.drawLighting(5, -20, 5, 20, 25);
        // 如果觉得不过瘾，可以每帧多调用几次drawLighting，多生成几条闪电。
    }
    // 每帧刷新
    update(dt) {
    }
}