

var LengthMark = function(ctx) {
    this.ctx = ctx;
    this.isRetina = false;
    this.id = "lm_" + (new Date()).valueOf();
    this.p1 = {
        x: 0,
        y: 0,
        isOK: 0
    };
    this.p2 = {
        x: 0,
        y: 0,
        isOK: 0
    };
    //在显示屏上的坐标
    this.vP1 = {x:0,y:0};
    this.vP2 = {x:0,y:0};
    this.dir = "";
    this.setP1 = function(x, y) {
        this.p1.x = x + 0.5;
        this.p1.y = y + 0.5;
        this.p1.isOK = 1;
    };
    this.setP2 = function(x, y) {
        var dir = this.judgeDir(x, y);
        this.dir = dir;
        if (dir == "v") {
            this.p2.x = this.p1.x;
            this.p2.y = y + 0.5;
        }
        if (dir == "h") {
            this.p2.x = x + 0.5;
            this.p2.y = this.p1.y;
        }
        this.p2.isOK = 1;
    };
    this.step = 0;
    this.isEnd = function() {
        return this.step == 3 ? true : false;
    };
    this.dx = function() {
        var dx = 0;
        if (this.p1.isOK && this.p2.isOK) {
            dx = this.p1.x - this.p2.x;
            dx = Math.round(Math.abs(dx));
        }
        return dx;
    };
    this.dy = function() {
        var dy = 0;
        if (this.p1.isOK && this.p2.isOK) {
            dy = this.p1.y - this.p2.y;
            dy = Math.round(Math.abs(dy));
        }
        return dy;
    };
    this.markPos = {
        x: 0,
        y: 0
    };
    //是否选中高亮
    this.light = 0;
    // 是否编辑状态
    this.isEdit = 0;
};

LengthMark.prototype.length = function() {
    var length = "";
    if (this.dir == "v") {
        length = this.dy();
    }
    if (this.dir == "h") {
        length = this.dx();
    }
    return length;
};

//计算长度标记的位置
LengthMark.prototype.calMarkPos = function() {
    var dir = this.dir,
        p1 = this.vP1,
        p2 = this.vP2;
    var x, y;
    if (dir == "v") {
        x = p1.x;
        y = Math.round((p1.y + p2.y) * 0.5);
    }
    if (dir == "h") {
        x = Math.round((p1.x + p2.x) * 0.5);
        y = p1.y;
    }
    this.markPos = {
        x: x,
        y: y
    };
};
//判断方向
LengthMark.prototype.judgeDir = function(x, y) {
    if (this.p1.isOK) {
        var p1 = this.p1;
        var dx = Math.abs(x - p1.x);
        var dy = Math.abs(y - p1.y);
        var tan = dy / dx;
        if (tan > 1)
            return "v";
        else
            return "h";
    }
};

//把存储坐标映射到显示屏坐标
LengthMark.prototype.mapCoords = function(mapFun){
        var _ = this;
        var p1 = _.p1;
        _.vP1 = mapFun(p1.x,p1.y);
        var p2 = _.p2;
        _.vP2 = mapFun(p2.x,p2.y);
    };

/*处理输入的数据 */
LengthMark.prototype.process = function(data) {
    switch (data.mouseType) {
        case "mousedown":
            if (this.step == 0) {
                this.setP1(data.x, data.y);
                this.step = 1;
            }
            break;
        case "mousemove":
            if (this.p1.isOK) {
                this.setP2(data.x, data.y);
                this.step = 2;
            }
            break;
        case "mouseup":
            if (this.step == 2) {
                this.setP2(data.x, data.y);
                this.step = 3;
            }
            break;
    }
};


LengthMark.prototype.draw = function(level) {
    var _ = this;
    if (_.step < 2)
        return;    
    var ctx = _.ctx;
    ctx.save();
    if(_.light){
        ctx.shadowColor = "#666666";
        ctx.shadowBlur = 10;
    }
    ctx.lineWidth = 1;
    if(_.isRetina){
        ctx.lineWidth =2;
    }
    _.drawMark();
    _.drawNode();
    _.light && _.drawEars();
    //编辑状态要需要展示虚线
    (_.step == 2||_.isEdit) && _.drawDottedLine();
    ctx.restore();
};

/*绘制节点 */
LengthMark.prototype.drawNode = function() {
    var ctx = this.ctx,
        p1 = this.vP1,
        p2 = this.vP2,
        hh = 5;
    ctx.beginPath();
    if(this.isRetina){
        hh = 10;
    }
    if (this.dir == "v") {
        ctx.moveTo(p1.x - hh, p1.y);
        ctx.lineTo(p1.x + hh, p1.y);
        ctx.moveTo(p2.x - hh, p2.y);
        ctx.lineTo(p2.x + hh, p2.y);
    }
    if (this.dir == "h") {
        ctx.moveTo(p1.x, p1.y - hh);
        ctx.lineTo(p1.x, p1.y + hh);
        ctx.moveTo(p2.x, p2.y - hh);
        ctx.lineTo(p2.x, p2.y + hh);
    }
    ctx.stroke();
    ctx.closePath();
};

/*绘制标注*/  
LengthMark.prototype.drawMark = function() {
    var ctx = this.ctx,
        me = this,
        length = this.length(),
        p1 = this.vP1,
        p2 = this.vP2;
    
    ctx.font = "16px arial";
    if(me.isRetina){
        ctx.font = "32px arial";
    }

    var mtxt = this.ctx.measureText(length);
    ctx.strokeStyle = '#FE1616';
    ctx.beginPath();
    
    //绘制线
    var x1 = p1.x,
        y1 = p1.y,
        x2 = p2.x,
        y2 = p2.y;
    //如果第一个点在第二个点下方 互换
    if (p1.x + p1.y > p2.x + p2.y) {
        x1 = p2.x;
        y1 = p2.y;
        x2 = p1.x;
        y2 = p1.y;
    }
    if (length > 20) { //大于20内连接
        if (this.dir == "v") {
            var my = Math.round((p1.y + p2.y) * .5);
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, my-10);
            ctx.moveTo(x2, my+10);
            ctx.lineTo(x2, y2);
        }
        if (this.dir == "h") {
            var mx = Math.round((p1.x + p2.x) * .5);
            var hw = mtxt.width*0.5;
            ctx.moveTo(x1, y1);
            ctx.lineTo(mx-hw, y1);
            ctx.moveTo(mx+hw, y2);
            ctx.lineTo(x2, y2);
        }
    } else { //小于20外连接
        if (this.dir == "v") {
            ctx.moveTo(x1, y1-6);
            ctx.lineTo(x1, y1);
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2, y2+6);
        }
        if (this.dir == "h") {
            ctx.moveTo(x1-6, y1);
            ctx.lineTo(x1, y1);
            ctx.moveTo(x2+6, y2);
            ctx.lineTo(x2, y2);
        }
    }
    ctx.stroke();
    ctx.closePath();

    var mx = 0,
        my = 0;
    this.calMarkPos();
    if(length > 20){
        mx = this.markPos.x - mtxt.width * 0.5;
        my = this.isRetina? this.markPos.y+12 : this.markPos.y + 6;
    }else{
        if (this.dir == "v") {
            mx = this.markPos.x + 10;
            my = this.markPos.y + 6;
        }
        if (this.dir == "h") {
            mx = this.markPos.x - mtxt.width * 0.5;
            my = this.markPos.y - 10;
        }
    }
    ctx.fillStyle = '#FE1616';
    ctx.fillText(length, mx, my);
};

/*绘制虚线*/ 
LengthMark.prototype.drawDottedLine = function() {
    var ctx = this.ctx,
        p1 = this.vP1,
        p2 = this.vP2;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5]);
    if (this.dir == "v") {
        ctx.moveTo(p1.x - 1000, p1.y);
        ctx.lineTo(p1.x + 1000, p1.y);
        ctx.moveTo(p2.x - 1000, p2.y);
        ctx.lineTo(p2.x + 1000, p2.y);
    }
    if (this.dir == "h") {
        ctx.moveTo(p1.x, p1.y - 1000);
        ctx.lineTo(p1.x, p1.y + 1000);
        ctx.moveTo(p2.x, p2.y - 1000);
        ctx.lineTo(p2.x, p2.y + 1000);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
};


/*绘制耳朵*/ 
LengthMark.prototype.calEars = function(){
    var p1 = Object.assign({}, this.vP1),
        p2 = Object.assign({}, this.vP2),
        dir = this.dir,
        _ = this,
        muli = _.isRetina?2:1;
    var le = {node:_.p1,},
        re = {node:_.p2};

    if(dir == "v"){
        if(p1.y > p2.y){
            var t = p2.y;
            p2.y = p1.y;
            p1.y = t;
            le.node = _.p2;
            re.node = _.p1;
        }
        le.x = p1.x-5*muli;
        le.y = p1.y-20*muli;
        re.x = p2.x-5*muli;
        re.y = p2.y+10*muli;
    }
    if(dir == "h"){
         if(p1.x > p2.x){
            var t = p2.x;
            p2.x = p1.x;
            p1.x = t;
            le.node = _.p2;
            re.node = _.p1;
        }
        le.x = p1.x-20*muli;
        le.y = p1.y-5*muli;
        re.x = p2.x+10*muli;
        re.y = p2.y-5*muli;
    }
    return {
        e1:le,
        e2:re
    }
};

/*绘制耳朵*/ 
LengthMark.prototype.drawEars = function(){
    var ctx = this.ctx,
        _ = this;
    var ears = _.calEars();
    var earSize = 10;
    if(_.isRetina)
        earSize = 20;
    ctx.strokeRect(ears.e1.x,ears.e1.y,earSize,earSize);
    ctx.strokeRect(ears.e2.x,ears.e2.y,earSize,earSize);
    //选中高亮
    if(_.lightEar && _.lightEar === ears.e1.node){
        ctx.fillRect(ears.e1.x,ears.e1.y,earSize,earSize);
    }
    if(_.lightEar && _.lightEar === ears.e2.node){
        ctx.fillRect(ears.e2.x,ears.e2.y,earSize,earSize);
    }
};

//hover状态
LengthMark.prototype.setLight = function(){
    this.light = 1;
};

LengthMark.prototype.clearLight = function(){
    this.light = 0;
    this.lightEar = 0;
};

//感应区域 测试鼠标是否在感应范围
LengthMark.prototype.hitTest = function(x,y){
    var _ = this,
        dir = this.dir,
        hit = 0,
        p1 = _.p1,
        p2 = _.p2,
        buffer = 5,
        el = 20;//感应扩大到耳朵位置
    if(_.isRetina){
        el *= 2;
        buffer *= 2;
    }
    if(dir == "v"){
        var hitx = p1.x - buffer <= x && p1.x + buffer >= x ;
        var hity = ( p1.y-el <= y && p2.y+el >= y ) || ( p2.y-el <= y && p1.y+el >= y );
        hit = hitx && hity;
    }
    if(dir == "h"){
        var hity = p1.y - buffer <= y && p1.y + buffer >= y ;
        var hitx = ( p1.x-el <= x && p2.x+el >= x ) || ( p2.x-el <= x && p1.x+el >= x );
        hit = hitx && hity;
    }

    return hit;
};

//移动位置
LengthMark.prototype.move = function(mx,my){
    var p1 = this.p1,
        p2 = this.p2;
    p1.x += mx;
    p1.y += my;
    p2.x += mx;
    p2.y += my;
}

//检查是否感应到耳朵位置
LengthMark.prototype.lightEar = 0;//0-没有选中 
LengthMark.prototype.earTouch = function(x,y){
    var _ = this,
        dir = this.dir,
        earSize = 10;
    if(_.isRetina){
        x = x*2;
        y = y*2;
        earSize = earSize*2;
    }
    //计算耳朵位置
    var ears = _.calEars(),
        e1 = ears.e1,
        e2 = ears.e2;
    if(e1.x <= x && e1.x + earSize >= x && e1.y <= y && e1.y + earSize >= y){
        _.lightEar = e1.node;
    }
    if(e2.x <= x && e2.x + earSize >= x && e2.y <= y && e2.y + earSize >= y){
        _.lightEar = e2.node;
    }
}

LengthMark.prototype.order = 0;
LengthMark.prototype.freezNodeOrder = function(){
    var _ = this,
        dir = this.dir,
        node = _.lightEar,
        other = _.p1;
    if(node === _.p1){
        other = _.p2;
    }
    if(dir == "v"){
        this.order = other.y > node.y;
    }
    if(dir == "h"){
        this.order = other.x > node.x
    }

}
//移动节点
LengthMark.prototype.moveNode = function (mx, my) {
    var _ = this,
        dir = this.dir,
        node = _.lightEar,
        other = _.p1;
    if(node === _.p1){
        other = _.p2;
    }
    if(dir == "v"){
        if(_.order == other.y > node.y+my)
            node.y += my;
    }
    if(dir == "h"){
        if(_.order == other.x > node.x+mx)
            node.x += mx;         
    }        
}

module.exports = LengthMark;

