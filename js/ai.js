
/* ai.js es la clase encargada de la gestión y dibujado de las inteligencias artificiales
 * así como de contener el array formado por las mismas
 */

var spawn_audio = new Audio("./media/monster_appears.wav"); //Pista de audio

var ai = {
    value: 0,
    isVisible:         true,  //< isVisible informa si el sprite debe seguir siendo dibujado 

    magnitud:          null, //< La magnitud del vector director hacia el jugador
    vector_director_x: null, //< valor x del vector director de la ia al jugador
    vector_director_y: null, //< valor y del vector director de la ia al jugador

    spriteRotation:    0.0, //< Valor que guarda la rotación del sprite para que mire al jugador
                            // con la formula: Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
    aiSpeed:           1,   //< Variable que guarda la velocidad de las ai, se acelera con el tiempo

    impulse:           {x: 0,   y:0   }, //< Variable para guardar el vector director del impulso
    position:          {x: 300, y: 300}, //< Variable para guardar la posicion

    width:             0.20, //< Ancho del Sprite
    height:            0.20, //< Alto del Sprite

    //Guardamos la información para la animación
    animation2: {

        img:              null,   //< Variable para guardar la imagen    
        timePerFrame:     1/6,    //< Tiempo de reproduccion de cada frame
        currentFrametime: 0,      //< Tiempo del frame actual
        frameWidth:       133.33, //< Ancho del frame
        frameHeight:      133,    //< Alto del frame
        actualX:          0,      //< Posición X actual en la imagen (SpriteSheet)
        actualY:          0,      //< Posición Y actual en la imagen (SpriteSheet)

        AnimationUpdate: function (deltaTime) {

            //Teniendo en cuenta que las multiples ai se copiaran posteriormente mediante un Swallow Copy ( para ahorrar memoria )
            //compartiran llamadas al update, por lo que si hay multiples llamadas, el deltaTime de se divide entre el numero de llamadas
            ai.animation2.currentFrametime += deltaTime/ai_array.length;

            //Si el frame actual ha estado mas tiempo o igual que el tiempo por frame
            if (ai.animation2.currentFrametime >= this.timePerFrame)
            {
                //Pasamos al siguiente elemento del SpriteSheet
                this.actualX += this.frameWidth;
                
                //Si llegamos al final, volvemos al principio del SpriteSheet
                if (this.actualX >= 799)
                {
                    this.actualX = 0;
                    this.actualY = 0;
                }
                
                ai.animation2.currentFrametime = 0.0;
            }
        },

        //Dibujamos la imagen
        Draw: function (ctx) {

            ctx.drawImage(ai.animation2.img, ai.animation2.actualX, ai.animation2.actualY,
                ai.animation2.frameWidth, ai.animation2.frameHeight,
                -ai.animation2.frameWidth / 2, -ai.animation2.frameHeight / 2,
                ai.animation2.frameWidth, ai.animation2.frameHeight); 
            }
    },

    deathAnim:{

        img:              null,   //< Variable para guardar la imagen    
        frameWidth:       266,    //< Ancho del frame
        frameHeight:      133,    //< Alto del frame
        actualX:          0,      //< Posición X actual en la imagen (SpriteSheet)
        actualY:          133,    //< Posición Y actual en la imagen (SpriteSheet)

                //Dibujamos la imagen
                Draw: function (ctx) {

                    ctx.drawImage(ai.animation2.img, ai.deathAnim.actualX, ai.deathAnim.actualY,
                        ai.deathAnim.frameWidth, ai.deathAnim.frameHeight,
                        -ai.deathAnim.frameWidth / 2, -ai.deathAnim.frameHeight / 2,
                        ai.deathAnim.frameWidth, ai.deathAnim.frameHeight); 
                    }
    },


    //Información sobre las fisicas
    physicsInfo: {
        density: 0.2,
        fixedRotation: true,
        linearDamping: 5,
        user_data: ai,
        type: b2Body.b2_dynamicBody,
        restitution: 0.0
    },
    body: null,

    //Función llamada al instanciar la ai
    Start: function () {

        //Asignamos la imagen de la animacion
        ai.animation2.img = aiImg;

        //Creamos una caja de Box2D para las colisiones
        this.body = CreateBox(world,
            this.position.x / scale, this.position.y / scale,
            this.width, this.height, this.physicsInfo);

        //Añadimos información para el calculo de colisiones contra otros objetos    
        this.body.userData = "ai";
        this.body.index = addNewAI_index;
        this.body.lives = 2;

        ai.animation2.actualX = 0;
    },

    Update: function (deltaTime) {

        //Actualizamos la animación
        ai.animation2.AnimationUpdate(deltaTime);

        //Actualizamos la posición
        var bodyPosition = this.body.GetPosition();
        this.position.x = bodyPosition.x * scale;
        this.position.y = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

        //Actualizamos el vector director
        ai.vector_director_x = player.position.x - ai.position.x;
        ai.vector_director_y = player.position.y - ai.position.y;

        //Actualizamos la magnitud del vector director
        ai.magnitud = Math.sqrt(ai.vector_director_x * ai.vector_director_x + ai.vector_director_y * ai.vector_director_y);

        //Actualizamos el vector impulso y lo normalizamos
        ai.impulse = {
            x: (ai.vector_director_x / ai.magnitud)*this.aiSpeed,
            y: -(ai.vector_director_y / ai.magnitud)*this.aiSpeed,
        },

        //Aplicamos el impulso
        this.ApplyVelocity(ai.impulse);

        //Y rotamos el Sprite
        if(this.isVisible) this.spriteRotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
    },

    Draw: function (ctx) {

        //Solo en caso en el cual sea visible, se dibuja el sprite
        if(ai_array[this.body.index].isVisible){

        //Calculamos la posición del elemento sobre el que dibujar el sprite    
        var bodyPosition = this.body.GetPosition();
        var posX = bodyPosition.x * scale;
        var posY = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

        //Guardamos, movemos y rotamos el canvas a esa posición
        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(this.spriteRotation);

        //Dibujamos la animación pertinente
        ai.animation2.Draw(ctx);
        ctx.restore();
       } else {

        var bodyPosition = this.body.GetPosition();
        var posX = bodyPosition.x * scale;
        var posY = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(this.spriteRotation);

        //Dibujamos la animación pertinente
        ai.deathAnim.Draw(ctx);
        ctx.restore();
       }
    },

    //Funcion para aplicar velocidad
    ApplyVelocity: function (vel) {
        this.body.SetLinearVelocity(vel);
    },
}

var ai_array             = []; //< Creo un array de ias
var addNewAI_index       = 0;  //< Establezco el indice de dicho array
var ai_accumulated_speed = 1.0;//< Así como la velocidad de desplazamiento acumulada de las ias (aceleración)

function AddNewAI()
{
    ai_array[addNewAI_index] = $.extend( {}, ai ); //Añado ias al array mediante un Swallow Copy del "Objeto" IA, usando JQuery

    //Switch para hacer Spawn aleatorio entre estos 3 casos
    switch (Math.floor(Math.random() * (2 - 0 + 1)) + 0){
        case 0:
        ai_array[addNewAI_index].position.x = 650;
        ai_array[addNewAI_index].position.y = 75;
        break;

        case 1:
        ai_array[addNewAI_index].position.x = 650;
        ai_array[addNewAI_index].position.y = 645;
        break;
        
        case 2:
        ai_array[addNewAI_index].position.x = 75;
        ai_array[addNewAI_index].position.y = 200;
        break;
    }

    //Audio de spawn de enemigo
    spawn_audio.play();

    //Nueva velocidad acelerada
    ai_array[addNewAI_index].aiSpeed = ai_accumulated_speed;
    ai_array[addNewAI_index].value = 0;

    //Inicialización
    ai_array[addNewAI_index].Start();

    //Aumento de velocidad en un 2% y en index en 1
    ai_accumulated_speed *= 1.02;
    addNewAI_index++; 
}


