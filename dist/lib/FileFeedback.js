"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFeedback = exports.FileFeedbackType = void 0;
var FileFeedbackType;
(function (FileFeedbackType) {
    FileFeedbackType["Info"] = "Info";
    FileFeedbackType["Warning"] = "Warning";
    FileFeedbackType["Error"] = "Error";
})(FileFeedbackType = exports.FileFeedbackType || (exports.FileFeedbackType = {}));
class FileFeedback {
    constructor(file, feedbackType, message, line, character) {
        this.file = file;
        this.feedbackType = feedbackType;
        this.message = message;
        this.line = line;
        this.character = character;
    }
    toString() {
        let fileName = this.file ? this.file.fullPath : 'No file';
        let lineText = this.line ? this.line.toString() : '-';
        let charText = this.character ? this.character.toString() : '-';
        return `${this.feedbackType.toString()} - ${fileName}(${lineText}:${charText}) ${this.message}`;
    }
    throw() {
        throw new Error(this.toString());
    }
}
exports.FileFeedback = FileFeedback;
