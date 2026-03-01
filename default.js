/* ==========================================================================
   1. GLOBAL VARIABLES & STATE MANAGEMENT
==========================================================================
*/

let gameState = "MENU";
let sim;
let side;

/* ==========================================================================
   2. P5.JS CORE FUNCTIONS (setup, draw, inputs)
==========================================================================
*/

function setup() {
  createCanvas(800, 600);
  textFont('Courier New');
  
  // Initialize the two game modes
  sim = new simulation();
  sim.setup();
  
  side = new sidescroller();
  side.setup();
}

function draw() {
  background(15, 10, 5);
  
  if (gameState === "MENU") {
    drawMainMenu();
  } else if (gameState === "SIMULATION") {
    sim.draw();
  } else if (gameState === "SIDESCROLLER") {
    side.draw();
  }
}

// Global Menu UI
function drawMainMenu() {
  randomSeed(42);
  for (let i = 0; i < 50; i++) {
    fill(30, 25, 20);
    noStroke();
    ellipse(random(width), random(height), random(5, 15));
  }
  
  textAlign(CENTER, CENTER);
  fill(255, 50, 50);
  textSize(42);
  text("MURDER MINDS", width / 2, height / 2 - 120);
  
  drawMenuButton(width / 2, height / 2, "SIMULATION", "The Silver Smith's Story");
  drawMenuButton(width / 2, height / 2 + 100, "SIDESCROLLER", "Pure Action Mode");
  
  fill(100);
  textSize(12);
  text("SELECT A MODE TO BEGIN", width / 2, height - 50);
}

function drawMenuButton(x, y, label, sub) {
  let isHover = mouseX > x - 150 && mouseX < x + 150 && mouseY > y - 30 && mouseY < y + 30;
  rectMode(CENTER);
  stroke(isHover ? 255 : 100);
  strokeWeight(2);
  fill(isHover ? 40 : 20);
  rect(x, y, 300, 60, 5);
  noStroke();
  fill(isHover ? color(0, 200, 50) : 200);
  textSize(22);
  text(label, x, y - 8);
  fill(120);
  textSize(10);
  text(sub, x, y + 15);
  rectMode(CORNER);
}

// Global Input Handling
function mousePressed() {
  if (gameState === "MENU") {
    if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 - 30 && mouseY < height / 2 + 30) {
      gameState = "SIMULATION";
    }
    if (mouseX > width / 2 - 150 && mouseX < width / 2 + 150 && mouseY > height / 2 + 70 && mouseY < height / 2 + 130) {
      gameState = "SIDESCROLLER";
    }
  }
}

function keyPressed() {
  if (gameState === "SIMULATION") sim.keyPressed();
  if (gameState === "SIDESCROLLER") side.keyPressed();
}

/* ==========================================================================
   3. SIMULATION MODE LOGIC (RPG/Menu Based)
==========================================================================
*/

function simulation() {
  let simulation_choiceNum = -1;
  let simulation_initialSuspectsNames = ["Caleb", "Mattox", "Bear", "Eli", "Nathan", "Sam", "Marvis"];
  let simulation_suspects = [];
  let simulation_suspicionLevel = 0;
  let simulation_instructionText = ""; 
  let simulation_shakeAmount = 0;
  let simulation_playerColor, simulation_aliveColor, simulation_removedColor, simulation_terminatorColor;

  this.setup = function() {
    simulation_playerColor = color(0, 150, 255);
    simulation_aliveColor = color(0, 200, 50);
    simulation_removedColor = color(100);
    simulation_terminatorColor = color(255, 0, 0);
  };

  this.draw = function() {
    simulation_drawMineshaftEnvironment();
    if (simulation_shakeAmount > 0) {
      translate(random(-simulation_shakeAmount, simulation_shakeAmount), random(-simulation_shakeAmount, simulation_shakeAmount));
      simulation_shakeAmount *= 0.9;
    }
    if (simulation_choiceNum === -1) {
      simulation_drawStartScreen();
    } else {
      simulation_drawSuspects();
      simulation_drawColorLegend();
      simulation_drawUI(); 
      simulation_drawCobweb(45, 45, 60, 8);
      simulation_drawCobweb(755, 555, 60, 8);
      fill(255, 100);
      textSize(10);
      textAlign(RIGHT, BOTTOM);
      text("ESC TO MENU", width - 50, height - 20);
      if (keyIsDown(27)) gameState = "MENU";
    }
  };

  function simulation_drawUI() {
    fill(0, 180);
    noStroke();
    rectMode(CENTER);
    rect(width / 2, height - 60, 700, 60, 5);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(simulation_instructionText, width / 2, height - 60);
    rectMode(CORNER);
  }

  function simulation_initializeSuspects() {
    simulation_suspects = [];
    simulation_suspects.push({ name: "You (Smith)", status: "player", color: simulation_terminatorColor, x: width / 2, y: 80 });
    let startX = width / 2 - 150;
    let row1Y = height / 2 - 80;
    let row2Y = height / 2 + 20;
    let spacing = 100;
    simulation_suspects.push({ name: "Jayden (Old)", status: "terminated", color: color(200, 200, 0), x: startX, y: row1Y });
    for (let i = 0; i < 3; i++) {
      simulation_suspects.push({ name: simulation_initialSuspectsNames[i], status: "alive", color: simulation_aliveColor, x: startX + (i + 1) * spacing, y: row1Y });
    }
    for (let i = 3; i < 7; i++) {
      simulation_suspects.push({ name: simulation_initialSuspectsNames[i], status: "alive", color: simulation_aliveColor, x: startX + (i - 3) * spacing, y: row2Y });
    }
    simulation_suspects.push({ name: "David (Investigator)", status: "alive", color: color(255, 150, 0), x: width / 2, y: height - 100 });
  }

  function simulation_drawMineshaftEnvironment() {
    background(25, 20, 15);
    randomSeed(42);
    for (let i = 0; i < 150; i++) {
      fill(40, 35, 30);
      noStroke();
      ellipse(random(width), random(height), random(2, 8));
    }
    fill(50, 30, 10);
    stroke(30, 15, 5);
    strokeWeight(4);
    rect(0, 0, 40, height);
    rect(width - 40, 0, 40, height);
    rect(0, 0, width, 30);
    simulation_drawLantern(120, 30);
    simulation_drawLantern(width - 120, 30);
  }

  function simulation_drawLantern(x, y) {
    stroke(255, 200, 50, 100);
    fill(255, 200, 50, 30);
    ellipse(x, y + 25, 50, 50);
    stroke(0);
    fill(150, 100, 0);
    rectMode(CENTER);
    rect(x, y + 25, 15, 20);
    rectMode(CORNER);
  }

  function simulation_drawColorLegend() {
    textAlign(LEFT, CENTER);
    textSize(10);
    noStroke();
    fill(0, 150);
    rect(45, 40, 210, 115);
    fill(simulation_terminatorColor);
    rect(55, 55, 10, 10);
    fill(255);
    text("MURDER MIND", 70, 55);
    fill(simulation_aliveColor);
    rect(55, 70, 10, 10);
    fill(255);
    text("ALIVE WORKER", 70, 70);
    fill(255, 150, 0);
    rect(55, 85, 10, 10);
    fill(255);
    text("INVESTIGATOR", 70, 85);
    fill(simulation_removedColor);
    rect(55, 100, 10, 10);
    fill(255);
    text("TERMINATED", 70, 100);
    fill(200, 200, 0);
    rect(55, 115, 10, 10);
    fill(255);
    text("JAYDEN (FOUND)", 70, 115);
    fill(150, 100, 255);
    rect(55, 130, 10, 10);
    fill(255);
    text("UNION LEADER", 70, 130);
  }

  function simulation_drawStartScreen() {
    textAlign(CENTER, CENTER);
    fill(simulation_terminatorColor);
    textSize(40);
    text("THE SILVER SMITH", width / 2, height / 2 - 80);
    fill(255);
    textSize(14);
    text("LORE: The silver is cold, the ground is deep.", width / 2, height / 2 - 20);
    text("One manager down, a whole mine to go.", width / 2, height / 2);
    textSize(16);
    fill(simulation_aliveColor);
    text("Press [ ENTER ] to begin the deception.", width / 2, height / 2 + 110);
  }

  function simulation_drawSuspects() {
    textAlign(CENTER, CENTER);
    for (let s of simulation_suspects) {
      let fillColor = s.color;
      if (s.status === "removed" || s.status === "terminated") fillColor = simulation_removedColor;
      else if (s.status === "Union") fillColor = color(150, 100, 255);
      fill(fillColor);
      stroke(255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(s.x, s.y, 50, 50);
      fill(255);
      noStroke();
      textSize(11);
      text(s.name, s.x, s.y + 40);
    }
    rectMode(CORNER);
  }

  function simulation_drawCobweb(x, y, size, sections) {
    stroke(255, 100); strokeWeight(0.5); noFill();
    for (let i = 0; i < sections; i++) {
      let angle = TWO_PI / sections * i;
      line(x, y, x + cos(angle) * size, y + sin(angle) * size);
    }
  }

  this.keyPressed = function() {
    if (keyCode === 27) gameState = "MENU";
    if (simulation_choiceNum === 99) {
        if (keyCode === ENTER) {
            gameState = "MENU";
            simulation_choiceNum = -1;
        }
        return;
    }
    if (simulation_choiceNum === -1) {
      if (keyCode === ENTER) {
        simulation_initializeSuspects();
        simulation_mainMenu();
      }
      return;
    }
    if (simulation_choiceNum === 0 && keyCode === ENTER) {
        if (simulation_checkEndGame()) return;
        simulation_mainMenu();
    }
    if (simulation_choiceNum === 1) {
      if (key === '1') simulation_handleEscapeAttempt();
      else if (key === '2') simulation_openTerminateMenu();
      else if (key === '3') simulation_handleSabotage();
      else if (key === '4') simulation_choiceNum = 0; 
    } 
    else if (simulation_choiceNum === 1.5) {
      let k = parseInt(key);
      if (k >= 1 && k <= 7) simulation_executeTermination(simulation_initialSuspectsNames[k - 1]);
    }
    else if (simulation_choiceNum === 3) {
      if (key === '1') simulation_handleUnionNegotiate();
      else if (key === '2') simulation_handleUnionAggressive();
    }
  };

  function simulation_mainMenu() {
    simulation_choiceNum = 1;
    simulation_instructionText = "1: Escape | 2: Terminate Worker | 3: Sabotage David | 4: Wait";
  }

  function simulation_checkEndGame() {
      let survivors = simulation_suspects.filter(s => s.status === "alive" || s.status === "Union").length;
      if (survivors === 0) {
          simulation_instructionText = "THE MINE IS SILENT. Only you remain. [ENTER to Exit]";
          simulation_choiceNum = 99;
          return true;
      }
      return false;
  }

  function simulation_handleEscapeAttempt() {
    let roll = random(100);
    let penalty = simulation_suspicionLevel * 10;
    if (roll > (40 + penalty)) {
      simulation_instructionText = "SUCCESS: You slipped into the night. [Press ENTER]";
    } else {
      simulation_instructionText = "CAUGHT: The guards were waiting at the lift. [Press ENTER]";
    }
    simulation_choiceNum = 99;
  }

  function simulation_openTerminateMenu() {
    simulation_choiceNum = 1.5;
    simulation_instructionText = "Select 1-7 to Terminate. Suspicion rises with every body.";
  }

  function simulation_executeTermination(targetName) {
    let roll = random(100);
    let failureThreshold = 5 + (simulation_suspicionLevel * 8); 
    let target = simulation_suspects.find(s => s.name === targetName);
    if (roll > failureThreshold) { 
      if (target && target.status === "alive") {
        target.status = "terminated";
        simulation_shakeAmount = 20;
        simulation_suspicionLevel += 1;
        simulation_instructionText = "Silenced " + targetName + ". [Press ENTER]";
        if (simulation_suspicionLevel > 2 && random() < 0.4) simulation_triggerUnion();
      } else {
        simulation_instructionText = "They are already gone. [Press ENTER]";
      }
    } else { 
      simulation_suspicionLevel += 2;
      simulation_instructionText = "FAIL: Caught in the act! David has called for help. [Press ENTER]";
      simulation_choiceNum = 99;
      return;
    }
    simulation_choiceNum = 0;
  }

  function simulation_handleSabotage() {
    let roll = random(100);
    if (roll > 50) {
      let david = simulation_suspects.find(s => s.name === "David (Investigator)");
      if (david) david.status = "terminated";
      simulation_instructionText = "David met an 'accident'. The mine is yours. [Press ENTER]";
      simulation_choiceNum = 0; 
    } else {
      simulation_suspicionLevel += 3;
      simulation_instructionText = "David saw you tampering with the lift! [Press ENTER]";
      if (simulation_suspicionLevel > 8) simulation_choiceNum = 99;
      else simulation_choiceNum = 0;
    }
  }

  function simulation_triggerUnion() {
    let leader = simulation_suspects.find(s => s.status === "alive");
    if (leader) {
      leader.status = "Union";
      simulation_instructionText = "Riot! " + leader.name + " leads the workers. [Press ENTER]";
      simulation_choiceNum = 3;
    }
  }

  function simulation_handleUnionNegotiate() {
    simulation_instructionText = "You bought their silence. [Press ENTER]";
    simulation_suspicionLevel = max(0, simulation_suspicionLevel - 2);
    simulation_choiceNum = 0;
  }

  function simulation_handleUnionAggressive() {
    simulation_shakeAmount = 30;
    simulation_instructionText = "The workers revolted! You were cast into the pit. [Press ENTER]";
    simulation_choiceNum = 99;
  }
}

/* ==========================================================================
   4. SIDESCROLLER MODE LOGIC (Action/Platformer Based)
==========================================================================
*/

function sidescroller() {
  let sc_choiceNum = -1;
  let sc_currentRoom = "Bedroom";
  let sc_initialSuspectsNames = ["Caleb", "Nathan", "Eli", "Marvis", "Sam", "Bear", "Mattox"];
  let sc_suspects = [];
  let sc_playerX = 400;
  let sc_worldOffset = 0;
  const sc_groundY = 500;
  let sc_worldWidth = 3000;
  let sc_shakeAmount = 0;
  let sc_gameOver = false;
  let sc_gameOverText = "";
  let sc_subText = "";
  let sc_davidEncounters = 0;
  const sc_MAX_ENCOUNTERS = 5;
  let sc_hasLoggedEncounter = false;
  let sc_silverPouch = 0;
  let sc_isPlayerMining = false;
  let sc_bladeTimer = 0;
  let sc_msg = ""; 
  let sc_msgTimer = 0;
  
  let sc_playerColor, sc_aliveColor, sc_removedColor, sc_terminatorColor, sc_investigatorColor, sc_jaydenColor, sc_silverColor, sc_shopColor;

  this.setup = function() {
    sc_playerColor = color(0, 150, 255);
    sc_aliveColor = color(0, 200, 50);
    sc_removedColor = color(100);
    sc_terminatorColor = color(255, 0, 0);
    sc_investigatorColor = color(255, 150, 0);
    sc_jaydenColor = color(200, 200, 0);
    sc_silverColor = color(220, 220, 255);
    sc_shopColor = color(120, 80, 200);
    sc_initializeSuspects();
  };

  function sc_initializeSuspects() {
    sc_suspects = [];
    sc_suspects.push({ name: "Jayden", status: "Dead", color: sc_jaydenColor, x: 2100, y: sc_groundY - 15, room: "Level 4", isStatic: true });
    // Broker kept for logic but room is "shut down"
    sc_suspects.push({ name: "The Broker", status: "Hidden", color: sc_shopColor, x: 400, y: sc_groundY - 30, room: "Level 3", isStatic: true });
    for (let i = 0; i < sc_initialSuspectsNames.length; i++) {
      let startPos = 600 + (i * 400);
      let assignedRoom;
      if (i < 2) assignedRoom = "Level 2";
      else if (i < 5) assignedRoom = "Level 4";
      else assignedRoom = "Mineshaft";
      sc_suspects.push({ 
        name: sc_initialSuspectsNames[i], 
        status: "Working", 
        color: sc_aliveColor, 
        x: startPos % 2800, 
        y: sc_groundY - 30, 
        anchorX: startPos % 2800, 
        dir: random() > 0.5 ? 1 : -1, 
        speed: random(0.4, 0.9), 
        range: random(50, 150), 
        room: assignedRoom 
      });
    }
    sc_suspects.push({ 
        name: "David", 
        status: "Investigating", 
        color: sc_investigatorColor, 
        x: 2500, 
        y: sc_groundY - 30, 
        anchorX: 1800, 
        dir: -1, 
        speed: 1.7, 
        range: 1100, 
        room: "Mineshaft", 
        visionRange: 250 
    });
  }

  this.draw = function() {
    if (sc_choiceNum === -1) { sc_drawMineshaftEnvironment(); sc_drawStartScreen(); return; }
    if (sc_gameOver) { sc_drawEndingScreen(); return; }
    sc_worldWidth = (sc_currentRoom === "Bedroom" || sc_currentRoom === "Level 3" || sc_currentRoom === "Outside") ? 800 : 3000;
    if (!sc_isPlayerMining && sc_bladeTimer <= 0) {
      if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) sc_playerX -= 5;
      if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) sc_playerX += 5;
    }
    sc_playerX = constrain(sc_playerX, 20, sc_worldWidth - 20);
    sc_worldOffset = lerp(sc_worldOffset, sc_playerX - width / 2, 0.1);
    sc_worldOffset = constrain(sc_worldOffset, 0, sc_worldWidth - width);
    sc_updateNPCs();
    sc_updateDavidAI();
    if (sc_isPlayerMining && frameCount % 60 === 0) { sc_silverPouch++; sc_shakeAmount = 2; }
    if (sc_bladeTimer > 0) sc_bladeTimer--;
    if (sc_msgTimer > 0) sc_msgTimer--;
    
    push();
    if (sc_shakeAmount > 0) { translate(random(-sc_shakeAmount, sc_shakeAmount), random(-sc_shakeAmount, sc_shakeAmount)); sc_shakeAmount *= 0.9; }
    translate(-sc_worldOffset, 0);
    if (sc_currentRoom === "Bedroom") sc_drawBedroom();
    else if (sc_currentRoom === "Level 3") sc_drawShutDownShop();
    else if (sc_currentRoom === "Outside") sc_drawOutside();
    else { sc_drawMineshaftEnvironment(); sc_drawElevator(); }
    sc_drawSuspects();
    push();
    translate(sc_playerX, sc_groundY - 30);
    if (sc_isPlayerMining) rotate(sin(frameCount * 0.3) * 0.2);
    fill(sc_bladeTimer > 0 ? 255 : sc_terminatorColor); 
    stroke(255); rectMode(CENTER);
    rect(0, 0, 30, 60);
    pop();
    pop();
    sc_drawHUD();
  };

  function sc_drawOutside() {
    background(10, 15, 30);
    fill(100, 100, 150, 50); 
    for(let i=0; i<10; i++) ellipse(random(width), random(height), 2, 2);
    fill(20, 50, 20); rect(0, sc_groundY, 800, height - sc_groundY);
    fill(40); stroke(100); rect(20, 0, 80, sc_groundY); // Lift back down
    fill(255); textAlign(CENTER); text("MINE ENTRANCE", 400, 200);
    if (sc_playerX > 600) {
        fill(0, 255, 0); textSize(20); text("ESCAPE POINT", 700, sc_groundY - 100);
        textSize(10); text("[E] TO WIN", 700, sc_groundY - 80);
    }
  }

  function sc_drawMineshaftEnvironment() {
    background(20, 18, 15);
    randomSeed(123);
    for(let i=0; i<sc_worldWidth; i+=120) {
        for(let j=0; j<sc_groundY; j+=100) {
            fill(35, 30, 25); noStroke();
            beginShape();
            vertex(i + random(-20,20), j + random(-20,20));
            vertex(i + 80 + random(-20,20), j + 10 + random(-20,20));
            vertex(i + 70 + random(-20,20), j + 90 + random(-20,20));
            vertex(i + 10 + random(-20,20), j + 80 + random(-20,20));
            endShape(CLOSE);
        }
    }
    fill(200, 200, 255, 200);
    for (let i = 0; i < sc_worldWidth; i += 80) {
        if(random() > 0.85) {
            let sx = i + random(50); let sy = random(sc_groundY - 100);
            rect(sx, sy, 12, 12, 2);
            fill(255, 255, 255, 150); rect(sx+2, sy+2, 4, 4);
            fill(200, 200, 255, 200);
        }
    }
    fill(5, 3, 0); rect(0, sc_groundY, sc_worldWidth, height - sc_groundY);
  }

  function sc_drawBedroom() {
    background(30, 25, 20);
    fill(45, 30, 15); rect(100, sc_groundY - 50, 150, 50);
    fill(10); stroke(100, 50, 0); rect(700, sc_groundY - 140, 70, 140);
    if (sc_playerX > 640) { fill(255); textAlign(CENTER); text("[E] TO MINE", 735, sc_groundY - 150); }
  }

  function sc_drawShutDownShop() {
    background(10, 8, 5); // Darker, empty room
    fill(30); stroke(50); rect(300, sc_groundY - 40, 250, 40); // Bare counter
    fill(40); stroke(100); rect(20, 0, 80, sc_groundY); // Lift
    fill(150); textAlign(CENTER); textSize(10); text("ABANDONED LEVEL", 400, sc_groundY - 100);
    if (sc_msgTimer > 0) { fill(0, 255, 0); text(sc_msg, 400, sc_groundY - 130); }
  }

  function sc_drawElevator() {
    fill(40); stroke(100); rect(2800, 0, 150, sc_groundY);
    stroke(150); line(2875, 0, 2875, sc_groundY);
    fill(255); textAlign(CENTER); textSize(10);
    text("LEVELS 1-5", 2875, 50);
  }

  function sc_updateDavidAI() {
    let d = sc_suspects.find(s => s.name === "David");
    if (!d || d.room !== sc_currentRoom || d.status === "Dead") return;
    d.x += d.dir * d.speed;
    if (abs(d.x - d.anchorX) > d.range) d.dir *= -1;
    let facing = (d.dir === 1 && sc_playerX > d.x) || (d.dir === -1 && sc_playerX < d.x);
    if (facing && abs(d.x - sc_playerX) < d.visionRange) {
      if (!sc_hasLoggedEncounter) { sc_davidEncounters++; sc_hasLoggedEncounter = true; sc_shakeAmount = 5; }
    } else if (abs(d.x - sc_playerX) > d.visionRange + 50) sc_hasLoggedEncounter = false;
    if (sc_davidEncounters >= sc_MAX_ENCOUNTERS) { sc_gameOver = true; sc_gameOverText = "ARRESTED"; sc_subText = "The investigator caught you."; }
  }

  function sc_updateNPCs() {
    for (let s of sc_suspects) {
      if (s.status === "Working" && s.room === sc_currentRoom) {
        s.x += s.dir * s.speed;
        if (abs(s.x - s.anchorX) > s.range) s.dir *= -1;
      }
    }
  }

  function sc_drawSuspects() {
    for (let s of sc_suspects) {
      if (s.room === sc_currentRoom && s.status !== "Hidden") {
        if (s.status === "Dead") {
          noStroke(); fill(180, 0, 0); rect(s.x - 30, sc_groundY - 5, 60, 10); fill(sc_removedColor);
        } else { fill(s.color); }
        stroke(255); rectMode(CENTER); push(); 
        translate(s.x, s.status === "Dead" ? sc_groundY - 15 : sc_groundY - 30);
        if(s.status === "Dead") rotate(HALF_PI); rect(0, 0, 30, 60); pop();
        rectMode(CORNER); fill(255); noStroke(); textAlign(CENTER); textSize(10);
        text(s.name, s.x, sc_groundY - 70);
      }
    }
  }

  function sc_drawHUD() {
    fill(20, 200); stroke(255); rect(width - 160, 20, 140, 35, 5);
    fill(255); noStroke(); textAlign(CENTER, CENTER); text("WATCHED: " + sc_davidEncounters + "/5", width - 90, 38);
    fill(sc_silverColor); rect(20, 20, 120, 35, 5);
    fill(0); text("SILVER: " + sc_silverPouch + "oz", 80, 38);
    fill(255); text("ROOM: " + sc_currentRoom, width/2, 25);
    let escapeChance = map(sc_davidEncounters, 0, 5, 100, 0);
    fill(50); rect(width/2 - 100, 40, 200, 15, 3);
    fill(0, 200, 100); rect(width/2 - 100, 40, escapeChance * 2, 15, 3);
    fill(255); textSize(9); text("CHANCE OF ESCAPE: " + floor(escapeChance) + "%", width/2, 48);
  }

  this.keyPressed = function() {
    if (keyCode === 27) gameState = "MENU";
    if (sc_gameOver && keyCode === ENTER) { gameState = "MENU"; sc_gameOver = false; sc_choiceNum = -1; sc_initializeSuspects(); return; }
    if (sc_choiceNum === -1 && keyCode === ENTER) { sc_choiceNum = 1; return; }
    if (keyCode === 32 && !["Bedroom", "Level 3", "Outside"].includes(sc_currentRoom)) sc_isPlayerMining = !sc_isPlayerMining;
    if (key === 'f' || key === 'F') sc_handleBladeAction();
    
    if (key === 'e' || key === 'E') {
      if (sc_currentRoom === "Bedroom" && sc_playerX > 640) { sc_currentRoom = "Mineshaft"; sc_playerX = 100; }
      else if (sc_currentRoom === "Outside" && sc_playerX > 650) {
          sc_gameOver = true; sc_gameOverText = "ESCAPED"; sc_subText = "You are free without silver.";
      }
      else if (dist(sc_playerX, 0, 2875, 0) < 100 || (["Level 3", "Outside"].includes(sc_currentRoom) && sc_playerX < 100)) { 
          let p = prompt("Enter Level (1: Mine, 2: Lvl 2, 3: Lvl 3, 4: Lvl 4, 5: Outside)");
          if (p === "1") sc_currentRoom = "Mineshaft"; else if (p === "2") sc_currentRoom = "Level 2";
          else if (p === "3") sc_currentRoom = "Level 3"; else if (p === "4") sc_currentRoom = "Level 4";
          else if (p === "5") sc_currentRoom = "Outside";
          sc_playerX = (["Level 3", "Outside"].includes(sc_currentRoom)) ? 100 : 2700;
      }
    }
    
    // Trade Logic preserved for Level 3
    if ((key === 'b' || key === 'B') && sc_currentRoom === "Level 3" && dist(sc_playerX, 0, 400, 0) < 100) {
      if (sc_silverPouch >= 5 && sc_davidEncounters > 0) {
        sc_silverPouch -= 5; sc_davidEncounters--; sc_msg = "POINT REMOVED"; sc_msgTimer = 120; sc_shakeAmount = 2;
      } else if (sc_davidEncounters === 0) { sc_msg = "ALREADY SECURE"; sc_msgTimer = 120; }
      else { sc_msg = "NOT ENOUGH SILVER"; sc_msgTimer = 120; }
    }
  };

  function sc_handleBladeAction() {
    if (["Bedroom", "Level 3", "Outside"].includes(sc_currentRoom)) return;
    sc_bladeTimer = 15;
    for (let s of sc_suspects) {
      if (s.room === sc_currentRoom && s.status !== "Dead" && dist(sc_playerX, 0, s.x, 0) < 70) {
        s.status = "Dead"; sc_shakeAmount = 10; break;
      }
    }
  }

  function sc_drawStartScreen() {
    fill(0, 180); rect(0, 0, width, height);
    textAlign(CENTER, CENTER); fill(sc_terminatorColor); textSize(34); text("MURDER MINDS", width / 2, height / 2 - 40);
    fill(255); textSize(16); text("Press [ ENTER ] to Descend", width / 2, height / 2 + 70);
  }

  function sc_drawEndingScreen() {
    fill(0, 200); rect(0, 0, width, height);
    textAlign(CENTER, CENTER); fill(sc_terminatorColor); textSize(42); text(sc_gameOverText, width / 2, height / 2 - 20);
    fill(255); text(sc_subText, width / 2, height / 2 + 30);
  }
}