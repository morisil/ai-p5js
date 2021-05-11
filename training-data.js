// start
const dots = []
const factor = 0.008
const count = 2000
const size = 500
const radius = size * 0.8 / 2
function setup() {
	createCanvas(size, size);
	background(255);
	noiseDetail(2)
	colorMode(HSB, 100)
	strokeWeight(2)
	stroke(0)
	noFill()
	ellipse(width /2, height /2, radius * 2 + 1)

	for (let i = 0; i < count; i++) {
		dots.push(new Dot(radius, [60,80], 20, 5))
	}
}

function draw() {
	for (let i = 0; i < dots.length; i++) {
		const dot = dots[i]
		n = noise(dot.pos.x * factor, dot.pos.y * factor)
		dot.update(n)
		dot.draw()
	}
}

class Dot {
	constructor (radius, colorRange, brightness, alpha) {
		const r = random(TWO_PI)
		const x = width / 2 + sin(r) * radius
		const y = height / 2 + cos(r) * radius
		this.pos = createVector(x,y)
		this.prev = createVector(x,y)
		this.color = color(255)
		this.deadCount = 0
		this.radius = radius
		this.colorRange = colorRange
		this.alpha = alpha
		this.brightness = brightness
	}

	update(noize) {
		this.v = p5.Vector.fromAngle(noize * TWO_PI + (this.deadCount * PI))
		this.v.setMag(2)
		this.color = color(map(noize, 0, 1, ...this.colorRange), 100, this.brightness, this.alpha)
		this.prev = this.pos.copy()
		this.pos = this.pos.add(this.v)

		if (dist(width/2, height/2, this.pos.x, this.pos.y) > this.radius + 2) {
			this.deadCount++
		}
	}

	draw() {
		if (
      dist(width / 2, height / 2, this.pos.x, this.pos.y) > this.radius ||
      dist(width / 2, height / 2, this.prev.x, this.prev.y) > this.radius
    ) {
      return
    }

		strokeWeight(1)
		stroke(this.color)
		line(this.prev.x, this.prev.y, this.pos.x, this.pos.y)

	}
}
// end

// start
var edge_list = [];
var start = true;

function setup(){
canvas = createCanvas(windowWidth, windowHeight);
background(255);

var vertices = [];

var r = height * 0.4;
var num = 120;

//Create initial nodes;

for (var i = 0; i < num ; i ++){
var pos = new p5.Vector(width * 0.5 + r * cos(2 * 3.14 * i * 1.0/num), height * 0.5 + r * sin(2 * 3.14 * i * 1.0/num));
vertices.push(new Part(pos.x, pos.y));
}

//Add edges;

for (var i = 0; i < vertices.length - 1;  i++){
  edge_list.push(new Edge(vertices[i], vertices[i+1]));
}

//Add last edge;

edge_list.push(new Edge(vertices[vertices.length - 1], vertices[0]));

}

function draw(){
//  background(255);

  if (start){
  //This holds the edges to be removed after a split;
  var toRemove = [];

  //Thi holds the new edges to be added;
  var toAdd = [];

  for (var i = 0; i < edge_list.length; i++){
    var edge = edge_list[i];
    edge.display();
    edge.update();
    var l = edge.getLen();

    if (edge_list.length < 500){
        if ( random(0, 1) < 0.001){
          var adds = edge.split();
          toAdd.push(adds[0]);
          toAdd.push(adds[1]);
          edge.remove = true;
       }
      }

     }

//Remove the edges;

for (var i = edge_list.length-1; i>=0; i--){
  var e = edge_list[i];
  if (e.remove){
    edge_list.splice(i, 1);
  }
}

//Add the new edges;
toAdd.forEach( edge => edge_list.push(edge) )

//Get all the vertices;
var vertices = [];
toAdd.forEach( edge => vertices.push(edge.p2) );

//Apply forces between each vertices;

for (var i = 0; i < vertices.length; i++){
  var p = vertices[i];
  for (var j = i + 1 ; j < vertices.length; j++){
    var q = vertices[j];
    p.check(q);
  }
}

edge_list.forEach(edge => edge.move());



  }
}

function mouseClicked(){
	background(255);
var vertices = [];
edge_list = [];
var r = height * 0.4;
var num = 120;

//Create initial nodes;

for (var i = 0; i < num ; i ++){
var pos = new p5.Vector(width * 0.5 + r * cos(2 * 3.14 * i * 1.0/num), height * 0.5 + r * sin(2 * 3.14 * i * 1.0/num));
vertices.push(new Part(pos.x, pos.y));
}

//Add edges;

for (var i = 0; i < vertices.length - 1;  i++){
  edge_list.push(new Edge(vertices[i], vertices[i+1]));
}

//Add last edge;

edge_list.push(new Edge(vertices[vertices.length - 1], vertices[0]));
}

 function keyPressed(){
   save();
 }

///Part class



//Node class

function Part(x, y) {

  this.pos = new p5.Vector(x, y);
  this.vel = new p5.Vector(random(-1, 1), random(-1, 1));
  this.vel.normalize();
  this.vel.mult(random(1.0, 2.0));
  //Used only for testing reasons;

  this.rad = random(5, 15);

  //Initialize the force vector;

  this.forceApplied = new p5.Vector(0.0, 0.0);


  this.applyForce = function(force){
    this.forceApplied.add(force);
  }

  this.move = function(){
    this.forceApplied.limit(0.3);
    this.vel.add(this.forceApplied);
    this.vel.limit(0.4);
    this.pos.add(this.vel);
    this.forceApplied = new p5.Vector(0.0, 0.0);
  }

  //For testing reasons

  this.display = function(){
    noStroke();
    fill(0, 2);
    ellipse(this.pos.x, this.pos.y, this.rad, this.rad);
  }

  //Check distance condition with other vertices

  this.check = function(other){
    var p = other.pos;
    var d = this.pos.dist(p);

    if (d < 10){
      var force = new p5.Vector(p.x - this.pos.x, p.y - this.pos.y);
      force.normalize();
      force.mult(-0.5);
      this.applyForce(force);
      force.mult(1.0);
      other.applyForce(force);
    }
  }

  //Bounce on the wall

  this.bounce = function(){
    if (this.pos.x > width){
      this.pos.x = width;
      this.vel.x = - this.vel.x;
    }
    if (this.pos.x < 0){
      this.pos.x = 0;
      this.vel.x = - this.vel.x;
    }
    if (this.pos.y > height){
      this.pos.y = height;
      this.vel.y = - this.vel.y;
    }
    if (this.pos.y < 0){
      this.pos.y = 0;
      this.vel.y = - this.vel.y;
    }

  }
}

//Edge class



function Edge(p1, p2){
  this.p1 = p1;
  this.p2 = p2;
  this.remove = false;

  this.split = function(){
    var middle = new p5.Vector(0.5 * (this.p1.pos.x + this.p2.pos.x), 0.5 * (this.p1.pos.y + this.p2.pos.y));
    var newpoint = new Part(middle.x, middle.y);
    return [new Edge(this.p1, newpoint), new Edge(newpoint, this.p2)];
  }

  this.display = function(){
    //this.p1.display();
    //this.p2.display();
    stroke(0, 20);
    line(this.p1.pos.x, this.p1.pos.y, this.p2.pos.x, this.p2.pos.y);
  }






  this.update = function(){
    var l = this.p2.pos.dist(this.p1.pos) - 10;
    var force = new p5.Vector(this.p2.pos.x - this.p1.pos.x, this.p2.pos.y - this.p1.pos.y);
    force.normalize();
    force.mult(l * 0.009);
    this.p1.applyForce(force);
    force.mult(-1.0);
    this.p2.applyForce(force);
  }

  this.move = function(){
    this.p1.bounce();
    this.p2.bounce();
    this.p1.move();
    this.p2.move();
  }

  this.getLen = function(){
    return this.p1.pos.dist(this.p2.pos);
  }
}
// end

// start
Cell[][] oldB, newB;
int levels, old_levels;
float scaleRange, old_scaleRange, xb, yb;




void setup()
{
  size(800, 800);
  levels = 8;
  scaleRange = 0.12;
  old_levels = levels;
  old_scaleRange = scaleRange;
}

void draw()
{
  xb = mouseX;
  yb = mouseY;
  levels = round( ( xb / 800 ) * 8 );
  scaleRange = mouseY * 10 / ( 8 * 5 );
  scaleRange = scaleRange / 1000;
  // println(xb + ":" + levels + " " + yb + ":" + scaleRange);
  if ((old_levels != levels) || (old_scaleRange != scaleRange))
  {
    background(255);
    int level=0;
    int n=2;
    oldB = new Cell[n][n];
    oldB[0][0] = new Cell(100, 100);
    oldB[0][1] = new Cell(100, 700);
    oldB[1][0] = new Cell(700, 100);
    oldB[1][1] = new Cell(700, 700);

    //  println (oldB[1][1].x + " " + oldB[1][1].y);

    // calculate result
    while (level<levels)
    {
      n=2*n-1;
      newB = new Cell[n][n];
      for (int i=0; i<n; i++) {
        for (int j=0; j<n; j++) {
          if (((i%2) == 0) && ((j%2) == 0)) {
            int ii = i/2;
            int jj = j/2;
            newB[i][j] = new Cell(oldB[ii][jj].x, oldB[ii][jj].y);
          }
          else if (((i%2) == 0) && ((j%2) == 1)) {
            int ii = i/2;
            int jj = (j-1)/2;
            float x=( oldB[ii][jj].x + oldB[ii][jj+1].x ) / 2;
            float y=( oldB[ii][jj].y + oldB[ii][jj+1].y ) / 2;
            float d= sqrt( sq(oldB[ii][jj].x - oldB[ii][jj+1].x) + sq(oldB[ii][jj].y - oldB[ii][jj+1].y) );
            float rng = d*scaleRange;
            float xu = random(-rng, rng);
            float yu = random(-rng, rng);
            //            print("p[" + ii + "][" + jj + "]=(" + oldB[ii][jj].x + "," + oldB[ii][jj].y + ") p[");
            //            println(ii + "][" + (jj+1) + "]=(" + oldB[ii][jj+1].x + "," + oldB[ii][jj+1].y + ")");
            //            println(x + " " + y + " " + d + " " + rng + " " + xu + " " + yu);
            newB[i][j] = new Cell(x+xu, y+yu);
          }
          else if (((i%2) == 1) && ((j%2) == 0)) {
            int ii = (i-1)/2;
            int jj = j/2;
            float x=( oldB[ii][jj].x + oldB[ii+1][jj].x ) / 2;
            float y=( oldB[ii][jj].y + oldB[ii+1][jj].y ) / 2;
            float d= sqrt( sq(oldB[ii][jj].x - oldB[ii+1][jj].x) + sq(oldB[ii][jj].y - oldB[ii+1][jj].y) );
            float rng = d*scaleRange;
            float xu = random(-rng, rng);
            float yu = random(-rng, rng);
            newB[i][j] = new Cell(x+xu, y+yu);
          }
          else if (((i%2) == 1) && ((j%2) == 1)) {
            int ii = (i-1)/2;
            int jj = (j-1)/2;
            float x=( oldB[ii][jj].x + oldB[ii+1][jj+1].x ) / 2;
            float y=( oldB[ii][jj].y + oldB[ii+1][jj+1].y ) / 2;
            float d= sqrt( sq(oldB[ii][jj].x - oldB[ii+1][jj+1].x) + sq(oldB[ii][jj].y - oldB[ii+1][jj+1].y) );
            float rng = d * scaleRange * 0.7;
            float xu = random(-rng, rng);
            float yu = random(-rng, rng);
            newB[i][j] = new Cell(x+xu, y+yu);
          }
        }
      }
      level ++;
      oldB = newB;
      // println(level);
    }

    // draw result
    // println("draw init");
    for (int i=0; i<n; i++) {
      for (int j=0; j<n; j++) {
        if ((i<n-1) && (j<n-1)) {
          line( oldB[i][j].x, oldB[i][j].y, oldB[i][j+1].x, oldB[i][j+1].y);
          line( oldB[i][j].x, oldB[i][j].y, oldB[i+1][j].x, oldB[i+1][j].y);
        }
        else if ((i == (n-1)) && (j<n-1)) {
          line( oldB[i][j].x, oldB[i][j].y, oldB[i][j+1].x, oldB[i][j+1].y);
        }
        else if ((i<n-1) && (j == (n-1))) {
          line( oldB[i][j].x, oldB[i][j].y, oldB[i+1][j].x, oldB[i+1][j].y);
        }
      }
    }
    old_levels = levels;
    old_scaleRange = scaleRange;
    // println("call");
  }
}


class Cell {
  // A cell object knows about its location in the grid as well as its size with the variables x,y,w,h.
  float x, y;   // x,y location

  // Cell Constructor
  Cell(float tempX, float tempY) {
    x = tempX;
    y = tempY;
  }
}

// end

// start
// sample is on http://beautifulprogramming.com/infinite-arboretum/
boolean autoplay = false;
boolean showsFPS = false;
boolean clearsBackground = true;
boolean windEnabled = true;
PFont font;
float rotRange = 10;
float rotDecay = 1.1;
float sizeDecay = 0.7;
float lengthDecay = 0.91;
int levelMax = 8;
int leafLevel = 2;
float leafChance = 0.3;
float branchHue = 50;
float leafHue = 150;
float leafSat = 100;
float mouseWind = 0;
float mouseWindV = 0;
float startLength;
float startSize;
color trunkColor;
color bgColor;
int time = 0;
float lengthRand = 1.0;
float bloomWidthRatio = 0.6;
float bloomSizeAverage = 15;

float mDamp = 0.00002;
float wDamp = 0.003;
float mFriction = 0.98;

float flowerChance = 0.1;
color flowerColor;
float flowerWidth = 10;
float flowerHeight = 20;

Node node;

void setup() {
  size(940, 540);
  colorMode(HSB);
 // font = createFont("Helvetica", 24);
  ellipseMode(CENTER);

  randomize();
  reset();
}

void draw() {
  if (autoplay) {
    time++;
    if (time > 600) {
      time = 0;
      randomize();
      reset();
    }
  }
  float dx = mouseX - pmouseX;
  mouseWindV += dx * mDamp;
  mouseWindV += (0 - mouseWind) * wDamp;
  mouseWindV *= mFriction;
  mouseWind += mouseWindV;
  if (clearsBackground) background(bgColor);
  if (showsFPS) displayFPS();
  translate(width/2, height);
  node.draw();
}

void reset() {
  background(bgColor);
  node = new Node(startLength, startSize, rotRange, 0);
}

void randomize() {
  randomizeBackground();
  randomizeColor();
  rotRange = random(20, 60);
  rotDecay = random(0.9, 1.1);
  startLength = random(20, 80);
  startSize = random(3, 20);
  lengthRand = random(0.0, 0.2);
  leafChance = random(0.3, 0.9);
  sizeDecay = random(0.6, 0.7);
  lengthDecay = map(startLength, 20, 80, 1.1, 0.85);
  leafLevel = random(0, 4);
  bloomWidthRatio = random(0.01, 0.9);
  bloomSizeAverage = random(10, 40);
  mDamp = 0.00002;
  wDamp = 0.005;
  mFriction = 0.96;
  flowerWidth = random(5, 15);
  flowerHeight = random(10, 30);
  flowerChance = 0.1;
}

void randomizeBackground() {
    bgColor = color(random(255), random(0, 100), 255);
}

void randomizeColor() {
  branchHue = random(0, 255);
  leafHue = random(0, 255);
  leafSat = random(0, 255);
  flowerColor = color(random(255), random(0, 255), 255);
  if (node) node.randomizeColor();
}

void displayFPS() {
  textFont(font, 18);
  fill(150);
  String output = "fps=";
  output += (int) frameRate;
  text(output, 10, 30);
}

void keyPressed() {
  if (key == 'q') showsFPS = !showsFPS;
  if (key == 'w') autoplay = !autoplay;
  if (key == 'e') clearsBackground = !clearsBackground;
  if (key == 'r') windEnabled = !windEnabled;
  if (key == 't') reset();
  if (key == 'y') randomizeBackground();
  if (key == 'u') randomizeColor();
}

void mousePressed() {
  time = 0;
  randomize();
  reset();
}

class Node {
  float len;
  float size;
  float rot;
  int level;
  float s = 0;
  float windFactor = 1.0;
  boolean doesBloom;
  color branchColor;
  float bloomSize;
  color leafColor;
  float leafRot;
  float leafScale = 0.0;
  int leafDelay;
  boolean doesFlower;
  float flowerScale = 0.0;
  float flowerScaleT = 1.0;
  float flowerBright = 255;
  int flowerDelay;

  Node n1;
  Node n2;

  Node(float _len, float _size, float _rotRange, int _level) {
    len = _len * (1 + random(-lengthRand, lengthRand));
    size = _size;
    level = _level;
    rot = radians(random(-_rotRange, _rotRange));
    if (level < leafLevel) rot *= 0.3;
    if (level == 0 ) rot = 0;
    windFactor = random(0.2, 1);
    doesBloom = false;
    if (level >= leafLevel && random(1) < leafChance) doesBloom = true;
    bloomSize = random(bloomSizeAverage*0.7, bloomSizeAverage*1.3);
    leafRot = radians(random(-180, 180));
    flowerScaleT = random(0.8, 1.2);
    flowerDelay = round(random(200, 250));
    leafDelay = round(random(50, 150));
    randomizeColor();

    if (random(1) < flowerChance) doesFlower = true;

    float rr = _rotRange * rotDecay;

    if (level < levelMax) {
      n1 = new Node(len*lengthDecay, size*sizeDecay, rr, level+1);
      n2 = new Node(len*lengthDecay, size*sizeDecay, rr, level+1);
    }
  }


  void draw() {
    strokeWeight(size);
    s += (1.0 - s) / (15 + (level*5));
    scale(s);
    pushMatrix();
    if (level >= leafLevel) stroke(branchColor);
    else stroke(0);
    float rotOffset = sin( noise( (float)millis() * 0.000006  * (level*1) ) * 100 );
    if (!windEnabled) rotOffset = 0;
    rotate(rot + (rotOffset * 0.1 + mouseWind) * windFactor);
    line(0, 0, 0, -len);
    translate(0, -len);

    // draw leaves
    if (doesBloom) {
      if (leafDelay < 0) {
        leafScale += (1.0 - leafScale) * 0.05;
        fill(leafColor);
        noStroke();
        pushMatrix();
        scale(leafScale);
        rotate(leafRot);
        translate(0, -bloomSize/2);
        ellipse(0, 0, bloomSize*bloomWidthRatio, bloomSize);
        popMatrix();
      }
      else {
        leafDelay--;
      }
    }

    // draw flowers
    if (doesFlower && level > levelMax-3) {
      if (flowerDelay < 0) {
        pushMatrix();
        flowerScale += (flowerScaleT - flowerScale) * 0.1;
        scale(flowerScale);
        rotate(flowerScale*3);
        noStroke();
        fill(hue(flowerColor), saturation(flowerColor), flowerBright);
        ellipse(0, 0, flowerWidth, flowerHeight);
        rotate(radians(360/3));
        ellipse(0, 0, flowerWidth, flowerHeight);
        rotate(radians(360/3));
        ellipse(0, 0, flowerWidth, flowerHeight);
        fill(branchColor);
        ellipse(0, 0, 5, 5);
        popMatrix();
      } else {
        flowerDelay--;
      }
    }
    pushMatrix();
    if (n1) n1.draw();
    popMatrix();
    pushMatrix();
    if (n2) n2.draw();
    popMatrix();
    popMatrix();
  }

  void randomizeColor() {
    branchColor = color(branchHue, random(170, 255), random(100, 200));
    leafColor = color(leafHue, leafSat, random(100, 255));
    flowerBright = random(200, 255);

    if (n1) n1.randomizeColor();
    if (n2) n2.randomizeColor();
  }
}
// end

// begin
let metaballShader;

const N_balls = 20,
			metaballs = [];

function preload() {
	metaballShader = getShader(this._renderer);
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	shader(metaballShader);

	for (let i = 0; i < N_balls; i ++) metaballs.push(new Metaball());
}

function draw() {
	var data = [];

	for (const ball of metaballs) {
		ball.update();
		data.push(ball.pos.x, ball.pos.y, ball.radius);
	}

	metaballShader.setUniform("metaballs", data);
	rect(0, 0, width, height);
}

// OpenProcessing has a bug where it always creates a scrollbar on Chromium.
function mouseWheel() { // This stops the canvas from scrolling by a few pixels.
	return false;
}
// end


// begin
function setup() {
	createCanvas(windowWidth, windowHeight);
}

function draw() {
	blendMode(BLEND);
	background(245);
	//noStroke();
	blendMode(MULTIPLY);
	noStroke();
	translate(width/2,height/2);
	fill(0,150,240);
	drawLiq(18,50,20,100);
	fill(240,240,0);
	drawLiq(15,60,25,120);
	fill(240,0,240);
	drawLiq(12,45,15,150);
}


function drawLiq(vNnum,nm,sm,fcm){
	push();
	rotate(frameCount/fcm);
	let dr = TWO_PI/vNnum;
	beginShape();
	for(let i = 0; i  < vNnum + 3; i++){
		let ind = i%vNnum;
		let rad = dr *ind;
		let r = height*0.3 + noise(frameCount/nm + ind) * height*0.1 + sin(frameCount/sm + ind)*height*0.05;
		curveVertex(cos(rad)*r, sin(rad)*r);
	}
	endShape();
	pop();
}
// end
