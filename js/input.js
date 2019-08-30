
/* input.js se encarga de recibir los eventos de teclado y raton 
 * para despues ser procesados por otros metodos
 */

var lastPress = null; //< Variable para guardar la ultima pulsacion
var fire     = false; //< Variable para indicar a la clase player si se puede disparar

//variables de las principales teclas de juego
var KEY_LEFT  = 37, KEY_A = 65;
var KEY_UP    = 38, KEY_W = 87;
var KEY_RIGHT = 39, KEY_D = 68;
var KEY_DOWN  = 40, KEY_S = 83;
var KEY_PAUSE = 19;
var KEY_SPACE = 32;

var input = {
    mouse: { x: 0, y: 0 }, //< Posición del ratón

    keyboard: {            //< Pulsaciones de teclado
        keyup: {},
        keypressed: {}
    },

    //Indica si una tecla se ha pulsado
    isKeyPressed: function(keycode) {
        return this.keyboard[keycode];
    },

    //Indica si una tecla está siendo pulsada
    isKeyDown: function(keycode) {
        return this.keyboard.keypressed[keycode];
    },

    //Indica si una tecla se ha soltado
    isKeyUp: function (keycode) {
        return this.keyboard.keyup[keycode];
    },

    //Bucle que pasa por teclas soltadas para indicar que han sido soltadas
    update: function() {
        for (var property in this.keyboard.keyup) {
            if (this.keyboard.keyup.hasOwnProperty(property)) {
                this.keyboard.keyup[property] = false;
            }
        }
    },
    //Bucle que pasa por teclas pulsadas para indicar que han sido pulsadas
    postUpdate: function () {
        for (var property in this.keyboard.keypressed) {
            if (this.keyboard.keypressed.hasOwnProperty(property)) {
                this.keyboard.keypressed[property] = false;
            }
        }
    }
};

//Inicializamos los eventos de teclado
function SetupKeyboardEvents ()
{
    //Si se pulsa una tecla
    AddEvent(document, "keydown", function (e) {
        input.keyboard[e.keyCode] = true;
        input.keyboard.keypressed[e.keyCode] = true;
    } );

    //Si se suelta una tecla
    AddEvent(document, "keyup", function (e) {
        input.keyboard.keyup[e.keyCode] = true;
        input.keyboard[e.keyCode] = false;
    } );

    //Funcion para añadir los eventlistener relativos a los eventos de teclado
    function AddEvent (element, eventName, func)
    {
        if (element.addEventListener)
            element.addEventListener(eventName, func, false);
        else if (element.attachEvent)
            element.attachEvent(eventName, func);
    }
}

//Inicializamos los eventos de ratón
function SetupMouseEvents ()
{
    //Evento de click sobre el canvas
    canvas.addEventListener("mousedown", MouseDown, false);

    //Evento de movimiento sobre el canvas
    canvas.addEventListener("mousemove", MouseMove, false);
}

//Evento de pulsación
function MouseDown (event)
{
    //Indicamos el area de pulsacion
    var rect = canvas.getBoundingClientRect();

    //Guardamos la posición de la pulsacion
    var clickX = event.clientX - rect.left;
    var clickY = event.clientY - rect.top;

    //Indicamos que el jugador puese disparar
    player.fire = true;
    hasStarted = true;
}

//Evento de movimiento del raton
function MouseMove (event)
{
    //Indicamos el area de movimiento
    var rect = canvas.getBoundingClientRect();

    //Actualizamos la posicion del raton
    input.mouse.x = event.clientX - rect.left;
    input.mouse.y = event.clientY - rect.top;
}