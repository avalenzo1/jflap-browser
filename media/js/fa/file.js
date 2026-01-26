const SUPPORTED_TYPES = ["fa"]; // Not all types are supported yet
let fileHandle;

/**
 * Saves file 
 */
async function saveFile() {
    if (!!fileHandle) {
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
}

/**
 * Opens JFLAP File
 */
async function openFile() {
    [fileHandle] = await window.showOpenFilePicker({
        types: [{
            description: 'JFlap',
            accept: { 'application/xml': ['.jff'] },
        }],
    });

    const file = await fileHandle.getFile();
    const xmlString = await file.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(prettifyXML(xmlString), "application/xml");

    window.automaton = loadFile(xmlDoc);
}

/**
 * Loads JFLAP File
 */
function loadFile(xmlDoc) {
    let rootNode = xmlDoc.documentElement.nodeName;
    let type = xmlDoc.querySelector("type").textContent;

    // Returns parse error
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        alert(`An error occured while reading your jff file.`);
        console.error("Error parsing XML:", parserError[0].textContent);
        return; // fallback
    }

    if (!SUPPORTED_TYPES.includes(type)) {
        alert(`"${type}" is not a supported jff type.`);
        return;
    }

    let nodeStates = xmlDoc.querySelectorAll("state");
    let nodeTransitions = xmlDoc.querySelectorAll("transition");
    let automaton = new FiniteAutomaton();

    /**
     * Sets up Finite Automaton
     */
    if (type == "fa") {
        // Add states to automaton
        for (nodeState of nodeStates) {
            let id = nodeState.getAttribute("id");
            let name = nodeState.getAttribute("name");
            let x = Number(nodeState.querySelector("x").textContent);
            let y = Number(nodeState.querySelector("y").textContent);

            console.log(automaton.addState(x, y, id, name));
        }

        // Add transition to automaton
        for (nodeTransition of nodeTransitions) {
            let from = nodeTransition.querySelector("from").textContent;
            let to = nodeTransition.querySelector("to").textContent;

            automaton.addTransition(from, to);
        }
    }

    return automaton;
}

/**
 * Formats XML to become parsable
 * 
 * @param {string} xmlString 
 * @returns {string}
 */
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

/**
 * Returns current machine as XML string
 * @returns {string}
 * TODO: Refactor this code
 */
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
