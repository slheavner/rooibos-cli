"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackInfos = exports.getFeedbackWarnings = exports.getFeedbackErrors = exports.feedbackError = exports.feedbackWarning = exports.feedbackInfo = exports.resetFeedback = exports.feedbackMessage = void 0;
const FileFeedback_1 = require("./FileFeedback");
const _feedback = [];
function feedbackMessage(type, file, message, isThrown = false, lineNumber) {
    let error = new FileFeedback_1.FileFeedback(file, type, message, lineNumber);
    _feedback.push(error);
    if (isThrown) {
        error.throw();
    }
}
exports.feedbackMessage = feedbackMessage;
function resetFeedback() {
    _feedback.splice(0, _feedback.length);
}
exports.resetFeedback = resetFeedback;
function feedbackInfo(file, message, isThrown = false, lineNumber) {
    feedbackMessage(FileFeedback_1.FileFeedbackType.Info, file, message, isThrown, lineNumber);
}
exports.feedbackInfo = feedbackInfo;
function feedbackWarning(file, message, isThrown = false, lineNumber) {
    feedbackMessage(FileFeedback_1.FileFeedbackType.Warning, file, message, isThrown, lineNumber);
}
exports.feedbackWarning = feedbackWarning;
function feedbackError(file, message, isThrown = false, lineNumber) {
    feedbackMessage(FileFeedback_1.FileFeedbackType.Error, file, message, isThrown, lineNumber);
}
exports.feedbackError = feedbackError;
function getFeedbackErrors() {
    return _feedback.filter((feedback) => feedback.feedbackType === FileFeedback_1.FileFeedbackType.Error);
}
exports.getFeedbackErrors = getFeedbackErrors;
function getFeedbackWarnings() {
    return _feedback.filter((feedback) => feedback.feedbackType === FileFeedback_1.FileFeedbackType.Warning);
}
exports.getFeedbackWarnings = getFeedbackWarnings;
function getFeedbackInfos() {
    return _feedback.filter((feedback) => feedback.feedbackType === FileFeedback_1.FileFeedbackType.Info);
}
exports.getFeedbackInfos = getFeedbackInfos;
