/* global XEngine*/
var Point = function(game, posX, posY){
    XEngine.Sprite.call(this, game, posX, posY, 'playerBullet');
	this.anchor.setTo(0.5);											            //Lo anclamos al centro
	this.velocity = new XEngine.Vector(0, 0);
	this.value = 10;                                                            //Puntos que suma
	this.waitTime = 1.5;                                                        //Tiempo que espera a poder ser recogido
};

Point.prototype = Object.create(XEngine.Sprite.prototype);

Point.prototypeExtends = {
    update: function (deltaTime) {
        var _this = this;                                                       //Se mueven lentamente
        _this.position.x += _this.velocity.x * deltaTime;
        _this.position.y += _this.velocity.y * deltaTime;
        
        _this.updateVelocity(deltaTime);
		
    },
    
    updateVelocity: function (deltaTime) {
        var _this = this;
        var player = _this.game.state.currentState.player;
        
        var distance = XEngine.Vector.distance(player.position, _this.position);
        
        if(distance < 100 && _this.waitTime <= 0){                              //Si están cerca del jugador van hacía él como si los atrayera
            if(distance < 10){
                player.collectPoint(_this);
                return;
            }
            var rotation = XEngine.Mathf.angleBetween(_this.position.x, _this.position.y, player.position.x, player.position.y);
            _this.velocity.x = XEngine.Mathf.lerp(Math.cos(rotation) * 600, 0, distance/200);
            _this.velocity.y = XEngine.Mathf.lerp(Math.sin(rotation) * 600, 0, distance/200);
        }else{
            if(_this.velocity.x != 0){                                          //Si no está cerca del player, se le reduce la velocidad poco a poco
            var signX = _this.velocity.x / Math.abs(_this.velocity.x);
    		var newVelocityX = XEngine.Mathf.clamp(Math.abs(_this.velocity.x) - 500 * deltaTime, 0, 10000);
    		newVelocityX *= signX;												//Se le aplica el signo
    		_this.velocity.x = newVelocityX;
            }
    		
    		if(_this.velocity.y != 0){
        		var signY = _this.velocity.y / Math.abs(_this.velocity.y);			//Se obtiene el signo (dirección, negativa o positiva)
        		var newVelocityY = XEngine.Mathf.clamp(Math.abs(_this.velocity.y) - 500 * deltaTime, 0, 10000);//Se obtiene la nueva velocidad en valores positivos
        		newVelocityY *= signY;												//Se le aplica el signo
        		_this.velocity.y = newVelocityY;
    		}
    		_this.position.x += -30 * deltaTime;
        }
        _this.waitTime -= deltaTime;
    }
};

Object.assign(Point.prototype, Point.prototypeExtends);
