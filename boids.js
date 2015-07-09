
var width = window.innerWidth - 100, height = window.innerHeight - 100, timerID = 0, c2 = document.getElementById('c'), ctx = c2.getContext('2d');
c2.width = width;
c2.height = height;

var speed = 6;
var boids = [];
var doors = [];
var totalBoids = 100;
var obstacles = [];

var init = function(){

    for (var i = 0; i < totalBoids; i++) {

        boids.push({
            x: Math.random() * width,
            y: Math.random() * height,
            v: {
              x: Math.random() * 2 - 1,
              y: Math.random() * 2 - 1
          },
          c: 'rgb(' + Math.floor(0 * 255) + ',' + Math.floor(0 * 255) + ',' + Math.floor(0 * 255) + ')'
        });
    }
    setInterval(update, 40);
};

var calculateDistance = function(v1, v2){
    x = Math.abs(v1.x - v2.x);
    y = Math.abs(v1.y - v2.y);

    return Math.sqrt((x * x) + (y * y));
};


function drawRectangle(){
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = "1";
    ctx.rect(0,0, width, height);
    ctx.stroke();

}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), root = document.documentElement;

    // return relative mouse position
    var mouseX = evt.clientX - rect.top - root.scrollTop;
    var mouseY = evt.clientY - rect.left - root.scrollLeft;
    return {
        x: mouseX,
        y: mouseY
    };
}

var checkWallCollisions = function(index){
    for(var j=0; j< doors.length; j++){
        if(((boids[index].y >= doors[j].y-5 && doors[j].type == 'H' && boids[index].x <= doors[j].x && boids[index].x >= doors[j].x-50) 
            || (boids[index].x >= doors[j].x-5 && doors[j].type == 'V' && boids[index].y <= doors[j].y && boids[index].y >= doors[j].y-50))
            && (boids[index].x > width - 10 || boids[index].x < 5 || boids[index].y > height - 10 || boids[index].y < 5)){
            boids.splice(index, 1);
        }
    }
    if(boids[index].x > width - 10){
        boids[index].x = width - 5;
        boids[index].v.x = Math.random() * 2 - 1;
        boids[index].v.y = Math.random() * 2 - 1;
        applyForces(index);
        
    }
    if(boids[index].x < 5){
        boids[index].x =  5;
        boids[index].v.x = Math.random() * 2 - 1;
        boids[index].v.y = Math.random() * 2 - 1;
        applyForces(index);
        
    }
    if(boids[index].y > height - 10){
        boids[index].y = height - 5;
        boids[index].v.x = Math.random() * 2 - 1;
        boids[index].v.y = Math.random() * 2 - 1;
        applyForces(index);
        
    }
    if(boids[index].y < 5){
        boids[index].y =  5;
        boids[index].v.x = Math.random() * 2 - 1;
        boids[index].v.y = Math.random() * 2 - 1;
        applyForces(index);
        
    }
};

var addForce = function(index, force){

    boids[index].v.x += force.x;
    boids[index].v.y += force.y;

    magnitude = calculateDistance({
        x: 0,
        y: 0
    }, {
        x: boids[index].v.x,
        y: boids[index].v.y
    });

    boids[index].v.x = boids[index].v.x / magnitude;
    boids[index].v.y = boids[index].v.y / magnitude;
};

//This should be in multiple functions, but this will
//save tons of looping - Gross!
var applyForces = function(index){
    percievedCenter = {
        x: 0,
        y: 0
    };
    flockCenter = {
        x: 0,
        y: 0
    };
    percievedVelocity = {
        x: 0,
        y: 0
    };
    count = 0;
    for (var i = 0; i < boids.length; i++) {
        if (i != index) {

            //Allignment
            dist = calculateDistance(boids[index], boids[i]);

            //console.log(dist);
            if (dist > 0 && dist < 60) {
                count++;

                //Alignment
                percievedCenter.x += boids[i].x;
                percievedCenter.y += boids[i].y;

                //Cohesion
                percievedVelocity.x += boids[i].v.x;
                percievedVelocity.y += boids[i].v.y;
                //Seperation
                if (calculateDistance(boids[i], boids[index]) < 15) {
                    flockCenter.x -= (boids[i].x - boids[index].x);
                    flockCenter.y -= (boids[i].y - boids[index].y);
                }


            }
        }
    }
    
    if (count > 0) {
        percievedCenter.x = percievedCenter.x / count;
        percievedCenter.y = percievedCenter.y / count;

        percievedCenter.x = (percievedCenter.x - boids[index].x) / 400;
        percievedCenter.y = (percievedCenter.y - boids[index].y) / 400;

        percievedVelocity.x = percievedVelocity.x / count;
        percievedVelocity.y = percievedVelocity.y / count;

        flockCenter.x /= count;
        flockCenter.y /= count;
    }

    addForce(index, percievedCenter);

    addForce(index, percievedVelocity);

    addForce(index, flockCenter);
};

var update = function(){


    clearCanvas();
    $('#h1').html( totalBoids );
    drawRectangle();    
    var door = new Door(width-750, height, 'H');
    doors.push(door);
    door = new Door(width-50, height, 'H');
    doors.push(door);
    door = new Door(width, height-250, 'V');
    doors.push(door);
    

    for(var j=0; j< obstacles.length; j++){
        obstacles[j].draw(ctx);
    }

    for(var j=0; j< doors.length; j++){
        doors[j].draw(ctx);
    }

    for (var i = 0; i < boids.length; i++) {

        //Draw boid
        ctx.beginPath();
        ctx.strokeStyle = "black";  
        ctx.lineWidth = "1";
        ctx.fillStyle = boids[i].c;

        var oldx=boids[i].x, oldy=boids[i].y;
        var dx=boids[i].v.x * speed, dy=boids[i].v.y * speed;

        boids[i].x += dx;
        boids[i].y += dy;
        applyForces(i);

        dx=boids[i].v.x;
        dy=boids[i].v.y;

        for (var j = 0; j < obstacles.length; j++){
            if (calculateDistance(boids[i], obstacles[j]) < 50) {
                var dx=boids[i].v.x * speed, dy=boids[i].v.y * speed;
                boids[i].x -= dx;
                boids[i].y -= dy;
                boids[i].v.x = Math.random() * 2 - 1;
                boids[i].v.y = Math.random() * 2 - 1;
                applyForces(i);
            }
        }

        ctx.moveTo(oldx+dx, oldy+dy);
        ctx.lineTo(oldx-dy, oldy+dx);
        ctx.lineTo(boids[i].x, boids[i].y);
        ctx.lineTo(oldx+dy, oldy-dx);
        ctx.lineTo(oldx+dx, oldy+dy);
        ctx.stroke();
        ctx.fill();


        checkWallCollisions(i);

    }
};

//Gui uses this to clear the canvas
var clearCanvas = function(){
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
    ctx.beginPath();
    ctx.rect(0, 0, window.innerWidth , window.innerHeight );
    doors = [];
    ctx.closePath();
    ctx.fill();
};

init();



//on click add a boid with random direction
$('#c').click(function(e){
    mouse = getMousePos(this, e);
    var obstacle = new Obstacle(mouse.x, mouse.y, 25);
    obstacles.push(obstacle);

});

//up and down keys change speed
$('html').keyup(function(e){
    var code = e.keyCode;
    if (code == 38){
        width -=5;
        height-=5;
        if(width<15)
            width = window.innerWidth - 100;
        if(height<15)
            height = window.innerHeight - 100;
    } else if(code == 40){
        width +=5;
        height+=5;
        if(width > window.innerWidth)
            width = window.innerWidth - 100;
        if(height > window.innerHeight)
            height = window.innerHeight - 100;
    }
    
    /*var code = e.keyCode;
    if (code == 38){
        speed = speed + 1;
    }
    else if (code == 40){
        speed = speed - 1;
    }
    else if (code == 32){
        for (var i = 0; i < totalBoids; i++) {
           boids[i].v.x = Math.random() * 2 - 1;
           boids[i].v.y = Math.random() * 2 - 1;
       }
   }*/
});

//creating Obstacle
function Obstacle(x, y, rad) {
    this.x = x;
    this.y = y;
    this.rad = rad;

    this.draw = function (ctx)
    {
        ctx.save();
        ctx.fillStyle = "#ffbb00";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };
}

//creating Door
function Door(x,y,type){
    this.x = x;
    this.y = y;
    this.type = type;

    this.draw = function(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = "10"
        ctx.moveTo(x,y);
        if(type == 'H'){
            ctx.lineTo(x-50,y);

        }else if(type == 'V'){
            ctx.lineTo(x,y-50);
        }
        ctx.closePath();
        ctx.stroke();
    };

}

//watch out for the mouse!


function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

$('#c').mousemove(function(e) {
    var pos = findPos(this);
    var mousePos = new Object();
    mousePos.x = e.pageX - pos.x;
    mousePos.y = e.pageY - pos.y;

    for (var i = 0; i < totalBoids; i++){
        if (calculateDistance(boids[i], mousePos) < 55) {
            boids[i].v.x = Math.random() * 2 - 1;
            boids[i].v.y = Math.random() * 2 - 1;
        }
    }

});