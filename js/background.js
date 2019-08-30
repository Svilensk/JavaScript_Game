/* background.js se encarda de dibujar los fondos
 */
var background = {

    // Suelo fuera del piso
    layer0: {
        position: {x: 0, y: 0},

        //Dibujo un gradiente fuera del piso
        Draw: function (ctx) {
            var gradient= ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "purple");
            gradient.addColorStop(1, "blue");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

    // Suelo del piso
    layer1: {
        position: {x: 0, y: 0},
        speed: 1,
        img: null,

        //Establezco la imagen del suelo
        Start: function () {
            this.img = floorImg;
        },

        //Dibujo el piso del nivel
        Draw: function (ctx) {
            ctx.drawImage(this.img,
                 - (camera.position.x * this.speed),
                canvas.height - this.img.height - (camera.position.y * this.speed));
        }
    },

    layers : null,

    // inicializamos el array de capas
    Start: function () {
        this.layers = new Array(this.layer0, this.layer1);
        for (let i = 0; i < this.layers.length; i++)
        {
            if (typeof(this.layers[i].Start) !== 'undefined')
                this.layers[i].Start();
        }
    },

    //Dibujamos las capas
    Draw: function (ctx) {
        for (let i = 0; i < this.layers.length; i++)
            this.layers[i].Draw(ctx);
    }

};
