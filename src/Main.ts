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

class Main extends egret.DisplayObjectContainer {
 
    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private player:Player;
    //private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        var sky:egret.Bitmap = this.createBitmapByName("bj_out1_jpg");
        this.addChild(sky);
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        this.player = new Player();
        this.addChild(this.player);
        //this.player.Idle();
        this.player.x = 500
        this.player.y = 700;

        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP,this.MoveCur,this);

        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        //RES.getResAsync("description_json", this.startAnimation, this)
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */

    private MoveCur(e:egret.TouchEvent):void{
        this.player.Move(e.stageX,e.stageY);
    }

    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */

}

class Player extends egret.DisplayObjectContainer{
    public pic:egret.Bitmap;
    private StaMac:StaMachine = new StaMachine;
    public MoveSpeed:number = 30;
    public Model:number = 0;
    public IdleAni:Array<egret.Texture> = new Array<egret.Texture>();
    public MoveAni:Array<egret.Texture> = new Array<egret.Texture>();
    public constructor(){
        super();
        this.pic = this.createBitmapByName("j1_png");
        this.addChild(this.pic);
        this.LoadAni();
        this.anchorOffsetX = this.pic.width/2;
        this.anchorOffsetY = this.pic.height/2;
    }

    private LoadAni(){
        var texture:egret.Texture = RES.getRes("j1_png");
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
    }

    public PlayAni(Ani:Array<egret.Texture>){
        var count = 0;
        var Bit = this.pic;
        var M = this.Model;
        var timer:egret.Timer = new egret.Timer(125,0);
        timer.addEventListener(egret.TimerEvent.TIMER,Play,this);
        timer.start();
        function Play(){
            Bit.texture = Ani[count];
            if(count<Ani.length-1){
                count++;
            }
            else{
                count = 0;
            }
            if(this.Model!=M){
                timer.stop();
            }
        }
    }

    private createBitmapByName(name:string):egret.Bitmap{
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    public Idle(){
        var IC:IdleSta = new IdleSta(this);
        this.StaMac.Reload(IC);
    }

    public Move(x:number,y:number){
        var MC:MoveCur = new MoveCur(x,y,this);
        this.StaMac.Reload(MC);
    }
}

interface Sta{
    Load();
    exit();
}

class MoveCur implements Sta{
    private Tx:number;
    private Ty:number;
    private player:Player;
    private timer:egret.Timer;
    private LeastTime:number;
    constructor(x:number,y:number,player:Player){
        this.Ty = y;
        this.Tx = x;
        this.player = player;
    }
    Load(){
        this.player.Model++;
        var xx = this.Tx - this.player.x;
        var yy = this.Ty - this.player.y;
        if(xx>0){
            this.player.scaleX = -1;
        }
        else{
            this.player.scaleX = 1;
        }
        var zz = Math.pow(xx*xx+yy*yy,0.5);
        var time:number = zz/this.player.MoveSpeed;
        this.timer = new egret.Timer(50,time);
        this.LeastTime = time;
        this.timer.addEventListener(egret.TimerEvent.TIMER,()=>{
            this.player.x+=xx/time;
            this.player.y+=yy/time;
            this.LeastTime--;
            if(this.LeastTime<1){
                this.timer.stop();
                if(this.LeastTime>-10){
                    this.player.Idle();
                }
            }
        },this);
        this.timer.start();
        this.player.PlayAni(this.player.MoveAni);
    }
    exit(){
        this.LeastTime = -10;
    }
}


class IdleSta implements Sta{
    private player:Player;
    constructor(player:Player){
        this.player = player;
    }
    Load(){
        this.player.Model = 0;
        this.player.PlayAni(this.player.IdleAni);
    }
    exit(){

    }
}

class StaMachine{
    private StaCur:Sta;
    public Reload(s:Sta):void{
        if(this.StaCur){
            this.StaCur.exit();
        }
        this.StaCur = s;
        this.StaCur.Load();
    }
}