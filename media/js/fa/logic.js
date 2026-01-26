class AutomatonEvent {
    constructor() {
        this.eventType;
        this.target;
    }
}

/**
 * Manager for Automaton
 */
class Automaton {
    constructor() {
        this.states = new Map();
        this.transitions = new Map();
        this._mode = Mode.NONE;

        this.activeElement = undefined;

        // History
        let prev = [];
        let next = [];
    }

    /**
     * Finds and returns initial state in states
     * @returns {State} initial state
     */
    findInitialState() {
        for (let i = this.states.length - 1; i >= 0; i--) {
            if (this.states[i].isInitial) {
                return this.states[i];
            }
        }

        return null;
    }

    /**
     * Finds and returns state with id
     * @param {string} id 
     * @returns {State}
     */
    findStateById(id) {
        return this.states.get(id);
    }

    /**
     * Finds and returns state with exact pos
     * @param {Number} x 
     * @param {Number} y 
     * @returns {State}
     */
    findStateByPos(x, y) {
        for (let [id, state] of this.states) {
            if (isInsideState(x, y, state.x, state.y)) {
                return state;
            }
        }

        return null;
    }

    /**
     * Gets current mode
     * Valid Modes: [Mode.NONE, Mode.ATTRIBUTE_EDITOR, Mode.STATE_CREATOR, Mode.TRANSITION_CREATER, Mode.DELETER]
     * @returns {Mode.*} mode
     */
    get mode() {
        return this._mode;
    }

    /**
     * Sets current mode
     * Valid Modes: [Mode.NONE, Mode.ATTRIBUTE_EDITOR, Mode.STATE_CREATOR, Mode.TRANSITION_CREATER, Mode.DELETER]
     * @param {Mode.*} mode
     */
    set mode(m) {
        if (!Mode.hasOwnProperty(m)) {
            console.warn(`Could not set mode to ${m}. Invalid mode.`)
            return;
        }

        // Change mode
        this._mode = m;
    }
}

class FiniteAutomaton extends Automaton {
    constructor() {
        super();
    }

    /**
     * Creates new state with default id and name
     * ! The time complexity for this function is O(N) which is not the most efficient
     * TODO: find a better way of adding states s.t time complexity is O(1)
     * @param {Number} x 
     * @param {Number} y 
     * @param {string} id
     * @param {string} name
     * @returns {State}
     */
    addState(x, y, id, name) {
        if (id && name) {
            if (this.findStateById(id)) {
                console.warn("Could not add state. Id already exists");
                console.log(state);
                return;
            }

            console.log(x, y, id, name);
            console.log("test")

            const newState = new State(x, y, id, name);

            this.states.set(id, newState);

            return newState;
        }

        // Finds lowest possible id
        let idCandidate = 0;

        while (this.states.has(String(idCandidate))) {
            idCandidate++;
        }

        const finalId = String(idCandidate);
        const newState = new State(x, y, finalId, `q${finalId}`);

        this.states.set(finalId, newState);

        return newState;
    }

    /**
     * Removes an existing state by id
     * @param {string} id
     */
    removeState(id) {
        this.states.delete(id);
    }

    /**
     * Removes an existing state by id
     * @param {State} state
     */
    removeState(state) {
        if (!(state instanceof State)) {
            console.log(state);
            console.warn("Could not delete state. State does not exist.");
        }

        this.states.delete(state.id);
    }

    /**
     * Creates a new transition
     */
    addTransition(fromId, toId, read) {
        let from = this.findStateById(fromId);
        let to = this.findStateById(toId);

        if (!from || !to) {
            console.warn(`Could not add transiton ${fromId}, ${toId}, ${read}. from or to id does not exist.`);
            console.log(from, to);
        }

        if (!this.transitions.has(fromId)) {
            this.transitions.set(fromId, new Set());
        }

        this.transitions.get(fromId).add(new Transition(from, to, read));
    }

    /**
     * Removes an existing transition
     */
    removeTransition(fromId, toId, read) {

    }

}

function isInsideState(targetX, targetY, stateX, stateY) {
    const d = dist(targetX, targetY, stateX, stateY);

    return d <= properties.state.radius;
}

window.automaton = new FiniteAutomaton();