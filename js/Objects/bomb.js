/* global XEngine Bullet Player HealPack Point*/
var Bomb = function(game, posX, posY, sprite, bullets, pickups, points){
    XEngine.Sprite.call(this, game, posX, posY, sprite);
    this.anchor.setTo(0.5);
    this.game.physics.enablePhysics(this);
    this.bullets = bullets;                                                     //Referencia al grupo de balas
    this.points = points;                                                       //Referencia al grupo de puntos
    this.pickups = pickups;                                                     //Referencia al grupo de pickups
    this.acceleration = 300;
    this.health = 55 * (game.state.currentState.phase * 1.75);
    this.body.gravity = 0;
    this.body.staticFriction = 0;
    this.body.bounds.width = 15;
    this.timeToExplode = 5500;                                                  //Tiempo que tarda en explotar
};

Bomb.prototype = Object.create(XEngine.Sprite.prototype);

Bomb.prototypeExtends = {
    
    start: function () {
        this.game.tween.add(this.position).to({x: this.game.width / 2}, 2500, XEngine.Easing.ExpoInOut, true); //El enemigo se mueve al centro con un tween
    },
    
    update: function (deltaTime) {
        if(this.timeToExplode <= 0){
            this.explode();                                                     //Si pasa el tiempo estipulado, el enemigo explota
        }else{
            this.timeToExplode-= this.game.deltaMillis;
        }
    },
    
    explode: function () {                                  
        //Disparamos valas en todas direcciones
        for(var i = 0; i< 360; i+=18){
            var bullet = new Bullet(this.game, this.position.x, this.position.y, 'enemyBullet');
            var rotInRadians = i * (Math.PI / 180);
            bullet.body.velocity.x = Math.cos(rotInRadians) * 170;
            bullet.body.velocity.y = Math.sin(rotInRadians) * 170;
            bullet.rotation = i - 180;
            this.bullets.add(bullet);
            this.destroy();
        }
    },
    
    applyDamage: function (damage) {                                            //Recibimos el daño
        this.health -= damage;
        if(this.health <= 0){                                                   //Si la vida baja de 0, el enemigo muere
            this.die(); 
        }
    },

    
    die: function () {
        var audio = this.game.add.audio('explosion', true);
        var loot = XEngine.Mathf.randomIntRange(0, 100) > 70;
        this.spawnPoints();
        if(loot){
            this.pickups.add(new HealPack(this.game, this.position.x, this.position.y));
        }
        audio.onComplete.addOnce(function () {
            audio.destroy(); 
        });
        this.destroy();
    },
    
    spawnPoints: function () {
        var pointsToSpanw = XEngine.Mathf.randomIntRange(5, 10);
        
        for(var i = 0; i < pointsToSpanw; i++){
            var point = this.points.getFirstDead();
            if(point != null){
                point.reset(this.position.x, this.position.y);
            }else{
                point = this.points.add(new Point(this.game, this.position.x, this.position.y));
            }
            
            point.velocity.x = XEngine.Mathf.randomIntRange(-250, 250);
            point.velocity.y = XEngine.Mathf.randomIntRange(-250, 250);
            point.waitTime = 0.6;
        }
    }
};

Object.assign(Bomb.prototype, Bomb.prototypeExtends);
