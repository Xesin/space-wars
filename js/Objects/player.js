/* global XEngine Bullet HealPack*/
var Player = function(game, posX, posY, sprite, bullets, state, points){
    XEngine.Sprite.call(this, game, posX, posY, sprite);
    this.state = state;                                                         //Guardamos la referencia del estado para notificar de la muerte del jugador
	this.scale.setTo(0.3);
	this.anchor.setTo(0.5);											            //Lo anclamos al centro
    this.game.physics.enablePhysics(this);                                      //Habilitamos las físicas para este objeto
    this.bullets = bullets;                                                     //Guardamos una referencia al grupo de balas
    this.acceleration = 300;
    this.health = 100;
    this.shootRate = 0.35;                                                       //Cada cuanto disparamos
    this.minShootRate = 0.05;
    this.shootTimer = this.shootRate;                                           //Inicializamos el timer con el valor del shoot rate para que podamos disparar desde el primer momento
    this.body.gravity = 0;
    this.body.staticFriction = 250;
	this.body.maxVelocity = 450;
	this.body.collideWithWorld = true;                                          //Evitamos que salta de los límites del mundo
	this.body.bounds.width = 30;
	this.body.bounds.height = 30;
	this.points = points;
	this.score = 0;
	this.shootRatePowerUps = 0;
	this.invulnerable = false;
};

Player.prototype = Object.create(XEngine.Sprite.prototype);

Player.prototypeExtends = {
    update: function (deltaTime) {
        this.shootTimer += deltaTime;                                           //Incrementamos el tiempo que hemos pasado sin disparar
        //Si el puntero está apretado, intenamos alcanzar dicho puntero con una velocidad que se reduce linealmente cuanto más cerca estámos de dicho puntero
        if(this.game.input.isDown){           
            
            var origin = new XEngine.Vector(this.body.position.x - 30, this.body.position.y);
            
            var distance = XEngine.Vector.distance(origin, this.game.input.pointer);
            //Para no estar siempre calculando la velocidad hacemos este if
            if (distance > 5) {
                //Obtenemos el angulo hacia el obetivo
                var rotation = XEngine.Mathf.angleBetween(origin.x, origin.y, this.game.input.pointer.x, this.game.input.pointer.y);
                
                //Ajustamos la velocidad según el angulo que obtengamos
                this.body.velocity.x = XEngine.Mathf.lerp(0, Math.cos(rotation) * this.body.maxVelocity, distance/50);
                this.body.velocity.y = XEngine.Mathf.lerp(0, Math.sin(rotation) * this.body.maxVelocity, distance/50);
            } else {
                this.body.velocity.setTo(0, 0);
            }
            //No queremos fricción que modifique nuestra velocidad mientras estámos moviendo la nave
            this.body.staticFriction = 0;
            
            //Actualizamos los disparos
            this.shootUpdate();
		}else{
		    this.body.staticFriction = 900;
		}
		
		//Si está en modo invulnerable, la nave parpadea
		if(this.invulnerable){
		    this.timeInInvulnerable -= this.game.deltaMillis;
		    var rad = (this.timeInInvulnerable * (Math.PI / 180)) / 1.5;
	        if(Math.sin(rad) >= 0){
	            this.render = false;
	        }else{
	            this.render = true;
	        }
	        //Si ha pasado el tiempo estipulado, lo volvemos vulnerable
		    if(this.timeInInvulnerable <= 0){
		        this.invulnerable = false;
		        this.render = true;
		    }
		}
    },
    
    shootUpdate: function () {
        if(this.shootRatePowerUps <= 100){
    		if(this.shootTimer >= (this.shootRate - (this.shootRatePowerUps * 0.003))){
    		    this.shoot();
    		}
        }else if (this.shootRatePowerUps <= 200){
            if(this.shootTimer >= (this.shootRate - (this.shootRatePowerUps * 0.0015))){
    		    this.doubleShoot();
    		}
        }else{
            if(this.shootTimer >= XEngine.Mathf.clamp(this.shootRate - (this.shootRatePowerUps * 0.001), this.minShootRate, this.shootRate)){                              //Solo disparamos si el puntero está apretado y ha pasado cierto tiempo entre disparo y disparo
    		    this.tripleShoot();
    		}
        }
    },
    
    shoot: function () {
        this.shootTimer = 0;
        var bullet = new Bullet(this.game, this.position.x, this.position.y, 'playerBullet');
        bullet.body.velocity.x = 750;
        this.bullets.add(bullet);
    },
    
    doubleShoot: function () {
        this.shootTimer = 0;
        var bullet = new Bullet(this.game, this.position.x, this.position.y - 15, 'playerBullet');
        bullet.body.velocity.x = 750;
        this.bullets.add(bullet);
        bullet = new Bullet(this.game, this.position.x, this.position.y + 15, 'playerBullet');
        bullet.body.velocity.x = 750;
        this.bullets.add(bullet);
    },
    
     tripleShoot: function () {
        this.shootTimer = 0;
        var bullet = new Bullet(this.game, this.position.x, this.position.y - 15, 'playerBullet');
        bullet.body.velocity.x = 750;
        this.bullets.add(bullet);
        bullet = new Bullet(this.game, this.position.x, this.position.y + 15, 'playerBullet');
        bullet.body.velocity.x = 750;
        this.bullets.add(bullet);
        bullet = new Bullet(this.game, this.position.x + 10, this.position.y, 'playerBullet');
        bullet.body.velocity.x = 750;
        this.bullets.add(bullet);
    },
    
    applyDamage: function (damage) {                                            //Aplicamos el daño que recibimos
        if(this.invulnerable) return;
        this.health -= damage;
        if(this.health <= 0){                                                   //Si vida llega a 0, morimos
            this.die();
        }
        this.spawnPoints();                                                     //Soltamos los puntos acumulados
        this.invulnerable = true;                                               //Cuandos nos dan, nos volvemos invulnerables por un tiempo
        this.timeInInvulnerable = 1200;
    },
    
    onCollision:function function_name(other) {                                 //Colisiones con los pickups
        if(HealPack.prototype.isPrototypeOf(other)){                            //Si es vida, la aumentamos
            if(this.health <= 0) return;
            this.health += other.amount;
            this.health = XEngine.Mathf.clamp(this.health, 0, 100);
            other.destroy();
        }
    },
    
    die: function () {
        this.kill();
        this.state.notifyGameOver();
    },
    
    collectPoint: function (point) {
        point.kill();
        this.score += point.value;
        this.shootRatePowerUps++;
    },
    
    spawnPoints: function () {
        var pointsToSpawn = Math.floor(this.shootRatePowerUps * 0.35);          //Sólo soltamos el 35% de los puntos acumulados
        
        for(var i = 0; i < pointsToSpawn; i++){
            var point = this.points.getFirstDead();
            if(point != null){
                point.reset(this.position.x, this.position.y);
            }else{
                point = this.points.add(new Point(this.game, this.position.x, this.position.y));
            }
            
            point.velocity.x = XEngine.Mathf.randomIntRange(-250, 250);         //Se dispersan a velocidades aleatorias
            point.velocity.y = XEngine.Mathf.randomIntRange(-250, 250);
            point.waitTime = 0.6;                                               //Esperan 0.6 segundos a poder ser recogidas
        }
        this.shootRatePowerUps = 0;
    }
};

Object.assign(Player.prototype, Player.prototypeExtends);
