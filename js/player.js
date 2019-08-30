/* player.js se ecarga de la gestión y dibujado del jugador, así como de los proyectiles
 * que este puede disparar y el array de los mismos
 */

var snd = new Audio("./media/shoot.wav"); //Pista de audio

var bulletDelay = 0.40; //< Delay al Spawn de las balas

var isPlayerMoving = true;

var bullet = {
    
    isVisible:         true, //< isVisible informa si el sprite debe seguir siendo dibujado 

    magnitud:          null, //< La magnitud del vector director de la bala
    vector_director_x: null, //< valor x del vector director de la bala
    vector_director_y: null, //< valor y del vector director de la bala
    body:              null, //< variable del body para el calculo de colisiones

    spriteRotation:    0.0, //< Valor que guarda el valor de la rotacion del sprite de la bala
                            //  con la formula Math.atan2(input.mouse.y + (camera.position.y) - this.position.y, input.mouse.x + (camera.position.x)- this.position.x);


    impulse:           {x: 0, y:0}, //< Variable que guarda el vector director del impulso a la bala

 animation: {

        img:         null, //< Variable para guardar la imagen
        frameWidth:  32,   //< Ancho del frame
        frameHeight: 32,   //< Alto del frame
        actualX:     0,    //< Posición X actual en la imagen (SpriteSheet)
        actualY:     0,    //< Posición Y actual en la imagen (SpriteSheet)

        //Dibujamos la imagen
        Draw: function (ctx) {
            
            ctx.drawImage(this.img, 
                this.actualX, 
                this.actualY, 
                this.frameWidth, 
                this.frameHeight,  
                -this.frameWidth / 2, 
                -this.frameHeight / 2, 
                this.frameWidth, 
                this.frameHeight); 
        }
    },

    //Funcion para inicializar el proyectil
    Start: function(){
        this.animation.img = bulletImg;
        this.spriteRotation = Math.atan2(input.mouse.y + (camera.position.y) - player.position.y, input.mouse.x + (camera.position.x)- player.position.x);
        this.index = index_bullet;
    },

    Draw: function (ctx) {

        //Solo en caso en el cual sea visible, se dibuja el sprite
        if(this.isVisible){

        //Calculamos la posición del elemento sobre el que dibujar el sprite     
        var bodyPosition = this.body.GetPosition();
        var posX = bodyPosition.x * scale;
        var posY = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

        //Guardamos, movemos y rotamos el canvas a esa posición
        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(this.spriteRotation);

       //Dibujamos la animación pertinente        
        this.animation.Draw(ctx);
        ctx.restore();        
        }
    },

    //Funcion para aplicar velocidad
    Applyimpulse: function (impulse) {
        this.body.ApplyImpulse(this.impulse, this.body.GetWorldCenter());
    },
}

var player = {
    
    spriteRotation: 0.0,  //< Valor que guarda la rotación del sprite para que mire al jugador con la formula:
                          // Math.atan2(input.mouse.y + (camera.position.y) - this.position.y, input.mouse.x + (camera.position.x)- this.position.x);
  
    timePassed:     0.0,  //< Temporizador acumulado

    width:          0.20, //< Ancho del Sprite
    height:         0.20, //< Alto del Sprite

    position: {x: 640, y: 360}, //< Variable para guardar la posicion

    maxHorizontalVel: 2, //< Limitador de desplazamiento horizontal
    maxVerticalVel:   2, //< Limitador de desplazamiento vertical

    moveLeft:     false, //< Booleano que indica si se desplaza hacia la izquierda
    moveRight:    false, //< `` Derecha
    moveUp:       false, //< `` Arriba
    moveDown:     false, //< `` Abajo

    canMoveRight: true, //< Booleano que indica si se puede desplazar a la derecha
    canMoveLeft:  true, //< `` Izquierda
    canMoveUp:    true, //< `` Arriba
    canMoveDown:  true, //< `` Abajo

    fire:         false, //< Booleano que indica si se ha disparado

    score:           0, //< Puntuación del jugador
    scoreMultiplier: 1, //< Multiplicador de la puntuacion

    hasStopped:       true, //< Variable para la animacion Idle;

    animation: {
        img:              null,   //< Variable para guardar la imagen
        timePerFrame:     1/6,    //< Tiempo de reproduccion de cada frame
        currentFrametime: 0,      //< Tiempo del frame actual
        frameWidth:       133.33, //< Ancho del frame
        frameHeight:      133,    //< Alto del frame
        actualX:          0,      //< Posición X actual en la imagen (SpriteSheet)
        actualY:          0,      //< Posición Y actual en la imagen (SpriteSheet)

        Update: function (deltaTime) {

            //console.log(isPlayerMoving);
            //Si el frame actual ha estado mas tiempo o igual que el tiempo por frame

            if (!isPlayerMoving) {
                this.actualX = 0;
                this.actualY = 1;
            }

            else this.currentFrametime += deltaTime;
            if (this.currentFrametime >= this.timePerFrame)
            {
                // update the animation frame
                this.actualX += this.frameWidth;

                //Si llegamos al final, volvemos al principio del SpriteSheet
                if (this.actualX >= 799)
                {
                    this.actualX = 0;
                    this.actualY = 0;
                }

                this.currentFrametime = 0.0;
            }
        },

        //Dibujamos la imagen
        Draw: function (ctx) {

            ctx.drawImage(this.img, this.actualX, this.actualY,
                this.frameWidth, this.frameHeight,
                -this.frameWidth / 2, -this.frameHeight / 2,
                this.frameWidth, this.frameHeight); 
        }
    },

    //Información sobre las fisicas
    physicsInfo: {
        density: 1,
        fixedRotation: true,
        linearDamping: 5,
        user_data: player,
        type: b2Body.b2_dynamicBody,
        restitution: 0.0
    },
    body: null,

    Reset: function (){

        spriteRotation: 0.0;  //

        player.timePassed =     0.0; //< Temporizador acumulado

        player.position.x = 640;
        player.position.y = 360; //< Variable para guardar la posicion

        moveLeft=     false; //< Booleano que indica si se desplaza hacia la izquierda
        moveRight=    false; //< `` Derecha
        moveUp=       false; //< `` Arriba
        moveDown=     false; //< `` Abajo

        canMoveRight= true; //< Booleano que indica si se puede desplazar a la derecha
        canMoveLeft=  true; //< `` Izquierda
        canMoveUp=    true; //< `` Arriba
        canMoveDown=  true; //< `` Abajo

        fire=         false; //< Booleano que indica si se ha disparado

        player.score=           0; //< Puntuación del jugador
        player.scoreMultiplier= 1; //< Multiplicador de la puntuacion

        Start();
    },

    //Función llamada al instanciar al jugador
    Start: function () {

        //Asignamos la imagen de la animacion
        if(this.animation.img == null) this.animation.img = playerImg;

        //Creamos una caja de Box2D para las colisiones
        this.body = CreateBox(world,
            this.position.x / scale, this.position.y / scale,
            this.width, this.height, this.physicsInfo);

        //Añadimos información para el calculo de colisiones contra otros objetos    
        this.body.userData = "player";
    },

    Update: function (deltaTime) {

        //Compruebo si se mueve el personaje
        if(Math.round(this.body.GetLinearVelocity().x) == 0 && Math.round(this.body.GetLinearVelocity().y) == 0) isPlayerMoving = false;
        else isPlayerMoving = true;

        //Actualizamos el contador
        this.timePassed += deltaTime;

        //Controlamos si el jugador se ha salido de los limites y le bloqueamos el movimiento
        if(player.position.x <= 100) this.canMoveLeft = false;
        else this.canMoveLeft = true;

        if(player.position.y <= 80) this.canMoveUp = false;
        else this.canMoveUp = true;

        if(player.position.y >= 650) this.canMoveDown = false;
        else this.canMoveDown = true;

        // Actualizamos la animación
        this.animation.Update(deltaTime);

        // Aplicamos el moviemiento
        if (this.moveRight && this.canMoveRight)
        {
            this.ApplyVelocity(new b2Vec2(1, 0));
            this.moveRight = false;
        }

        if (this.moveLeft && this.canMoveLeft)
        {
            this.ApplyVelocity(new b2Vec2(-1, 0));
            this.moveLeft = false;
        }

        if (this.moveUp && this.canMoveUp)
        {
            this.ApplyVelocity(new b2Vec2(0, 1));
            this.moveUp = false;
        }

        if (this.moveDown && this.canMoveDown)
        {
            this.ApplyVelocity(new b2Vec2(0, -1));
            this.moveDown = false;
        }

        // Comprobamos si se ha disparado y si se puede
        if(this.fire && this.timePassed >= bulletDelay){

            //Creamos una nueva bala
            AddNewBullet();

            //Reiniciamos las variables de disparo
            this.fire = false;
            this.timePassed = 0;
        }
        // Si no, ponemos fire a false, para evitar que dispare automaticamente al llegar al tiempo
        else this.fire = false;

        //Actualizamos la posición
        var bodyPosition = this.body.GetPosition();

        this.position.x = bodyPosition.x * scale;
        this.position.y = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

        //Y rotamos el Sprite
        this.spriteRotation = Math.atan2(input.mouse.y + (camera.position.y) - this.position.y, input.mouse.x + (camera.position.x)- this.position.x);
    },

    Draw: function (ctx) {

        //Calculamos la posición del elemento sobre el que dibujar el sprite          
        var bodyPosition = this.body.GetPosition();
        var posX = bodyPosition.x * scale;
        var posY = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

        //Guardamos, movemos y rotamos el canvas a esa posición
        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(this.spriteRotation);

        //Dibujamos la animación pertinente        
        this.animation.Draw(ctx);
        ctx.restore();
    },

    //Funcion para aplicar velocidad
    ApplyVelocity: function (vel) {
        var bodyVel = this.body.GetLinearVelocity();
        bodyVel.Add(vel);

        // Aplicamos el limite de desplazamiento lateral
        if (Math.abs(bodyVel.x) > this.maxHorizontalVel)
            bodyVel.x = this.maxHorizontalVel * bodyVel.x / Math.abs(bodyVel.x);

        // Y Vertical
        if (Math.abs(bodyVel.y) > this.maxVerticalVel)
            bodyVel.y = this.maxVerticalVel * bodyVel.y / Math.abs(bodyVel.y);

        this.body.SetLinearVelocity(bodyVel);
    },
}

var bullet_array = []; //< Creo un array de balas
var index_bullet = 0;  //< Establezco un indice para dicho array

function AddNewBullet(){

    bullet_array[index_bullet] = $.extend( {}, bullet ); //Añado ias al array mediante un Swallow Copy del "Objeto" Bullet
    snd.play(); //Reproduzco el sonido

    //Establezco los vectores directores x e y, así como la magnitud de la nueva bala
    bullet_array[index_bullet].vector_director_x = input.mouse.x + (camera.position.x) - player.position.x;
    bullet_array[index_bullet].vector_director_y = input.mouse.y + (camera.position.y) - player.position.y;
    bullet_array[index_bullet].magnitud = Math.sqrt(bullet_array[index_bullet].vector_director_x * bullet_array[index_bullet].vector_director_x + bullet_array[index_bullet].vector_director_y * bullet_array[index_bullet].vector_director_y);

    //Calculo y normalizo el vector impulso
    bullet_array[index_bullet].impulse = {
        x: (bullet_array[index_bullet].vector_director_x / bullet_array[index_bullet].magnitud) * 0.2,
        y: -(bullet_array[index_bullet].vector_director_y / bullet_array[index_bullet].magnitud) * 0.2,
    },

    //Creo el objeto Box2D
    bullet_array[index_bullet].body = CreateBall(world, player.position.x/100 + bullet_array[index_bullet].impulse.x*3.5 , (7.20 - player.position.y/100 + bullet_array[index_bullet].impulse.y*3.5), .05, 1);
    
    //Aplico el impulso al objeto
    bullet_array[index_bullet].Applyimpulse(bullet_array[index_bullet].impulse);

    //Inicializo la bala
    bullet_array[index_bullet].Start();

    //Aumento el indice
    index_bullet++;
}
