//Para quitar warnings por las cosas que están en otro js
/* global Player Enemy ENEMY_SPAWN Bomb*/
var SpaceWars = function (game) {
	this.rateSpawn = 3000; 														//Ratio de aparición de enemigos en millis
	this.timeToNextSpawn = 0;
	this.spawnIndex = 0;
};

SpaceWars.prototype = {

	start: function () {
		this.game.physics.startSystem();										//Iniciamos el motor de físicas
		this.game.onWindowsResize.add(this.onResize, this);						//Evento para que cuando se cambie el tamaño de la pantalla, modifiquemos el tamaño del fondo y no quede negro
		this.music = this.game.add.audio('background', true);
		this.music.setVolume(0.5);
		this.music.loop(true);
		this.setBackground();
		this.setGroups();
		this.setPlayer();
		this.setUI();
		this.phase = 1;
	},
	
	update : function (deltaTime) {
		this.updateBackground(deltaTime);
		this.updateSpawn();
		if(this.player.alive){
			this.runOverlaps();
		}						
		this.healthText.text = this.player.health + '';							//Actualizamos los textos con los valores que tocan
		this.scoreText.text = this.player.score + '';
	},
	
	updateBackground: function (deltaTime) {
		this.nebulae.offSet.x -= 45 * deltaTime;								//Movemos los background hacía la izquierda a diferentes velocidades para conseguir un efecto parallax
		this.starfield.offSet.x -= 30 * deltaTime;
	},
	
	updateSpawn: function () {
		if(this.timeToNextSpawn <= 0){											//Actualizamos el spawn de enemigos
			var enemiesSpawn = ENEMY_SPAWN[this.spawnIndex];					//Obtenemos el set de enemigos a hacer spawn
			if(enemiesSpawn){													//Si existe, es que todavía queda partida por delante								
				for(var i = 0; i < enemiesSpawn.length; i++){
					this.spawnEnemy(enemiesSpawn[i], i);
				}
				this.spawnIndex++;
				if(this.spawnIndex > 20 && this.phase == 1){					//Cambiamos de fase (Enemigos con mayor vida)
					this.phase = 2;
				}
				if(this.spawnIndex > 40 && this.phase == 2){
					this.phase = 3;
				}
			}else{																//En caso de que no haya spawn, hemos llegado al final
				this.playerWin();
			}
			this.timeToNextSpawn = this.rateSpawn;
		}else{
			this.timeToNextSpawn-= this.game.deltaMillis;
		}
	},
	
	playerWin: function () {
		var gameOver = this.game.add.text(this.game.width /2, this.game.height/2, 'YOU WIN!!', 40, 'Play', 'rgb(200,30,30)');
		gameOver.anchor.setTo(0.5);
		gameOver.style = 'bold';												//Un poco de estilo
		gameOver.strokeColor = 'black';
		gameOver.strokeWidth = 3;
		this.music.stop();
		this.game.input.onInputDown.addOnce(function () {
			this.game.state.start('menu');
		}, this);
	},
	
	runOverlaps: function () {
		this.game.physics.overlap(this.player, this.enemies);					//Llamamos al overlap para que los objetos "colisionen"
		this.game.physics.overlap(this.player, this.enemiesBullets);
		this.game.physics.overlap(this.enemies, this.playerBullets);
		this.game.physics.overlap(this.player, this.pickups);
		
	},
	
	setBackground: function () {
		this.starfield = this.game.add.tilled(0, 0, 'star_field', this.game.width, this.game.height); //Añadimos el campo de estrellas
		this.nebulae = this.game.add.tilled(0, 0, 'nebulae', this.game.width, this.game.height);// Añadimos la nebulosa
		this.nebulae.offSet.y -= 400;											//Movemos la nebulosa un poco hacía arriba para que no se vea el borde de la imagen
	},
	
	setGroups: function () {
		this.playerBullets = this.game.add.group();								//Grupo de balas del jugador
		this.enemiesBullets = this.game.add.group();							//Grupo de balas de los enemigos
		this.enemies = this.game.add.group();									//Grupo de enemigos
		this.points = this.game.add.group();									//Grupo de puntos
		this.pickups = this.game.add.group();									//Grupo de pickups
	},
	
	setPlayer: function () {
		this.player = this.game.add.existing(new Player(this.game, 100, 100, 'player', this.playerBullets, this, this.points));	//Creamos el jugador
	},
	
	setUI: function () {
		//Texto que indica que el valor mostrado es la vida
		var healthLabel = this.game.add.text(30, 10, 'Health:', 20, 'Play', 'rgb(200,30,30)');
		healthLabel.style = 'bold';												//Un poco de estilo
		healthLabel.strokeColor = 'black';
		healthLabel.strokeWidth = 3;
		
		//Texto que muestra la vida que queda
		this.healthText = this.game.add.text(healthLabel.position.x + healthLabel.width + 10, 10, this.player.health, 20, 'Play', 'rgb(200,30,30)');
		this.healthText.style = 'bold';											//Un poco de estilo
		this.healthText.strokeColor = 'black';
		this.healthText.strokeWidth = 3;
		
		var scoreLabel = this.game.add.text(550, 10, 'Score:', 20, 'Play', 'rgb(200,30,30)');
		scoreLabel.style = 'bold';												//Un poco de estilo
		scoreLabel.strokeColor = 'black';
		scoreLabel.strokeWidth = 3;
		
		//Texto que muestra la vida que queda
		this.scoreText = this.game.add.text(scoreLabel.position.x + scoreLabel.width + 10, 10, this.player.score, 20, 'Play', 'rgb(200,30,30)');
		this.scoreText.style = 'bold';											//Un poco de estilo
		this.scoreText.strokeColor = 'black';
		this.scoreText.strokeWidth = 3;
	},
	
	notifyGameOver: function () {
		var gameOver = this.game.add.text(this.game.width /2, this.game.height/2, 'GAME OVER', 40, 'Play', 'rgb(200,30,30)');
		gameOver.anchor.setTo(0.5);
		gameOver.style = 'bold';												//Un poco de estilo
		gameOver.strokeColor = 'black';
		gameOver.strokeWidth = 3;
		this.music.stop();
		this.game.input.onInputDown.addOnce(function () {
			this.game.state.start('menu');
		}, this);
	},
	
	spawnEnemy: function (type, row) {
		if(type == 0) return;
		var enemyPosY = row * 80 + 100;
		var enemy = null;
		//Según el tipo de enemigo, hacemos spawn de uno u otro
		switch(type){
			case 1:
				enemy = new Enemy(this.game, this.game.width + 60, enemyPosY, 'enemy', this.enemiesBullets, this.pickups, this.points, this.player);
				break;
			case 2:
				enemy = new Bomb(this.game, this.game.width + 60, enemyPosY, 'enemy', this.enemiesBullets, this.pickups, this.points);
		}
		this.enemies.add(enemy);
	},
};