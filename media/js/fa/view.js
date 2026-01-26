let canvas;
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    canvas.elt.addEventListener("contextmenu", contextMenu);
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
    for (let transition in transitions) {
        console.log(transition)
    }
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

    for (let [from, transitions] of window.automaton.transitions) {
        drawTransition(transitions);
    }

    if (window.automaton.mode == Mode.TRANSITION_CREATOR && initialPos) {
        line(initialPos.x, initialPos.y, mouseX, mouseY);
    }

}