// @
// @ JFLAP
// @

// JFLAP Objects


// JFLAP Variables
let states = [];
let transitions = [];
let mode = Mode.NONE;

function setMode(mode) {
    if (!!Mode.hasOwnProperty(mode)) {
        console.warn("Could not set mode, invalid mode.");
        return;
    }

    currentMode = mode;

    if (mode === "deleter") {
        cursor('not-allowed');
    } else {
        cursor(ARROW);
    }
}

function createState(state) {
    let newState = state ? state : new State();

    // TODO: Check that state is valid

    console.log(newState);

    states.push(newState);
}

function createTransition(transition) {

}

// @
// @ p5.JS + CANVAS
// @

let canvas;
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    canvas.elt.addEventListener("contextmenu", contextMenu);
}

function draw() {
    background(240);
}

// @
// @ EVENT HANDLERS
// @

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function contextMenu(e) {
    e.preventDefault();
    console.log("Context menu opened");

    let state = findStateByPos(mouseX, mouseY);

    if (state) {
        createContextMenu('canvas', mouseX, mouseY, [{
            "label": "Final",
            "action": () => state.isFinal = !state.isFinal
        }, {
            "label": "Initial",
            "action": () => state.isInitial = !state.isInitial
        }]);
    }
}

function mousePressed() {
    if (mouseX < 0 || mouseY < 0) return;

    initialPos = createVector(mouseX, mouseY);

    if (currentMode == Mode.ATTRIBUTE_EDITOR) {
        
    }

    if (currentMode == Mode.STATE_CREATOR) createState();

    if (currentMode == Mode.TRANSITION_CREATOR) createTransition();

    if (currentMode == Mode.DELETER) {

    }
}

function mouseDragged() {
    if (mouseX < 0 || mouseY < 0) return;


}

function mouseReleased() {
    if (mouseX < 0 || mouseY < 0) return;
}

// Initialize menubar
let menubar = new MenuBar("menubar", [{
    "label": "File",
    "items": [
        {
            "label": "New...",
            "action": () => window.open('/')
        },
        { "label": "Open...", "shortcut": ["ctrl", "O"], "action": () => openFile() },
        { "label": "Save", "shortcut": ["ctrl", "S"], "action": () => saveFile() },
        { "label": "Save As...", "shortcut": ["shift", "ctrl", "S"], "action": () => console.log("Save As") },
        {
            "label": "Save Image As...",
            "items": [
                { "label": "Save Graph as JPG", "action": () => console.log("Save Graph as JPG") },
                { "label": "Save Graph as PNG", "action": () => console.log("Save Graph as PNG") },
                { "label": "Save Graph as GIF", "action": () => console.log("Save Graph as GIF") },
                { "label": "Save Graph as BMP", "action": () => console.log("Save Graph as BMP") }
            ]
        },
        { "label": "Dismiss Tab", "shortcut": ["ctrl", "D"], "action": () => console.log("Dismiss Tab") },
        { "label": "Close", "shortcut": ["ctrl", "W"], "action": () => console.log("Close") },
        { "label": "Print", "shortcut": ["ctrl", "P"], "action": () => console.log("Print") },
        { "label": "Quit", "shortcut": ["ctrl", "Q"], "action": () => console.log("Quit") }
    ]
}, {
    "label": "Input",
    "items": [
        { "label": "Step with Closure...", "shortcut": ["ctrl", "N"], "action": () => console.log("New") },
        { "label": "Step with State...", "shortcut": ["ctrl", "O"], "action": () => console.log("Open") },
        { "label": "Fast Run... (works kinda... :( )", "shortcut": ["ctrl", "S"], "action": () => fastRun() },
        { "label": "Multiple Run...", "shortcut": ["shift", "ctrl", "S"], "action": () => console.log("Save As") },
    ]
}]);