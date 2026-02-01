let transitionInput
let canvas;
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    canvas.elt.addEventListener("contextmenu", contextMenu);

    transitionInput = createInput('');
    transitionInput.parent("canvas");
    transitionInput.hide();
    transitionInput.elt.addEventListener('keydown', onInputEnter);
}

function drawState(state) {
    if (isInsideState(mouseX, mouseY, state.x, state.y)) {
        state.hovered = true;
    } else {
        state.hovered = false;
    }

    push();

    fill("#ffffff");

    if (state.isInitial) {
        triangle(state.x - 20, state.y, state.x - properties.state.radius * 2, state.y - properties.state.radius, state.x - properties.state.radius * 2, state.y + properties.state.radius)
    }

    fill("#ffff96");

    if (state.hovered) {
        fill("#ffffbc");
    }

    if (state.dragged) {
        fill("#65c7c7");
    }

    circle(state.x, state.y, properties.state.radius * 2);

    if (state.isFinal) {
        circle(state.x, state.y, properties.state.radius * 2 * 0.85);
    }

    fill("#000");
    textAlign(CENTER, CENTER);
    text(state.name, state.x, state.y);
    pop();
}

function drawTransition(transitions) {
    let transition;
    let read = "";

    for (let t of transitions) {
        console.log(t);
        read += t.read ? t.read : "\u03B5";
        read += "\n";
        transition = t;
    }

    // --- CURVATURE LOGIC START ---

    let midpoint = createVector((transition.from.x + transition.to.x) / 2, (transition.from.y + transition.to.y) / 2);

    let dx = transition.to.x - transition.from.x;
    let dy = transition.to.y - transition.from.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    // Unit vector along the line
    let ux = dx / dist;
    let uy = dy / dist;

    // Perpendicular vector for the curve offset
    let px = -uy;
    let py = ux;

    // Line start and end points at the circle edges
    let start = createVector(transition.from.x + ux * properties.state.radius, transition.from.y + uy * properties.state.radius);
    let end = createVector(transition.to.x - ux * properties.state.radius, transition.to.y - uy * properties.state.radius);
    let angle;

    let curvature = 30; // Change this value to adjust the depth of the curve

    if (transition.isSelfLoop) {
        let startAngle = -PI / 2 - PI / 6; // 210°
        let endAngle = -PI / 2 + PI / 6; // -30°

        // Points on the circle’s edge
        start.x = transition.from.x + properties.state.radius * cos(startAngle);
        start.y = transition.from.y + properties.state.radius * sin(startAngle);

        end.x = transition.from.x + properties.state.radius * cos(endAngle);
        end.y = transition.from.y + properties.state.radius * sin(endAngle);

        midpoint.x = transition.from.x;
        midpoint.y = transition.from.y - properties.state.radius * 2.5;
        angle = Math.atan2(end.y - midpoint.y, end.x - midpoint.x);
    } else {
        // Offset the midpoint perpendicularly to create the arc
        midpoint.x += px * curvature;
        midpoint.y += py * curvature;

        // Calculate angle based on the curve's end trajectory
        angle = Math.atan2(end.y - midpoint.y, end.x - midpoint.x);
    }

    push();

    angleMode(RADIANS);
    textAlign(CENTER, CENTER);

    // Draw text
    push();
    if (!transition.isSelfLoop) {
        // Translate to the offset midpoint so text follows the curve
        translate(midpoint.x, midpoint.y);
        // You can rotate the text to match the curve angle if desired
        // rotate(Math.atan2(dy, dx)); 
        text(read.trim(), 0, -12);
    } else {
        translate(midpoint.x, midpoint.y);
        text(read.trim(), 0, -6);
    }
    pop();

    // Line to connect states (Bezier Curve)
    push();
    noFill();
    // Control points set to midpoint to create a smooth arc
    bezier(start.x, start.y, midpoint.x, midpoint.y, midpoint.x, midpoint.y, end.x, end.y);
    pop();

    // Draw Arrow
    push();
    translate(end.x, end.y);
    rotate(angle);
    line(0, 0, -10, -5);
    line(0, 0, -10, 5);
    pop();

    pop();
}

function draw() {
    background(240);

    if (!window.automaton) {
        push();
        textSize(24);
        textAlign(CENTER, CENTER);
        fill("#ccc");
        text('Cannot render. No automaton instance given.', width / 2, height / 2);
        pop();
        return;
    }

    for (let [id, state] of window.automaton.states) {
        drawState(state);
    }

    for (let [key, transitions] of window.automaton.transitions) {
        drawTransition(transitions);
    }

    if (window.automaton.mode == Mode.TRANSITION_CREATOR && initialPos && activeState) {
        push();
        stroke("#ccc8");
        strokeWeight(3);
        line(initialPos.x, initialPos.y, mouseX, mouseY);
        pop();
    }

}