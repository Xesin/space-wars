//Para quitar warnings por las cosas que están en otro js
/* global XEngine SpaceWars*/

function initGame(){
   console.log('Arrancando El juego');
   var game = new XEngine.Game(800, 600, 'contenedor');							//iniciamos el juego
   game.frameLimit = 60;														
   game.setBackgroundColor('black');	
   game.state.add('menu', Menu);												//Añadimos el estado del menú
   game.state.add('space', SpaceWars);											//Añadimos el estado del juego
   game.state.start('menu');													//Arrancamos el estado
   game.scale.scaleType = XEngine.Scale.SHOW_ALL;
   game.scale.updateScale();
}

var Menu = function (game) {
	
};

Menu.prototype = {
	
	preload: function () {														//Cargamos los assets del juego
		this.game.load.image('player', 'img/player.png');
		this.game.load.image('playerBullet', 'img/PlayerBullet.png');
		this.game.load.image('enemyBullet', 'img/EnemyBullet.png');
		this.game.load.image('enemy', 'img/enemy.png');
		this.game.load.image('bomb', 'img/bomb.png');
		this.game.load.image('nebulae', 'img/nebulae.png');
		this.game.load.image('star_field', 'img/starfield.png');
		this.game.load.audio('explosion', 'audio/explosion.wav');
		this.game.load.audio('background', 'audio/background.mp3');
		this.game.load.image('ammoPack', 'img/AmmoPack.png');
		this.game.load.image('healPack', 'img/HealPack.png');
		this.game.load.image('title', 'img/title.png');
		
		var progressText = this.game.add.text(this.game.width/2, this.game.height/2, '0%', 20, 'Play', 'rgb(200,30,30)'); //Ponemos un texto para el progreso de la carga
		progressText.anchor.setTo(0.5);
		this.game.load.onCompleteFile.add(function (progress) {
			progressText.text = (progress * 100) + '%';							//Modificamos el texto para mostrar el progreso de la carga después de que un archivo sea cargado
		}, this);
	},
	
	start: function () {
		this.setBackground();
		this.setUI();
	},
	
	update : function (deltaTime) {
		this.updateBackground(deltaTime);
	},
	
	updateBackground: function (deltaTime) {
		this.nebulae.offSet.x -= 45 * deltaTime;								//Movemos los background hacía la izquierda a diferentes velocidades para conseguir un efecto parallax
		this.starfield.offSet.x -= 30 * deltaTime;
	},
	
	setBackground: function () {
		this.starfield = this.game.add.tilled(0, 0, 'star_field', this.game.width, this.game.height); //Añadimos el campo de estrellas
		this.nebulae = this.game.add.tilled(0, 0, 'nebulae', this.game.width, this.game.height);// Añadimos la nebulosa
		this.nebulae.offSet.y -= 400;											//Movemos la nebulosa un poco hacía arriba para que no se vea el borde de la imagen
	},
	
	setUI: function () {
		this.mainMenu = this.game.add.group();
		this.guide = this.game.add.group();
		//Tutorial UI
		var gameExplanation1 = new XEngine.Text(this.game, this.game.width/2, 180, 'El juego se maneja solo con el rat'+ String.fromCharCode(243) +'n.', 20, 'Play', 'rgb(60,150,30)');
		gameExplanation1.style = 'bold';
		gameExplanation1.strokeColor = 'black';
		gameExplanation1.strokeWidth = 3;
		gameExplanation1.anchor.setTo(0.5);
		this.guide.add(gameExplanation1);
		
		var gameExplanation2 = new XEngine.Text(this.game, this.game.width/2, 230, 'Mientras mantienes pulsado, la nave dispara.', 20, 'Play', 'rgb(60,150,30)');
		gameExplanation2.style = 'bold';
		gameExplanation2.strokeColor = 'black';
		gameExplanation2.strokeWidth = 3;
		gameExplanation2.anchor.setTo(0.5);
		this.guide.add(gameExplanation2);
		
		var closeGuide = new XEngine.Text(this.game, this.game.width/2, 280, 'Back', 20, 'Play', 'rgb(200,30,30)');	
		closeGuide.style = 'bold';
		closeGuide.strokeColor = 'black';
		closeGuide.strokeWidth = 3;
		closeGuide.anchor.setTo(0.5);
		closeGuide.inputEnabled = true;
		closeGuide.onClick.add(this.closeGuide, this);
		this.guide.add(closeGuide);
		
		
		//MainMenu UI
		var title = new XEngine.Sprite(this.game, this.game.width/2, 180, 'title');
		title.anchor.setTo(0.5);
		this.mainMenu.add(title);
		
		var clickToStart = new XEngine.Text(this.game, this.game.width/2 - 100, 280, String.fromCharCode(161) +'Start!', 20, 'Play', 'rgb(200,30,30)');
		clickToStart.style = 'bold';
		clickToStart.strokeColor = 'black';
		clickToStart.strokeWidth = 3;
		clickToStart.anchor.setTo(0.5);
		clickToStart.inputEnabled = true;
		clickToStart.onClick.addOnce(this.goToPlay, this);
		this.mainMenu.add(clickToStart);
		
		
		var openGuide = new XEngine.Text(this.game,this.game.width/2 + 100, 280, 'Tutorial', 20, 'Play', 'rgb(60,150,30)');	
		openGuide.style = 'bold';
		openGuide.strokeColor = 'black';
		openGuide.strokeWidth = 3;
		openGuide.anchor.setTo(0.5);
		openGuide.inputEnabled = true;
		openGuide.onClick.add(this.openGuide, this);							
		this.mainMenu.add(openGuide);
		
		this.guide.render = false;												//Ocultamos la guia
	},
	
	goToPlay: function() {
		this.game.state.start('space');
	},
	
	openGuide: function () {													//Mostramos la guia y ocultamos el menu
		this.mainMenu.render = false;
		this.guide.render = true;
	},
	
	closeGuide:function () {													//Mostramos el menu y ocultamos la guia
		this.mainMenu.render = true;
		this.guide.render = false;
	}
};