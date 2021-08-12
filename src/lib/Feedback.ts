import File from "./File";
import { FileFeedback, FileFeedbackType } from "./FileFeedback";

const _feedback: FileFeedback[] = [];

export function feedbackMessage(
  type: FileFeedbackType,
  file: File | null,
  message: string,
  isThrown: boolean = false,
  lineNumber?: number
) {
  let error = new FileFeedback(file, type, message, lineNumber);
  _feedback.push(error);
  if (isThrown) {
    error.throw();
  }
}

export function resetFeedback() {
  _feedback.splice(0, _feedback.length);
}

export function feedbackInfo(
  file: File,
  message: string,
  isThrown: boolean = false,
  lineNumber?: number
) {
  feedbackMessage(FileFeedbackType.Info, file, message, isThrown, lineNumber);
}
export function feedbackWarning(
  file: File,
  message: string,
  isThrown: boolean = false,
  lineNumber?: number
) {
  feedbackMessage(
    FileFeedbackType.Warning,
    file,
    message,
    isThrown,
    lineNumber
  );
}
export function feedbackError(
  file: File,
  message: string,
  isThrown: boolean = false,
  lineNumber?: number
) {
  feedbackMessage(FileFeedbackType.Error, file, message, isThrown, lineNumber);
}

export function getFeedbackErrors(): FileFeedback[] {
  return _feedback.filter(
    (feedback) => feedback.feedbackType === FileFeedbackType.Error
  );
}

export function getFeedbackWarnings(): FileFeedback[] {
  return _feedback.filter(
    (feedback) => feedback.feedbackType === FileFeedbackType.Warning
  );
}

export function getFeedbackInfos(): FileFeedback[] {
  return _feedback.filter(
    (feedback) => feedback.feedbackType === FileFeedbackType.Info
  );
}
