"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexeme = void 0;
var Lexeme;
(function (Lexeme) {
    Lexeme[Lexeme["LeftParen"] = 0] = "LeftParen";
    Lexeme[Lexeme["RightParen"] = 1] = "RightParen";
    Lexeme[Lexeme["LeftSquare"] = 2] = "LeftSquare";
    Lexeme[Lexeme["RightSquare"] = 3] = "RightSquare";
    Lexeme[Lexeme["LeftBrace"] = 4] = "LeftBrace";
    Lexeme[Lexeme["RightBrace"] = 5] = "RightBrace";
    Lexeme[Lexeme["Caret"] = 6] = "Caret";
    Lexeme[Lexeme["Minus"] = 7] = "Minus";
    Lexeme[Lexeme["Plus"] = 8] = "Plus";
    Lexeme[Lexeme["Star"] = 9] = "Star";
    Lexeme[Lexeme["Slash"] = 10] = "Slash";
    Lexeme[Lexeme["Mod"] = 11] = "Mod";
    Lexeme[Lexeme["Backslash"] = 12] = "Backslash";
    Lexeme[Lexeme["PlusPlus"] = 13] = "PlusPlus";
    Lexeme[Lexeme["MinusMinus"] = 14] = "MinusMinus";
    Lexeme[Lexeme["LeftShift"] = 15] = "LeftShift";
    Lexeme[Lexeme["RightShift"] = 16] = "RightShift";
    Lexeme[Lexeme["MinusEqual"] = 17] = "MinusEqual";
    Lexeme[Lexeme["PlusEqual"] = 18] = "PlusEqual";
    Lexeme[Lexeme["StarEqual"] = 19] = "StarEqual";
    Lexeme[Lexeme["SlashEqual"] = 20] = "SlashEqual";
    Lexeme[Lexeme["BackslashEqual"] = 21] = "BackslashEqual";
    Lexeme[Lexeme["LeftShiftEqual"] = 22] = "LeftShiftEqual";
    Lexeme[Lexeme["RightShiftEqual"] = 23] = "RightShiftEqual";
    Lexeme[Lexeme["Less"] = 24] = "Less";
    Lexeme[Lexeme["LessEqual"] = 25] = "LessEqual";
    Lexeme[Lexeme["Greater"] = 26] = "Greater";
    Lexeme[Lexeme["GreaterEqual"] = 27] = "GreaterEqual";
    Lexeme[Lexeme["Equal"] = 28] = "Equal";
    Lexeme[Lexeme["LessGreater"] = 29] = "LessGreater";
    Lexeme[Lexeme["Identifier"] = 30] = "Identifier";
    Lexeme[Lexeme["String"] = 31] = "String";
    Lexeme[Lexeme["Integer"] = 32] = "Integer";
    Lexeme[Lexeme["Float"] = 33] = "Float";
    Lexeme[Lexeme["Double"] = 34] = "Double";
    Lexeme[Lexeme["LongInteger"] = 35] = "LongInteger";
    Lexeme[Lexeme["Dot"] = 36] = "Dot";
    Lexeme[Lexeme["Comma"] = 37] = "Comma";
    Lexeme[Lexeme["Colon"] = 38] = "Colon";
    Lexeme[Lexeme["Semicolon"] = 39] = "Semicolon";
    Lexeme[Lexeme["HashIf"] = 40] = "HashIf";
    Lexeme[Lexeme["HashElseIf"] = 41] = "HashElseIf";
    Lexeme[Lexeme["HashElse"] = 42] = "HashElse";
    Lexeme[Lexeme["HashEndIf"] = 43] = "HashEndIf";
    Lexeme[Lexeme["HashConst"] = 44] = "HashConst";
    Lexeme[Lexeme["HashError"] = 45] = "HashError";
    Lexeme[Lexeme["HashErrorMessage"] = 46] = "HashErrorMessage";
    Lexeme[Lexeme["And"] = 47] = "And";
    Lexeme[Lexeme["Box"] = 48] = "Box";
    Lexeme[Lexeme["CreateObject"] = 49] = "CreateObject";
    Lexeme[Lexeme["Dim"] = 50] = "Dim";
    Lexeme[Lexeme["Else"] = 51] = "Else";
    Lexeme[Lexeme["ElseIf"] = 52] = "ElseIf";
    Lexeme[Lexeme["End"] = 53] = "End";
    Lexeme[Lexeme["EndFunction"] = 54] = "EndFunction";
    Lexeme[Lexeme["EndFor"] = 55] = "EndFor";
    Lexeme[Lexeme["EndIf"] = 56] = "EndIf";
    Lexeme[Lexeme["EndSub"] = 57] = "EndSub";
    Lexeme[Lexeme["EndWhile"] = 58] = "EndWhile";
    Lexeme[Lexeme["Eval"] = 59] = "Eval";
    Lexeme[Lexeme["Exit"] = 60] = "Exit";
    Lexeme[Lexeme["ExitFor"] = 61] = "ExitFor";
    Lexeme[Lexeme["ExitWhile"] = 62] = "ExitWhile";
    Lexeme[Lexeme["False"] = 63] = "False";
    Lexeme[Lexeme["For"] = 64] = "For";
    Lexeme[Lexeme["ForEach"] = 65] = "ForEach";
    Lexeme[Lexeme["Function"] = 66] = "Function";
    Lexeme[Lexeme["GetGlobalAA"] = 67] = "GetGlobalAA";
    Lexeme[Lexeme["GetLastRunCompileError"] = 68] = "GetLastRunCompileError";
    Lexeme[Lexeme["GetLastRunRunTimeError"] = 69] = "GetLastRunRunTimeError";
    Lexeme[Lexeme["Goto"] = 70] = "Goto";
    Lexeme[Lexeme["If"] = 71] = "If";
    Lexeme[Lexeme["Invalid"] = 72] = "Invalid";
    Lexeme[Lexeme["Let"] = 73] = "Let";
    Lexeme[Lexeme["LineNum"] = 74] = "LineNum";
    Lexeme[Lexeme["Next"] = 75] = "Next";
    Lexeme[Lexeme["Not"] = 76] = "Not";
    Lexeme[Lexeme["ObjFun"] = 77] = "ObjFun";
    Lexeme[Lexeme["Or"] = 78] = "Or";
    Lexeme[Lexeme["Pos"] = 79] = "Pos";
    Lexeme[Lexeme["Print"] = 80] = "Print";
    Lexeme[Lexeme["Rem"] = 81] = "Rem";
    Lexeme[Lexeme["Return"] = 82] = "Return";
    Lexeme[Lexeme["Step"] = 83] = "Step";
    Lexeme[Lexeme["Sub"] = 84] = "Sub";
    Lexeme[Lexeme["Tab"] = 85] = "Tab";
    Lexeme[Lexeme["To"] = 86] = "To";
    Lexeme[Lexeme["True"] = 87] = "True";
    Lexeme[Lexeme["Type"] = 88] = "Type";
    Lexeme[Lexeme["While"] = 89] = "While";
    Lexeme[Lexeme["Newline"] = 90] = "Newline";
    Lexeme[Lexeme["Eof"] = 91] = "Eof";
})(Lexeme = exports.Lexeme || (exports.Lexeme = {}));
