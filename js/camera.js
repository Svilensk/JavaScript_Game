/* camera.js se encarga del seguimiento de la camara al jugador, asi como los efectos de offset
 */ 
//Parametros de la camara generales
function Camera (player)
{
    this.player   = player; //< Foco de la camara

    this.minX     = -200; //< Limite al desplazamiento en X negativo
    this.maxX     = 200;  //< Limite al desplazamiento en X positivo
    this.minY     = 0;    //< Limite al desplazamiento en Y negativo

    this.offset   = {x: 0, y: 0}; //< Offset de la camara
    this.position = {x: 0, y: 0}; // Posición de la camara 
}

//Inicializamos la camara
Camera.prototype.Start = function ()
{
    //Offset de la camara al inicializar
    this.offset.x = this.player.position.x;
    this.offset.y = 400;
}

Camera.prototype.Update = function (deltaTime)
{

    //Seguimiento Horizontal
    this.position.x = (this.player.position.x - this.offset.x) * 0.3;

    //Seguimiento vertical
    this.position.y = (this.player.position.y - this.offset.y) * 0.3;

    //Limitación al seguimiento
    this.position.x = Math.min(Math.max(this.position.x, this.minX), this.maxX);
}
