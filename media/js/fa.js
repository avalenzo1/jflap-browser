// https://editor.p5js.org/Trolley33/sketches/aD1ehiyhv

let fileHandle;
let canvasContainer = document.getElementById("canvas");
let canvas;
let states = [];
let transitions = [];
let currentMode;

let initialPos;

let activeElement;

function prettifyXML(xmlString) {
    // Parse the XML string into a DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        console.error("Error parsing XML:", parserError[0].textContent);
        return xmlString; // fallback
    }

    // Serialize it back to a string
    const serializer = new XMLSerializer();
    let pretty = serializer.serializeToString(xmlDoc);

    // Add indentation (2 spaces)
    let formatted = "";
    const reg = /(>)(<)(\/*)/g;
    pretty = pretty.replace(reg, "$1\r\n$2$3"); // add line breaks
    let pad = 0;
    pretty.split("\r\n").forEach((line) => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (line.match(/^<\/\w/)) {
            if (pad !== 0) pad -= 1;
        } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        formatted += "  ".repeat(pad) + line + "\r\n";
        pad += indent;
    });

    return formatted.trim();
}

function getXML() {
    let xmlString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<jflap>
  <!--Created with JFLAP 7.1.-->
  <type>fa</type>
  <automaton>
    ${states.map(state => `
      <state id="${state.id}" name="${state.name}">
        <x>${state.x}</x>
        <y>${state.y}</y>
        ${state.isFinal ? '<final/>' : ''}
        ${state.isInitial ? '<initial/>' : ''}
      </state>`).join('')}
    ${transitions.map(transition => transition.read.map(read => `
      <transition>
        <from>${transition.from.id}</from>
        <to>${transition.to.id}</to>
        <read>${read}</read>
      </transition>`).join('')).join('')}
  </automaton>
</jflap>`;
    return prettifyXML(xmlString);
}

function addTransition(newTransition) {
    if (!newTransition.isValid()) {
        return;
    }

    let possibleExistingTransition = transitions.find(t => t.from.id == newTransition.from.id && t.to.id == newTransition.to.id);

    if (possibleExistingTransition) {
        console.log("Same in->out different read")
        if (!possibleExistingTransition.read.includes(newTransition.read[0]))
            possibleExistingTransition.read.push(newTransition.read[0]);
    } else {
        console.log("New read");
        transitions.push(newTransition);
    }
}

function removeTransition() {

}

function findInitialState() {
    for (let i = states.length - 1; i >= 0; i--) {
        if (states[i].isInitial) {
            return states[i];
        }
    }
}

function findStateByPos(x, y) {
    for (let i = states.length - 1; i >= 0; i--) {
        if (states[i].isInside(x, y)) {
            return states[i];
        }
    }
}

function setMode(mode) {
    currentMode = mode;

    if (mode === "deleter") {
        cursor('not-allowed');

    } else {
        cursor(ARROW);
    }
}

function findReachableStates(state, read) {
    if (state.length <= 0) return [];

    console.log("Finding next states for " + state.name + " reading '" + read + "'")
    let reachableStates = [];

    transitions.forEach(transition => {
        if (transition.read.includes(read) && transition.from.id == state.id) {
            reachableStates.push(transition.to);
        }
    });

    console.log(reachableStates);

    return reachableStates;
}

function accepts(string) {
    let initialState = findInitialState();

    if (!initialState) {
        throw "No initial state provided.";
    }

    let alreadyAccepted = false;

    function acceptsHelper(states, string, index) {
        console.log("acceptsHelper(", states, index, string[index], ")");

        if (alreadyAccepted) return true;

        if (states.length <= 0) {
            return false;
        }

        if (string.length <= index) {
            for (let state of states) {
                alreadyAccepted = true;
                if (state.isFinal) return true;
            }
            return false;
        }

        for (let state of states) {
            console.log("epsilon")
            let epsilonReachableStates = findReachableStates(state, '');
            // Bug this will never ender since I dont update index oops!
            if (acceptsHelper(epsilonReachableStates, string, index)) {
                return true;
            }

            let symbolReachableStates = findReachableStates(state, string[index]);
            if (acceptsHelper(symbolReachableStates, string, index + 1)) {
                return true;
            }
        }

        return false;
    }

    return acceptsHelper([initialState], string, 0);
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    canvas.elt.addEventListener("contextmenu", contextMenu);
}

class State {
    constructor() {
        this.id = states.length.toString();
        this.name = `q${this.id}`;

        this.x = mouseX;
        this.y = mouseY;

        this._isInitial = false;
        this.isFinal = false;

        this.hovered = false;
        this.dragged = false;

        this.radius = 20;

        console.log(this);

        return this;
    }

    get isInitial() {
        return this._isInitial;
    }

    set isInitial(isInitial) {
        let initialState = findInitialState();

        // If we already have an initial state, set that false
        if (initialState && isInitial) {
            initialState.isInitial = false;
        }

        this._isInitial = isInitial;
    }

    parseNode(node) {
        this.id = node.getAttribute("id");
        this.name = node.getAttribute("name");

        this.x = Number(node.querySelector("x").textContent);
        this.y = Number(node.querySelector("y").textContent);

        this.isInitial = !!node.querySelector("initial");
        this.isFinal = !!node.querySelector("final");

        console.log(this);

        return this;
    }

    isInside(x, y) {
        const d = dist(this.x, this.y, x, y);
        return d <= this.radius;
    }

    draw() {
        if (this.isInside(mouseX, mouseY)) {
            this.hovered = true;
        } else {
            this.hovered = false;
        }

        push();

        fill("#ffffff");

        if (this.isInitial) {
            triangle(this.x - this.radius, this.y, this.x - this.radius * 2, this.y - this.radius, this.x - this.radius * 2, this.y + this.radius)
        }

        fill("#ffff96");

        if (this.hovered) {
            fill("#ffffbc");
        }

        if (this.dragged) {
            fill("#65c7c7");
        }




        circle(this.x, this.y, this.radius * 2);

        if (this.isFinal) {
            circle(this.x, this.y, this.radius * 2 * 0.85);
        }

        fill("#000");
        textAlign(CENTER, CENTER);
        text(this.name, this.x, this.y);
        pop();
    }
}

class Transition {
    constructor(from, to, read) {
        this.from = from;
        this.to = to;
        this.read = [read];

        // Extends or use Implement
        return this;
    }

    isValid() {
        return this.from && this.to && this.read;
    }

    parseNode(node) {
        let fromName = node.querySelector("from").textContent;
        let toName = node.querySelector("to").textContent;

        this.from = states.find(state => state.id == fromName);
        this.to = states.find(state => state.id == toName);
        this.read = [node.querySelector("read").textContent];

        this.mid;

        return this;
    }

    get isSelfLoop() {
        return this.from === this.to;
    }

    drawArrow(angle) {

    }

    draw() {
        let midpoint = createVector((this.from.x + this.to.x) / 2, (this.from.y + this.to.y) / 2);

        let dx = this.to.x - this.from.x;
        let dy = this.to.y - this.from.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        // Unit vector along the line
        let ux = dx / dist;
        let uy = dy / dist;

        // Line start and end points at the circle edges
        let start = createVector(this.from.x + ux * this.from.radius, this.from.y + uy * this.from.radius);
        let end = createVector(this.to.x - ux * this.to.radius, this.to.y - uy * this.to.radius);
        let angle = Math.atan2(end.y - start.y, end.x - start.x);

        if (this.isSelfLoop) {
            let startAngle = -PI / 2 - PI / 6; // 210°
            let endAngle = -PI / 2 + PI / 6; // -30°

            // Points on the circle’s edge
            start.x = this.from.x + this.from.radius * cos(startAngle);
            start.y = this.from.y + this.from.radius * sin(startAngle);

            end.x = this.from.x + this.from.radius * cos(endAngle);
            end.y = this.from.y + this.from.radius * sin(endAngle);

            midpoint.y -= this.from.radius * 2;
            angle = Math.atan2(end.y - midpoint.y, end.x - midpoint.x);
        }

        this.mid = midpoint;

        push();

        angleMode(RADIANS);
        textAlign(CENTER, CENTER);

        // Draw text
        push();

        let read = Array.from(this.read);

        for (let i = 0; i < read.length; i++) {
            if (read[i].length === 0) {
                read[i] = "\u03B5";
            }
        }

        if (!this.isSelfLoop) {
            translate(midpoint.x, midpoint.y);
            rotate(angle);
            text(read, 0, -12);
        } else {
            translate(midpoint.x, midpoint.y);
            text(read, 0, -6);
        }

        pop();

        // Line to connect states

        push();
        noFill();
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
}

function draw() {
    background(240);

    for (let i = 0; i < states.length; ++i) {
        states[i].draw();
    }

    for (let i = 0; i < transitions.length; ++i) {
        transitions[i].draw();
    }

    if (currentMode == "transition_creator" && activeElement && mouseDragged) {
        line(initialPos.x, initialPos.y, mouseX, mouseY);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    if (mouseX < 0 || mouseY < 0) return;

    initialPos = createVector(mouseX, mouseY);

    if (currentMode == "attribute_editor") {
        for (let i = states.length - 1; i >= 0; i--) {
            if (states[i].isInside(mouseX, mouseY)) {
                activeElement = states[i];
                activeElement.dragged = true;
            }
        }
    }

    if (currentMode == "state_creator") {
        activeElement = new State();
        states.push(activeElement);
    }

    if (currentMode == "deleter") {
        for (let i = states.length - 1; i >= 0; i--) {
            if (states[i].isInside(mouseX, mouseY)) {
                transitions = transitions.filter(
                    transition => transition.from !== states[i] && transition.to !== states[i]
                );
                states.splice(i, 1);
            }
        }
    }

    if (currentMode == "transition_creator") {
        for (let i = states.length - 1; i >= 0; i--) {
            if (states[i].isInside(mouseX, mouseY)) {
                activeElement = states[i];
            }
        }
    }
}

function mouseDragged() {
    if (mouseX < 0 || mouseY < 0) return;

    if (currentMode == "attribute_editor" || currentMode == "state_creator") {
        if (!activeElement) return;

        if (activeElement) {
            activeElement.x = mouseX;
            activeElement.y = mouseY;
        }
    }

    if (currentMode == "transition_creator") {

    }
}

function mouseReleased() {
    if (mouseX < 0 || mouseY < 0) return;

    if (currentMode == "attribute_editor") {
        if (!activeElement) return;

        activeElement.dragged = false;
        activeElement = undefined;
    }

    if (currentMode == "transition_creator") {
        if (!activeElement) return;

        console.log("Transition");

        let from = activeElement;
        let to;

        for (let i = states.length - 1; i >= 0; i--) {
            if (states[i].isInside(mouseX, mouseY)) {
                to = states[i];
            }
        }

        if (from && to) {
            let label = prompt("Enter the transition label");

            let transition = new Transition(from, to, label);

            addTransition(transition);
        }

        activeElement = undefined;
    }
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

let supportedTypes = ["fa"];

async function saveFile() {
    if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
            types: [{
                description: 'JFlap',
                accept: { 'application/xml': ['.jff'] },
            }],
        });
    }

    const writable = await fileHandle.createWritable();
    await writable.write(getXML());
    await writable.close();
    console.log("File saved!");
}

async function openFile() {
    [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();

    console.log(contents)

    const parser = new DOMParser();
    const doc = parser.parseFromString(contents, "application/xml");

    const parserError = doc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        alert(`An error occured while reading your jff file.`);
        console.error("Error parsing XML:", parserError[0].textContent);
        return; // fallback
    }

    let rootNode = doc.documentElement.nodeName;
    let type = doc.querySelector("type").textContent;

    transitions = [];
    states = [];
    activeElement = undefined;

    if (!supportedTypes.includes(type)) {
        alert(`"${type}" is not a supported jff type.`);
        return;
    }

    let nodeStates = doc.querySelectorAll("state");
    let nodeTransitions = doc.querySelectorAll("transition");

    nodeStates.forEach(state => {
        states.push(new State().parseNode(state));
    });

    nodeTransitions.forEach(transition => {
        let newTransition = new Transition().parseNode(transition);

        addTransition(newTransition);
    });
}

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
        { "label": "Fast Run...", "shortcut": ["ctrl", "S"], "action": () => console.log("Save") },
        { "label": "Multiple Run...", "shortcut": ["shift", "ctrl", "S"], "action": () => console.log("Save As") },
    ]
}]);