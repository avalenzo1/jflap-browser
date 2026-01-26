const Mode = Object.freeze({
    NONE: "NONE",
    ATTRIBUTE_EDITOR: "ATTRIBUTE_EDITOR",       // Meant for changing attributes of a state
    STATE_CREATOR: "STATE_CREATOR",             // Creates new states
    TRANSITION_CREATOR: "TRANSITION_CREATOR",   // Creates transitions
    DELETER: "DELETER",                         // Deletes states and transitions
});

class State {
    constructor(x, y, id, name) {
        this.id = id;
        this.name = name;

        this.x = x;
        this.y = y;

        this.isInitial = false;
        this.isFinal = false;

        this.hovered = false;
        this.dragged = false;
    }
}

class Transition {
    constructor(from, to, read) {
        this.from = from;
        this.to = to;
        this.read = read;
    }
}

const properties = {
    state: {
        radius: 20,
        backgroundColor: "yellow",
        hover: {
            backgroundColor: "skyblue"
        },
        active: {
            backgroundColor: "orange"
        }
    }
}