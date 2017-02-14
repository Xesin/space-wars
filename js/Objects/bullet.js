/* global XEngine */
var Bullet = function(game, posX, posY, sprite){
    XEngine.Sprite.call(this, game, posX, posY, sprite);
    this.anchor.setTo(0.5);
    this.game.physics.enablePhysics(this);
    this.body.gravity = 0;
    this.body.staticFriction = 0;
    this.body.maxVelocity = 1500;
    this.body.bounds.width = 40;
	this.body.bounds.height = 20;
    this.type = 0;
};

Bullet.prototype = Object.create(XEngine.Sprite.prototype);

Bullet.prototypeExtends = {
    
    update: function () {
        if(this.position.x > this.game.width){
            this.destroy();
        }else if(this.position.x < 0){
            this.destroy();
        }
    },
    
    onCollision: function (other) {
        other.applyDamage(10);                                                    //Aplicamos daño al objeto con el que colisionamos
        this.destroy();
    },
};

Object.assign(Bullet.prototype, Bullet.prototypeExtends);
