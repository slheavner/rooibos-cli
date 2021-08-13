"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = exports.addSetItems = exports.getRegexMatchValue = exports.getRegexMatchesValues = exports.spliceString = void 0;
function spliceString(str, index, count, add) {
    // We cannot pass negative indexes directly to the 2nd slicing operation.
    if (index < 0) {
        index = str.length + index;
        if (index < 0) {
            index = 0;
        }
    }
    return str.slice(0, index) + (add || '') + str.slice(index + count);
}
exports.spliceString = spliceString;
function getRegexMatchesValues(input, regex, groupIndex) {
    let values = [];
    let matches;
    while (matches = regex.exec(input)) {
        values.push(matches[groupIndex]);
    }
    return values;
}
exports.getRegexMatchesValues = getRegexMatchesValues;
function getRegexMatchValue(input, regex, groupIndex) {
    let matches;
    while (matches = regex.exec(input)) {
        if (matches.length > groupIndex) {
            return matches[groupIndex];
        }
    }
    return null;
}
exports.getRegexMatchValue = getRegexMatchValue;
function addSetItems(setA, setB) {
    for (const elem of setB) {
        setA.add(elem);
    }
}
exports.addSetItems = addSetItems;
function pad(pad, str, padLeft) {
    if (typeof str === 'undefined') {
        return pad;
    }
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    }
    else {
        return (str + pad).substring(0, pad.length);
    }
}
exports.pad = pad;
