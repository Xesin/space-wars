/* global XEngine */
var HealPack = function(game, posX, posY){
    XEngine.Sprite.call(this, game, posX, posY, 'healPack');
    this.anchor.setTo(0.5);
    this.game.physics.enablePhysics(this);
    this.body.gravity = 0;
    this.body.staticFriction = 0;
    this.body.velocity.x= -30;
    this.amount = 25;
};

HealPack.prototype = Object.create(XEngine.Sprite.prototype);

HealPack.prototypeExtends = {
    
};

Object.assign(HealPack.prototype, HealPack.prototypeExtends);
