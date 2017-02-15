/* global XEngine Bullet Player HealPack Ammo*/
var Enemy = function(game, posX, posY, sprite, bullets, pickups, points, target){
    XEngine.Sprite.call(this, game, posX, posY, sprite);
    this.scale.setTo(0.5);
    this.anchor.setTo(0.5);
    this.game.physics.enablePhysics(this);                                      //Habilitamos las fisicas para las colisiones
    this.bullets = bullets;                                                     //Referencia al grupo de balas
    this.points = points;                                                       //Referencia al grupo de puntos
    this.target = target;                                                       //Referencia al objetivo
    this.pickups = pickups;                                                     //Referencia al grupo de pickups
    this.health = 30 * (game.state.currentState.phase * 1.5);
    this.body.velocity.x = -120;
    this.body.gravity = 0;
    this.body.staticFriction = 0;
    this.body.bounds.width = 15;
    this.minShootRate = 1000;                                                   
    this.maxShootRate = 2500; 
    this.timeToNextShoot = XEngine.Mathf.randomRange(this.minShootRate, this.maxShootRate);       //Tiempo para siguiente disparo es random entre el min y el max
};

Enemy.prototype = Object.create(XEngine.Sprite.prototype);

Enemy.prototypeExtends = {
    update: function (deltaTime) {
        if(this.position.x <= 0 - this.width){
            this.destroy();
            return;
        }
        if(this.timeToNextShoot <= 0){
            this.shoot();
            this.timeToNextShoot = XEngine.Mathf.randomRange(this.minShootRate, this.maxShootRate);       //Tiempo para siguiente disparo es random entre el min y el max
        }else{
            this.timeToNextShoot-= this.game.deltaMillis;
        }
    },
    
    shoot: function () {                                                        //Disparamos a la dirección del jugador
        var bullet = new Bullet(this.game, this.position.x, this.position.y, 'enemyBullet');
            
        // Calculate the angle to the target
        var rotation = XEngine.Mathf.angleBetween(this.position.x, this.position.y, this.target.position.x, this.target.position.y);
        bullet.body.velocity.x = Math.cos(rotation) * 200;
        bullet.body.velocity.y = Math.sin(rotation) * 200;
        bullet.rotation = rotation * (180 / Math.PI) - 180;
        this.bullets.add(bullet);
    },
    
    applyDamage: function (damage) {                                            //Recibimos el daño
        this.health -= damage;
        if(this.health <= 0){                                                   //Si la vida baja de 0, el enemigo muere
            this.die(); 
        }
    },
    
    onCollision: function (other) {                                             
      if(Player.prototype.isPrototypeOf(other)){                                //Si colisionamos con un jugador, le aplicamos daño
          other.applyDamage(10);
      }  
    },
    
    die: function () {
        var audio = this.game.add.audio('explosion', true);                     //Reproducimos sonido de explosión
        var loot = XEngine.Mathf.randomIntRange(0, 100) > 70;                   //Probabilidad del 30% de que se produzca un drop
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
        var pointsToSpanw = XEngine.Mathf.randomIntRange(5, 10);                //Soltamos entre 5 y 10 objetos de puntos
        
        for(var i = 0; i < pointsToSpanw; i++){
            var point = this.points.getFirstDead();
            if(point != null){
                point.reset(this.position.x, this.position.y);
            }else{
                point = this.points.add(new Point(this.game, this.position.x, this.position.y));
            }
            
            point.velocity.x = XEngine.Mathf.randomIntRange(-250, 250);         //Se dispersan a velocidades aleatorias
            point.velocity.y = XEngine.Mathf.randomIntRange(-250, 250);
            point.waitTime = 0.6;
        }
    }
};

Object.assign(Enemy.prototype, Enemy.prototypeExtends);
