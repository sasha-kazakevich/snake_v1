
(function(){

	var directions = {
		"n": new Vector(0,-1),
		"w": new Vector(-1,0),
		"s": new Vector(0, 1),
		'e': new Vector(1,0)
	},
	KEY_CODE = {
		'w': 37,
		'n': 38,
		'e': 39,
		's': 40
	};

	//Проверяем возможно ли поменять направление в зависимости от длины Змеи и текущего направления

	function changeDirectionAbility(direction){
		if((((direction === 's' && snakeParts[0].direction ==='n') ||
			(direction === 'n' && snakeParts[0].direction ==='s') ||
			(direction === 'w' && snakeParts[0].direction ==='e') ||
			(direction === 'e' && snakeParts[0].direction ==='w')) &&
			snakeParts.length !== 1) || direction === snakeParts[0].direction
			) {
			return false;
		}
		return true;
	}
	function Vector(x,y){
		this.x = x;
		this.y = y;
	}

	Vector.prototype.plus = function(vect){
		return new Vector(this.x + vect.x, this.y + vect.y);
	}

	Vector.prototype.randomVector = function(world){
		var x = Number((Math.random()*(world[0].length-1)).toFixed(0));
		var y = Number((Math.random()*(world.length-1)).toFixed(0));
		return new Vector(x,y);
	}

	var body = document.body;

	var world = function(){
		var finArr = [];
		var table = document.getElementsByTagName('table')[0].childNodes[1];

		for(var i = 0; i < table.children.length; i++){
			var innerFinArr = [];
			for(var j = 0; j < table.children[i].children.length; j++){
				innerFinArr.push(table.children[i].children[j]);
			}
			finArr.push(innerFinArr);
		}

		return finArr;
	}();

	function Snake(vect){
		this.coord = vect;
	}
	Snake.prototype.changeDirection = function(e) {
		for(var prop in KEY_CODE){
			if(e.keyCode === KEY_CODE[prop]){
				if(changeDirectionAbility(prop)){

					// меняем стиль transform у класса head, чтобы голова смотрела в нужном направлении
					var h = document.getElementsByTagName('style')[0].innerText;
					var reg = /(rotate\()(\d+)(deg\))/;
					var deg = function(prop){
						if(prop === "n")
							return "180";
						else if(prop === "s")
							return "0";
						else if(prop === "w")
							return "90";
						else if(prop === "e")
							return "270";
					}(prop);
					var j = h.replace(reg,"$1"+ deg+"$3");
					document.getElementsByTagName('style')[0].innerText = j;
					// меняем направление головы
					snakeParts[0].direction = prop;
				}
				break;
			}
		}
	}

	// SUBCLASS HEAD. SNAKE INHERIT

	function Head(vect, direction){
		Snake.call(this,vect);
		this.direction = direction;
	}
	Head.prototype.look = function(){
		var s = this.coord.plus(directions[this.direction]);
		changeCoordinates(s);
		if(s.x === apple.coord.x &&
		 s.y === apple.coord.y){
		 	return "apple";
		}	
		if(world[s.x] === undefined)
			return world[s.x];
		for(var i = 0; i < snakeParts.length; i++){
			if(snakeParts[i].coord.x === s.x && snakeParts[i].coord.y === s.y)
			return  "over";
			}
		return world[s.x][s.y];
	}
	Head.prototype.move = function(i,end){
		var sn = snakeParts;
		var nextDir = this.look(), funAppleCoord;
		if(nextDir === "apple"){
			score++;
			selectionSpeed(score);
			sc.innerHTML = score;
			snakeParts.push(new Body(new Vector(snakeParts[snakeParts.length - 1].coord.x, snakeParts[snakeParts.length - 1].coord.y)));
			apple = new Apple(Vector.prototype.randomVector(world));
			apple.be(this.coord.plus(directions[this.direction]), sn);
		}
		if (nextDir === "over"){
			clearInterval(k);
			alert("Game Over! you score : " + score);
			if (score > bestScore) window.localStorage.setItem("snake_score",score);
		}
		if(!end){
			snakeParts[1].futureCoord = this.coord;
		}else{
			world[this.coord.y][this.coord.x].className = "cell";
		}

		this.coord = this.coord.plus(directions[this.direction]);
		changeCoordinates(this.coord);

		world[this.coord.y][this.coord.x].className = "head";
	}

		function changeCoordinates(coord){
		if(coord.x === world[0].length)
			coord.x = 0;
		else if(coord.x === -1)
			coord.x = world[0].length -1;
		if(coord.y === world.length)
			coord.y = 0;
		else if(coord.y === -1)
			coord.y = world.length -1;
		return coord;
	}
	// SUBCLASS BODY. SNAKE INHERIT

	function Body(vect){
		Snake.call(this,vect);
		this.futureCoord = vect;
	}
	Body.prototype.move = function(i, end){
		if(end){
			world[this.coord.y][this.coord.x].className = "cell";
		} else {
			snakeParts[i+1].futureCoord = this.coord;
		}
		if(i === 1){
			world[this.futureCoord.y][this.futureCoord.x].className = "tail";
		}
		this.coord = this.futureCoord;
	}

	// APPLE CONSTRUCTOR

	function Apple(vect){
		this.coord = vect;
	}

	Apple.prototype.be = function (vect, snakeP){
		if(vect && this.coord.x === vect.x && this.coord.y === vect.y){
			apple = new Apple(Vector.prototype.randomVector(world));
			apple.be(vect, snakeP);
			return;
		}
		for(var i = 0; i<snakeP.length; i++){
			if(snakeP[i].coord.x === this.coord.x && snakeP[i].coord.y === this.coord.y) {
				world[this.coord.y][this.coord.x].className = "tail";
				apple = new Apple(Vector.prototype.randomVector(world));
				apple.be(vect, snakeP);
				return;
			}
		}
		 world[this.coord.y][this.coord.x].className = "apple";
	}

	// MAKING WORLD ALIFE

	function turn(){

		var s = snakeParts;
		var len = s.length;
		for(var i = 0; i < len; i++){
			if(i===len-1)
				s[i].move(i,true);
			else
				s[i].move(i);
		}
	}

	function selectionSpeed(score) {
		if (score % 4 === 0 && score < 32){
			speed -= 200;
			clearInterval(k);
			k = setInterval(turn,speed);
		}
	}
    var snakeParts,apple,k,score,bestScore,speed;

	var sc = document.getElementById("score");
	var bestsc = document.getElementById("bestscore");

	if (!window.localStorage.getItem("snake_score"))
	window.localStorage.setItem("snake_score","0");

	document.getElementById('start').addEventListener('click', function(){
		world.forEach(function(pow){
			pow.forEach(function(cell){
				cell.className = "cell";
			});
		});
		 snakeParts = [new Head(Vector.prototype.randomVector(world), "s")];
		 apple = new Apple(Vector.prototype.randomVector(world));
		 apple.be(0,snakeParts);
		 speed = 1600;
		 score = 0;
		 bestScore = +window.localStorage.getItem("snake_score");
		 sc.innerHTML = score;
		 bestsc.innerHTML = "best score: " + bestScore;
		 k = setInterval(turn, speed);
	},false);

	body.addEventListener('keyup', Snake.prototype.changeDirection, false);
	
})();
