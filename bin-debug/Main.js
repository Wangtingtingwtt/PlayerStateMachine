//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    //private textfield:egret.TextField;
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var sky = this.createBitmapByName("bj_out1_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        this.player = new Player();
        this.addChild(this.player);
        //this.player.Idle();
        this.player.x = 500;
        this.player.y = 700;
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.MoveCur, this);
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        //RES.getResAsync("description_json", this.startAnimation, this)
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.MoveCur = function (e) {
        this.player.Move(e.stageX, e.stageY);
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.call(this);
        this.StaMac = new StaMachine;
        this.MoveSpeed = 30;
        this.Model = 0;
        this.IdleAni = new Array();
        this.MoveAni = new Array();
        this.pic = this.createBitmapByName("j1_png");
        this.addChild(this.pic);
        this.LoadAni();
        this.anchorOffsetX = this.pic.width / 2;
        this.anchorOffsetY = this.pic.height / 2;
    }
    var d = __define,c=Player,p=c.prototype;
    p.LoadAni = function () {
        var texture = RES.getRes("j1_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("j2_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("j3_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("j4_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("t1_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("t2_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("t3_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("t4_png");
        this.MoveAni.push(texture);
    };
    p.PlayAni = function (Ani) {
        var count = 0;
        var Bit = this.pic;
        var M = this.Model;
        var timer = new egret.Timer(125, 0);
        timer.addEventListener(egret.TimerEvent.TIMER, Play, this);
        timer.start();
        function Play() {
            Bit.texture = Ani[count];
            if (count < Ani.length - 1) {
                count++;
            }
            else {
                count = 0;
            }
            if (this.Model != M) {
                timer.stop();
            }
        }
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    p.Idle = function () {
        var IC = new IdleSta(this);
        this.StaMac.Reload(IC);
    };
    p.Move = function (x, y) {
        var MC = new MoveCur(x, y, this);
        this.StaMac.Reload(MC);
    };
    return Player;
}(egret.DisplayObjectContainer));
egret.registerClass(Player,'Player');
var MoveCur = (function () {
    function MoveCur(x, y, player) {
        this.Ty = y;
        this.Tx = x;
        this.player = player;
    }
    var d = __define,c=MoveCur,p=c.prototype;
    p.Load = function () {
        var _this = this;
        this.player.Model++;
        var xx = this.Tx - this.player.x;
        var yy = this.Ty - this.player.y;
        if (xx > 0) {
            this.player.scaleX = -1;
        }
        else {
            this.player.scaleX = 1;
        }
        var zz = Math.pow(xx * xx + yy * yy, 0.5);
        var time = zz / this.player.MoveSpeed;
        this.timer = new egret.Timer(50, time);
        this.LeastTime = time;
        this.timer.addEventListener(egret.TimerEvent.TIMER, function () {
            _this.player.x += xx / time;
            _this.player.y += yy / time;
            _this.LeastTime--;
            if (_this.LeastTime < 1) {
                _this.timer.stop();
                if (_this.LeastTime > -10) {
                    _this.player.Idle();
                }
            }
        }, this);
        this.timer.start();
        this.player.PlayAni(this.player.MoveAni);
    };
    p.exit = function () {
        this.LeastTime = -10;
    };
    return MoveCur;
}());
egret.registerClass(MoveCur,'MoveCur',["Sta"]);
var IdleSta = (function () {
    function IdleSta(player) {
        this.player = player;
    }
    var d = __define,c=IdleSta,p=c.prototype;
    p.Load = function () {
        this.player.Model = 0;
        this.player.PlayAni(this.player.IdleAni);
    };
    p.exit = function () {
    };
    return IdleSta;
}());
egret.registerClass(IdleSta,'IdleSta',["Sta"]);
var StaMachine = (function () {
    function StaMachine() {
    }
    var d = __define,c=StaMachine,p=c.prototype;
    p.Reload = function (s) {
        if (this.StaCur) {
            this.StaCur.exit();
        }
        this.StaCur = s;
        this.StaCur.Load();
    };
    return StaMachine;
}());
egret.registerClass(StaMachine,'StaMachine');
//# sourceMappingURL=Main.js.map