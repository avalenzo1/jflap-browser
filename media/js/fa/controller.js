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
        { "label": "Fast Run... (works kinda... :( )", "shortcut": ["ctrl", "S"], "action": () => window.automaton.fastRun() },
        { "label": "Multiple Run...", "shortcut": ["shift", "ctrl", "S"], "action": () => console.log("Save As") },
    ]
}]);

let initialPos, activeState;
let frSt, toSt;

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
    activeState = window.automaton.findStateByPos(mouseX, mouseY); // add activeState

    switch (window.automaton.mode) {
        case Mode.ATTRIBUTE_EDITOR:
            break;
        case Mode.STATE_CREATOR:
            window.automaton.addState(mouseX, mouseY);
            break;
        case Mode.TRANSITION_CREATOR:
            break;
        case Mode.DELETER:
            break;
        case Mode.NONE:
            console.warn("No Mode Set");
            break;
    }
}

function mouseDragged() {
    if (mouseX < 0 || mouseY < 0) return;

    switch (window.automaton.mode) {
        case Mode.ATTRIBUTE_EDITOR:
            activeState.x = mouseX;
            activeState.y = mouseY;
            activeState.dragged = true;
            break;
        case Mode.STATE_CREATOR:
            break;
        case Mode.TRANSITION_CREATOR:
            break;
        case Mode.DELETER:
            break;
        case Mode.NONE:
            break;
    }
}

function mouseReleased() {
    if (mouseX < 0 || mouseY < 0) return;

    switch (window.automaton.mode) {
        case Mode.ATTRIBUTE_EDITOR:
            activeState.dragged = false;
            break;
        case Mode.STATE_CREATOR:
            break;
        case Mode.TRANSITION_CREATOR:
            let fromState = activeState;
            let toState = window.automaton.findStateByPos(mouseX, mouseY);

            if (!fromState || !toState) break;

            newTransition(fromState, toState);


            break;
        case Mode.DELETER:
            let pressedState = window.automaton.findStateByPos(mouseX, mouseY);

            if (pressedState) {
                window.automaton.removeState(activeState);
            }
            break;
        case Mode.NONE:
            break;
    }

    initialPos = null;
    activeState = null;
}

function newTransition(fromState, toState) {
    frSt = fromState;
    toSt = toState;
    let midpoint = createVector((fromState.x + toState.x) / 2, (fromState.y + toState.y) / 2);

    transitionInput.position(midpoint.x - transitionInput.width / 2, midpoint.y - transitionInput.height / 2);
    transitionInput.show();
    transitionInput.elt.focus();
}

function onInputEnter(event) {
    if (event.key == "Escape") {
        transitionInput.value('');
        transitionInput.hide();
        return;
    }
    if (!frSt || !toSt || event.key != "Enter") return;

    window.automaton.addTransition(frSt.id, toSt.id, transitionInput.value());

    transitionInput.value('');
    transitionInput.hide();
}