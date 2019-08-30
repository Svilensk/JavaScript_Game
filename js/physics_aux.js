
/* physics_aux.js se encarga de dar soporte a las funciones de Box2D
 */

// Libreria Box2D
    var b2Vec2              = Box2D.Common.Math.b2Vec2
    ,   b2AABB              = Box2D.Collision.b2AABB
    ,   b2BodyDef           = Box2D.Dynamics.b2BodyDef
    ,   b2Body              = Box2D.Dynamics.b2Body
    ,   b2FixtureDef        = Box2D.Dynamics.b2FixtureDef
    ,   b2Fixture           = Box2D.Dynamics.b2Fixture
    ,   b2World             = Box2D.Dynamics.b2World
    ,   b2PolygonShape      = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2CircleShape       = Box2D.Collision.Shapes.b2CircleShape
    ,   b2DebugDraw         = Box2D.Dynamics.b2DebugDraw
    ,   b2MouseJointDef     = Box2D.Dynamics.Joints.b2MouseJointDef
    ,   b2Shape             = Box2D.Collision.Shapes.b2Shape
    ,   b2RevoluteJointDef  = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ,   b2Joint             = Box2D.Dynamics.Joints.b2Joint
    ,   b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
    ,   b2DistanceJointDef  = Box2D.Dynamics.Joints.b2DistanceJointDef
    ,   b2PulleyJointDef    = Box2D.Dynamics.Joints.b2PulleyJointDef
    ,   b2ContactListener   = Box2D.Dynamics.b2ContactListener
    ;

var scale   = 100; //< Escala del mundo (1m = 100px)
var gravity;       //< variable para guardar la gravedad
var world;         //< variable para guardar el mundo

// Funcion auxiliar para crear cajas Box2D
function CreateBox (world, x, y, width, height, options)
{
    // Valores por defecto
    options = $.extend(true, {
        'density' : 1.0,
        'friction': 1.0,
        'restitution' : 0.5,

        'linearDamping' : 0.0,
        'angularDamping': 0.0,

        'fixedRotation': false,

        'type' : b2Body.b2_dynamicBody
    }, options);

    // Fixture define las propiedades fisicas
    var fix_def         = new b2FixtureDef();

    fix_def.density     = options.density;
    fix_def.friction    = options.friction;
    fix_def.restitution = options.restitution;

    // Shape define la forma
    fix_def.shape       = new b2PolygonShape();
    fix_def.shape.SetAsBox(width, height);

    // Body define las propiedades del objeto
    var body_def        = new b2BodyDef();
    body_def.position.Set(x, y);

    body_def.linearDamping  = options.linearDamping;
    body_def.angularDamping = options.angularDamping;

    body_def.type          = options.type;
    body_def.fixedRotation = options.fixedRotation;
    body_def.userData      = options.user_data;

    var b = world.CreateBody(body_def);
    var f = b.CreateFixture(fix_def);

    return b;
}

//Funcion auxiliar para crear circulos Box2D
function CreateBall (world, x, y, r, options)
{

    // Valores por defecto
    options = $.extend(true, {
        'density' : 2.0,
        'friction': 0.5,
        'restitution' : 0.5,
 
        'linearDamping' : 0.0,
        'angularDamping': 0.0,
 
        'type' : b2Body.b2_dynamicBody
    }, options);

    // Fixture define las propiedades fisicas
    var fix_def         = new b2FixtureDef;

    // Establecemos como sensor para detectar colisiones
    fix_def.isSensor    = true;

    fix_def.density     = options.density;
    fix_def.friction    = options.friction;
    fix_def.restitution = options.restitution;

    // Shape define la forma
    var shape           = new b2CircleShape(r);
    fix_def.shape       = shape;

    // Body define las propiedades del objeto
    var body_def        = new b2BodyDef();
    body_def.position.Set(x, y);

    body_def.linearDamping  = options.linearDamping;
    body_def.angularDamping = options.angularDamping;

    body_def.type     = options.type;
    body_def.userData = options.user_data;

    var b = world.CreateBody(body_def);
    var f = b.CreateFixture(fix_def);

    b.userData = 'bullet';
    b.index    = index_bullet;

    return b;
}

// Funcion para crear un mundo Box2D
function CreateWorld (ctx, gravity)
{
    var doSleep = false;
    world       = new b2World(gravity, doSleep);

/*
    // PROPIEDADES DEBUG

    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);
*/

    // Creamos los limites de colision del mundo

    // Paredes izquierdas
    var left_wall_1 = CreateBox(world, 0.8, 5.2, .12, 2.5, {type : b2Body.b2_staticBody});
    var left_wall_2 = CreateBox(world, 0.8, 0.45, .12, 1, {type : b2Body.b2_staticBody});

    left_wall_1.userData = "pared";
    left_wall_2.userData = "pared";

    // Paredes Superiores
    var upper_wall_1 = CreateBox(world, 1.1, 6.95, 5, .12, {type : b2Body.b2_staticBody});
    var upper_wall_2 = CreateBox(world, 11.1, 6.95, 5, .12, {type : b2Body.b2_staticBody});

    upper_wall_1.userData = "pared";
    upper_wall_2.userData = "pared";

    // Pared Derecha
    var right_wall_1 = CreateBox(world, 12.5, 3, .12, 7.5, {type : b2Body.b2_staticBody});

    right_wall_1.userData = "pared";

    // Paredes Inferiores
    var down_wall_1 = CreateBox(world, 1.1, 0.3, 5, .12, {type : b2Body.b2_staticBody});
    var down_wall_2 = CreateBox(world, 12.3, 0.3, 5, .12, {type : b2Body.b2_staticBody});

    down_wall_1.userData = "pared";
    down_wall_2.userData = "pared";

    //Collider Prop_Sofa
    CreateBox(world, 1.4, 4.75, .5, 1.2, {type : b2Body.b2_staticBody});

    //Collider Prop_Cama
    CreateBox(world, 3.55, 5.6, 1, 1.2, {type : b2Body.b2_staticBody});

    //Collider Prop_Mesilla
    CreateBox(world, 1.9, 6.5, .6, .2, {type : b2Body.b2_staticBody});
    CreateBox(world, 1.9, 4.5, .6, .2, {type : b2Body.b2_staticBody});

    //Collider Prop_Maletin
    CreateBox(world, 1.4, .5, .3, .2, {type : b2Body.b2_staticBody});

    //Collider Prop_Mesilla_2
    CreateBox(world, 10.3, 6.5, .6, .2, {type : b2Body.b2_staticBody});

    //Collider Prop_Mesa
    CreateBox(world, 4.4, 0.9, .8 , .5, {type : b2Body.b2_staticBody});

    //Collider Pror_Armero + Mesilla
    CreateBox(world, 9.85, 0.7, 1.4, .3, {type : b2Body.b2_staticBody});

    //Collider Prop_Neveras
    CreateBox(world, 12, 2, .3, 1.25, {type : b2Body.b2_staticBody});

    //Collider Prop_Sillas
    CreateBox(world, 12, 4, .3, 1.25, {type : b2Body.b2_staticBody});

    //Collider Prop_Sillas_Mesa
    CreateBox(world, 11.7, 5.6, .3, .4, {type : b2Body.b2_staticBody});
    return world;
}

// Inicializamos las fisicas del mundo
function PreparePhysics (ctx)
{
    //Vector de gravedad
    gravity = new b2Vec2(0, 0);

    CreateWorld(ctx, gravity);
}

//Control de colisiones en el mundo
function CheckCollisions (){

    //Establecemos un nuevo ContactListener
    var listener = new Box2D.Dynamics.b2ContactListener;

    //Llamamos a la funcion cuando exista una colision
    listener.BeginContact = function (contact) {
   
        //Guardamos los objetos que han colisionado
        var body1 = contact.GetFixtureA().GetBody();
        var body2 = contact.GetFixtureB().GetBody();

        //Comprobamos que objetos han colisionado

        //Si colisionan bala y pared...
        if(body1.userData == "pared" && body2.userData == "bullet"){

            //Hacemos la bala invisible y destruimos su body
            bullet_array[body2.index].isVisible = false;
            garbajeCollector.push(body2);
        }

        //Si colisiona bala y ai...
        if(body1.userData == "ai" && body2.userData == "bullet"){

            //Restamos una vida a la ai colisionada
            body1.lives--;

            //Si la ai colisionada no tiene vidas restantes...
            if(body1.lives <= 0){

                //Hacemos invisible el sprite de la bala y destruimos su body
                ai_array[body1.index].isVisible = false;
                garbajeCollector.push(body1);

                //Sumamos puntos al jugador
                player.score += 100 * player.scoreMultiplier;
            } 

            //Hacemos invisible la bala y destruimos su body
            bullet_array[body2.index].isVisible = false;
            garbajeCollector.push(body2);
        }

        //Si hay una colision entre ai y player, acaba la partida
        if(body1.userData == "ai" && body2.userData == "player"){
            hasEnded = true;
        }
        if(body1.userData == "player" && body2.userData == "ai"){
            hasEnded = true;
        }
}
//establecemos el contactlistener
world.SetContactListener(listener);
}



