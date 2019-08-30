
/* code.js es el controlador de juego general, desde donde se llama al update principal
 *  y el cual posee la funcion OnInit();
 */

var theme = new Audio("./media/theme.mp3"); //Musica del juego

var canvas; //< Guardamos en canvas 
var ctx;    //< Guardamos el contexto

var fixedDeltaTime = 0.01666666; //< Deltatime limitado
var deltaTime = fixedDeltaTime;  //< Deltatime

var time      = 0, //< Variable temporizador
    FPS       = 0, //< Fotogramas por segundo del juego
    frames    = 0, //< Frames del juego
    acumDelta = 0; //< Tiempo delta acumulado

var playerImg, mountainImg, aiImg; //< Imagenes de los Sprites

var camera; //< Camara de juego

var timepassed_spawnAI    = 0.0; //<Temporizadores para el tiempo de spawn de las AI enemigas
var spawnAiDelay          = 5.0;

var timepassed_AfterDeath = 0.0; //< Temporizadores para el reinicio del nivel
var time_to_restart       = 2.0;

var bullet_index          = 0;   //Indice de la bala actual creada

var garbajeCollector = []; //< Colector de basura para Box2D

var hasEnded              = false; //< Variable de GameOver
var hasStarted            = false; //< Variable de inicio de juego
var startCount            = true;

var playTime = 0; //< Variable para contar el tiempo total de partida
var gameStart; //< Variable para contar el cuando empezó la partida

var timesDead = 0; //< Variable para contar las veces que ha muerto el jugador

var isPaused = false;
var canPause = true;
var pauseMaxDelay = 500;
var pauseMoment;

var timeAtPauseMoment;

function Init ()
{
    // Preparamos la llamada recursiva para el refresco
    window.requestAnimationFrame = (function (evt) {
        return window.requestAnimationFrame     ||
            window.mozRequestAnimationFrame     ||
            window.webkitRequestAnimationFrame  ||
            window.msRequestAnimationFrame      ||

            function (callback) {
                window.setTimeout(callback, fixedDeltaTime * 1000);
            };
        }) ();

    canvas = document.getElementById("my_canvas");
    
    //Si obtenemos un contexto en el canvas
    if (canvas.getContext)
    {
        //guardamos el contexto
        ctx              = canvas.getContext('2d');

        //Inicializamos los sprites

        //Sprite del suelo
        floorImg         = new Image();
        floorImg.src     = "./media/planta.png";

        //Sprite del jugador
        playerImg        = new Image();
        playerImg.src    = "./media/player.png";

        //Sprite de la IA
        aiImg            = new Image();
        aiImg.src        = "./media/ai.png";

        //Sprite de las balas enemigas
        bulletImg        = new Image();
        bulletImg.src    = "./media/bullet.png";

        //Al cargar el ultimo sprite, iniciamos la escena
        bulletImg.onload = Start();
    }
}

//La funcion Start se encarga de inicializar y preparar el juego antes del loop
function Start ()
{
    //Establecemos los eventos de teclado
    SetupKeyboardEvents();

    //Establecemos los eventos de raton
    SetupMouseEvents();

    //Inicializamos Box2D
    PreparePhysics(ctx);

    //Inicializamos el fondo
    background.Start();

    //Inicializamos el jugador
    player.Start();

    //Inicializamos la camara
    camera = new Camera(player);
    camera.Start();

    pauseMoment = Date.now();

    //Llamamos al loop de juego
    Loop();
}

//Loop actualiza cada frame el estado del juego
function Loop ()
{
    //Hacemos la funcion recursiva para conseguir un bucle "Update"
    requestAnimationFrame(Loop);

    //Funcion para iniciar la pausa
    if (input.isKeyPressed(KEY_SPACE) && !isPaused && hasStarted && canPause){

        //Indico que el juego está pausado
        isPaused = true;

        //Guardo el momento de inicio del juego, para que no siga contando durante la pausa
        timeAtPauseMoment = gameStart;

        // Guardo el momento en el cual se ha pausado (para el delay de pausa-play)
        pauseMoment = Date.now();
    }

    //Funcion para reanudar la pausa
    else if(input.isKeyPressed(KEY_SPACE) && isPaused && hasStarted && canPause){

        //Devuelvo a la variable con el tiempo pasado desde el inicio el valor que guardé en el momento de pausar
        gameStart = timeAtPauseMoment;

        //Indico que el jugo ya no está pausado
        isPaused = false;

        //Guardo el momento en el cual se ha des-pausado (para el delay de pausa-play)
        pauseMoment = Date.now();
    }

    //Si ha pasado mas tiempo que el delay desde la pulsacion de pausa, se puede des-pausar o viceversa
    if((Date.now() - pauseMoment) > pauseMaxDelay) canPause = true;
    else canPause = false;

    //Ajustamos el deltaTime
    var now   = Date.now();
    deltaTime = now - time;
    if (deltaTime > 1000) deltaTime = 0;
    time      = now;

    //Aumentamos los frames y el delta acumulado
    frames++;
    acumDelta += deltaTime;

    //si el tiempo acumulado es mayor a 1s actualizamos los FPS y establecemos el tiempo acumulado a 0 de nuevo
    if (acumDelta > 1000)
    {
        FPS        = frames;
        frames     = 0;
        acumDelta -= 1000;
    }
    
    //Ajustamos el deltaTime a milisegundos
    deltaTime /= 1000;

    //Actualizamos la informacion de input
    input.update();
    //En caso en el cual el juego no haya terminado, continuamos actualizandolo
    if(!hasEnded && hasStarted && !isPaused){

        //LOGICA DEL JUEGO
        Update();

    }
    //Si el juego ha terminado, esperamos unos segundos y reninciamos la partida
    else if (hasEnded){

        timepassed_AfterDeath += deltaTime;

        if( time_to_restart < timepassed_AfterDeath){

            timesDead++;

            if( timesDead > 3) timesDead = 0;
            garbajeCollector.push(player.body);

            for(var ar_elem = 0; ar_elem < ai_array.length; ar_elem++){
            garbajeCollector.push(ai_array[ar_elem].body);
            }
            spawnAiDelay = 5.0;

            ai_array = [];
            ai_array.length = 0;
            addNewAI_index       = 0;  //< Establezco el indice de dicho array
            ai_accumulated_speed = 1.0;//< Así como la velocidad de desplazamiento acumulada de las ias (aceleración)

            hasEnded = false;
            hasStarted = false;
            timepassed_AfterDeath = 0;

            startCount = true;

            player.Reset();
        }
    }

    //DIBUJADO DEL JUEGO
    Draw();  

    //Reestablecemos el input de datos
    input.postUpdate();
}

// Actualizamos la lógica del juego
function Update ()
{
    // NOTA: THEME.PLAY() SE HA MOVIDO AL UPDATE DEBIDO A LA ACTUALIZACIÓN DE POLÍTICAS DE AUTOPLAY DE GOOGLE, 
    // YA QUE HAN LIMITADO EL AUTOPLAY Y SOLO SE REPRODUCIRÁN SONIDOS SI EL USUARIO HA INTERACTUADO CON EL DOCUMENTO
    theme.play();
    theme.volume = .8;

    //Guardamos el tiempo de inicio de la partida
    if(startCount)
    {
    gameStart = Date.now();  
    startCount = false;
    }; 

    //Actualizamos el temporizador en cada loop
    var now   = Date.now();

    //Ajustamos el tiempo de partida
    if(!hasEnded) playTime = Math.round((now - gameStart) / 1000);

    //Si la puntuacion del jugador es mayor a 1000, establezco el ScoreMultiplier a X2 y la cadencia de disparo aumentará
    if(player.score >= 1000 && player.score < 7500){
        bulletDelay            = 0.3;
        player.scoreMultiplier = 2;   
    } 
    //Si es mayor a 7500, la puntuacion será X3 y la cadencia de disparo aumentará
    if(player.score >= 7500){
        player.scoreMultiplier = 3;
        bulletDelay            = 0.2;
    } 

    //Actualizamos las fisicas
    world.Step(deltaTime, 8, 3);
    world.ClearForces();

    //Comprobamos las colisiones
    CheckCollisions();

    //Actualizamos la lógica del jugador
    if (input.isKeyPressed(KEY_A))
        player.moveLeft = true;

    if (input.isKeyPressed(KEY_D))
        player.moveRight = true;

    if (input.isKeyPressed(KEY_W))
        player.moveUp = true;

    if (input.isKeyPressed(KEY_S))
        player.moveDown = true;

    //Actualizamos al jugador
    player.Update(deltaTime);

    //Actualizamos las IAs
    if(ai_array != null){
        for(var x = 0; x < ai_array.length; x++){
            ai_array[x].Update(deltaTime);
            ai_array[x].Draw(ctx);
        }
    };

    //Actualizamos la camara
    camera.Update(deltaTime);

    //Aumentamos el temporizador para el Spawn de AIs
    timepassed_spawnAI += deltaTime;

    //Si se puede Spawnear una AI segun el temporizador...
    if(timepassed_spawnAI >= spawnAiDelay){

        //Reestablecemos el temporizador a 0
        timepassed_spawnAI = 0;

        //Añadimos una nueva AI
        AddNewAI();

        //Reducimos el tiempo de Spawn en un 10%
        spawnAiDelay *= 0.9;

        //Si el tiempo de respawn ws <1, se queda en 1s
        if(spawnAiDelay <= 1) spawnAiDelay = 1;
    }

    //Limpiamos todos los objetos Box2D del colector de basura
    if(garbajeCollector.length > 0){
        for(var i = 0; i < garbajeCollector.length; i++){
            world.DestroyBody(garbajeCollector[i]);
        }
        garbajeCollector.length = 0;
    }
}

//Dibujado del juego
function Draw ()
{
    //Limpiamos el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Dibujamos el fondo
    background.Draw(ctx);

    //Movemos a la posicion de la camara
    ctx.save();
    ctx.translate(-camera.position.x, -camera.position.y);

    //Dibujamos el mundo
    DrawWorld(world);

    //Dibujamos las AI
    if(ai_array != null){
        for(var q = 0; q < ai_array.length; q++){
            ai_array[q].Draw(ctx);
        }
    }

    //Dibujamos las balas del jugador
    if(bullet_array != null){
        for(var j = 0; j < bullet_array.length; j++){
            bullet_array[j].Draw(ctx);
        }
    }

    //Dibujamos al jugador
    player.Draw(ctx);

    //Restauramos a la posicion de la camara
    ctx.restore();

    //Si la partida aún no ha comenzado...
    if (!hasStarted){

        //Rectángulo para el fondo
        ctx.fillRect(0, 0, 1280, 720); 
        
        //Dibujamos el fondo de la pantalla previa al inicio de la partida
        //Estilo del fondo y el texto gigante YES
        ctx.font  = "655px Arial";
        var gradient=ctx.createLinearGradient(0,0,canvas.width,0);
        gradient.addColorStop("0","BLUE");
        gradient.addColorStop("1","purple");
        ctx.fillStyle=gradient;
        ctx.fillText('YES', 0, 600); 

        //Estilo de las letras el 1er plano
        ctx.font      = "110px Arial";
        ctx.fillStyle = "#1aff1a";

        //Switch para variar el mensaje por pantalla en caso de muerte
        switch(timesDead){

            //Texto en la pantalla de reinicio con la muerte 0 (Spawn)
            case 0:
            ctx.fillText('DO YOU LIKE HURTING', 20, 350); 
            ctx.fillText('OTHER PEOPLE?', 20, 450); 
            break;

            //Texto en la pantalla de reinicio con la muerte 1
            case 1:
            ctx.fillText('ARE YOU ENJOYING', 20, 350); 
            ctx.fillText('YOURSELF?', 20, 450); 
            break;
            
            //Texto en la pantalla de reinicio con la muerte 2
            case 2:
            ctx.fillText('IS THIS WORTH', 20, 350); 
            ctx.fillText('THE EFFORT?', 20, 450); 
            break;

            //Texto en la pantalla de reinicio con la muerte 3
            case 3:
            ctx.fillText('YOU FUCKING', 20, 350); 
            ctx.fillText('MANIAC...', 20, 450); 
            break;
        }

    }

    //Si la partida ha empezado...
    if(hasStarted){

    //Si el jugador ha pausado la partida...
    if(isPaused){
        //Dibujamos el icono de Pausa con dos rectangulos
        ctx.font      = "110px Arial";
        ctx.fillStyle = "#1aff1a";
        ctx.fillRect(500,300, 100, 200);
        ctx.fillRect(650,300, 100, 200);
    }

    //Dibujamos decoración en la UI
    ctx.fillStyle = "#1aff1a";
    ctx.font      = "75px Arial";
    ctx.fillText('AUX / CRT', 10, 75);

    //Dibujamos Mas decoración en la UI
    ctx.fillStyle = "#1aff1a";
    ctx.font      = "20px Arial";
    ctx.fillText('SIGNAL STRENGTH: ', 10, 100);

    //Dibujamos una barra en la UI
    ctx.fillStyle = "#1aff1a";
    ctx.fillRect(210,85,(player.score/2000)*140,15);

    //Dibujamos el tiempo de partida
    ctx.fillStyle = "#1aff1a";
    ctx.font      = "20px Arial";
    ctx.fillText('Time Alive: ' + playTime + "s", 530,650);

    //Dibujamos el multiplicador de Score del jugador
    ctx.fillStyle = "#1aff1a";
    ctx.font      = "20px Arial";
    ctx.fillText('X' + player.scoreMultiplier, 700,650);

    //Dibujamos la puntuacion del jugadir
    ctx.fillStyle = "#1aff1a";
    ctx.font      = "26px Arial";
    ctx.fillText('SCORE: ' + player.score, 570, 700);
    }

    //Si el juego ha terminado, mostramos un mensaje
    if(hasEnded){
            
    ctx.fillStyle = "#ff0000";
    ctx.font      = "150px Arial";
    ctx.fillText('YOU DIED ', 280, 420);
    }
}

//Dibujamos el mundo
function DrawWorld (world)
{
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    world.DrawDebugData();
    ctx.restore();
}
