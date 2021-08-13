"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeCoverageProcessor = void 0;
const brs = require("brs");
const Debug = require("debug");
const path = require("path");
const CodeCoverageType_1 = require("./CodeCoverageType");
const File_1 = require("./File");
const debug = Debug('CodeCoverageProcessor');
class CodeCoverageProcessor {
    constructor(config) {
        this._config = config;
        this._fileId = 0;
        let fs = require('fs');
        this._filePathMap = new Map();
        this._expectedCoverageMap = {};
        try {
            this._coverageBrsTemplate = fs.readFileSync(path.join(__dirname, './CodeCoverageTemplate.brs'), 'utf8');
            this._coverageComponentBrsTemplate = fs.readFileSync(path.join(__dirname, './CodeCoverage.brs'), 'utf8');
            this._coverageComponentXmlTemplate = fs.readFileSync(path.join(__dirname, './CodeCoverage.xml'), 'utf8');
            this._coverageSupportTemplate = fs.readFileSync(path.join(__dirname, './CodeCoverageSupport.brs'), 'utf8');
        }
        catch (e) {
            console.log('Error:', e.stack);
        }
    }
    get config() {
        return this._config;
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            debug(`Running processor at path ${this.config.projectPath} `);
            const glob = require('glob-all');
            let processedFiles = [];
            let targetPath = path.resolve(this._config.projectPath);
            debug(`processing files at path ${targetPath} with pattern ${this._config.sourceFilePattern}`);
            let files = glob.sync(this._config.sourceFilePattern, { cwd: targetPath });
            for (const filePath of files) {
                const extension = path.extname(filePath).toLowerCase();
                if (extension === '.brs') {
                    const projectPath = path.dirname(filePath);
                    const fullPath = path.join(targetPath, projectPath);
                    const filename = path.basename(filePath);
                    const file = new File_1.default(fullPath, projectPath, filename, path.extname(filename));
                    let lexResult = brs.lexer.Lexer.scan(file.getFileContents());
                    let parser = new brs.parser.Parser();
                    let parseResult = parser.parse(lexResult.tokens);
                    file.ast = parseResult.statements;
                    this.processFile(file);
                    processedFiles.push(file);
                }
            }
            this.createCoverageComponent();
            this.createCoverageSupport();
            debug(`finished processing code coverage`);
        });
    }
    processFile(file) {
        this._fileId++;
        let fileContents = '';
        let lines = file.getFileContents().split(/\r?\n/);
        let coverageMap = new Map();
        this.visitableLines = new Map();
        this.getVisitableLinesForStatements(file.ast);
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            let line = lines[lineNumber];
            let statement = this.visitableLines.get(lineNumber);
            let coverageType = CodeCoverageType_1.CodeCoverageLineType.noCode;
            if (statement) {
                if (statement instanceof brs.parser.Stmt.If) {
                    let conditionStartPos = statement.condition.location.start.column;
                    let conditionEndPos = statement.condition.location.end.column;
                    let funcCall = this.getFuncCallText(lineNumber, CodeCoverageType_1.CodeCoverageLineType.condition);
                    let conditionText = line.substr(conditionStartPos, conditionEndPos - conditionStartPos);
                    let restofLineText = line.substring(conditionEndPos);
                    line = `${line.substr(0, conditionStartPos)} ${funcCall} and (${conditionText}) ${restofLineText}`;
                    coverageType = CodeCoverageType_1.CodeCoverageLineType.condition;
                }
                else if (statement instanceof ElseIfStatement) {
                    let conditionStartPos = statement.condition.location.start.column;
                    let conditionEndPos = statement.condition.location.end.column;
                    let funcCall = this.getFuncCallText(lineNumber, CodeCoverageType_1.CodeCoverageLineType.condition);
                    let conditionText = line.substr(conditionStartPos, conditionEndPos - conditionStartPos);
                    let restofLineText = line.substring(conditionEndPos);
                    line = `${line.substr(0, conditionStartPos)} ${funcCall} and (${conditionText}) ${restofLineText}`;
                    coverageType = CodeCoverageType_1.CodeCoverageLineType.condition;
                }
                else {
                    //all types that can be prefixed with the funcall and a colon (i.e for, while, return foreach, assign)
                    let funcCall = this.getFuncCallText(lineNumber, CodeCoverageType_1.CodeCoverageLineType.code);
                    line = `${funcCall}: ${line}`;
                    coverageType = CodeCoverageType_1.CodeCoverageLineType.code;
                }
            }
            else {
                debug(`could not ascertain symbol type for line "${line} - ignoring`);
            }
            if (!line.endsWith('\n')) {
                line += '\n';
            }
            fileContents += line;
            if (coverageType > CodeCoverageType_1.CodeCoverageLineType.noCode) {
                coverageMap.set(lineNumber, coverageType);
            }
        }
        this._expectedCoverageMap[this._fileId.toString().trim()] = Array.from(coverageMap);
        this._filePathMap[this._fileId] = file.pkgUri;
        fileContents += this.getBrsAPIText();
        file.setFileContents(fileContents);
        debug(`Writing to ${file.fullPath}`);
        file.saveFileContents();
    }
    getBrsAPIText() {
        let template = this._coverageBrsTemplate.replace(/\#ID\#/g, this._fileId.toString().trim());
        return template;
    }
    createCoverageComponent() {
        let targetPath = path.resolve(this._config.projectPath);
        let file = new File_1.default(path.resolve(path.join(targetPath), 'components'), 'components', 'CodeCoverage.xml', '.xml');
        file.setFileContents(this._coverageComponentXmlTemplate);
        debug(`Writing to ${file.fullPath}`);
        file.saveFileContents();
        file = new File_1.default(path.resolve(path.join(targetPath, 'components')), 'components', 'CodeCoverage.brs', '.brs');
        let template = this._coverageComponentBrsTemplate;
        template = template.replace(/\#EXPECTED_MAP\#/g, JSON.stringify(this._expectedCoverageMap));
        template = template.replace(/\#FILE_PATH_MAP\#/g, JSON.stringify(this._filePathMap));
        file.setFileContents(template);
        debug(`Writing to ${file.fullPath}`);
        file.saveFileContents();
    }
    createCoverageSupport() {
        let targetPath = path.resolve(this._config.projectPath);
        let file = new File_1.default(path.resolve(path.join(targetPath), 'source'), 'source', 'CodeCoverageSupport.brs', '.brs');
        file.setFileContents(this._coverageSupportTemplate);
        debug(`Writing to ${file.fullPath}`);
        file.saveFileContents();
    }
    getFuncCallText(lineNumber, lineType) {
        return `RBS_CC_${this._fileId}_reportLine(${lineNumber.toString().trim()}, ${lineType.toString().trim()})`;
    }
    getVisitableLinesForStatements(statements) {
        for (let statement of statements) {
            if (statement instanceof brs.parser.Stmt.Function) {
                this.getVisitableLinesForStatements(statement.func.body.statements);
            }
            else if (statement instanceof brs.parser.Stmt.Assignment
                || statement instanceof brs.parser.Stmt.DottedSet
                || statement instanceof brs.parser.Stmt.IndexedSet) {
                this.addStatement(statement);
                this.getVisitableLinesForExpression([statement.value]);
            }
            else if (statement instanceof brs.parser.Stmt.If) {
                this.addStatement(statement);
                if (statement.thenBranch) {
                    this.getVisitableLinesForStatements(statement.thenBranch.statements);
                }
                if (statement.elseIfs) {
                    for (let i = 0; i < statement.elseIfs.length; i++) {
                        let elseIfStatement = statement.elseIfs[i];
                        this.getVisitableLinesForStatements(elseIfStatement.thenBranch.statements);
                        if (statement.tokens.elseIfs[i]) {
                            let elseIfLine = statement.tokens.elseIfs[i].location.start.line - 1;
                            this.addStatement(new ElseIfStatement(elseIfStatement.condition), elseIfLine);
                        }
                    }
                }
                if (statement.elseBranch) {
                    this.getVisitableLinesForStatements(statement.elseBranch.statements);
                }
            }
            else if (statement instanceof brs.parser.Stmt.For
                || statement instanceof brs.parser.Stmt.ForEach
                || statement instanceof brs.parser.Stmt.While) {
                this.addStatement(statement);
                this.getVisitableLinesForStatements(statement.body.statements);
            }
            else if (statement instanceof brs.parser.Stmt.Expression) {
                this.addStatement(statement);
                this.getVisitableLinesForExpression([statement.expression]);
            }
            else if (statement instanceof brs.parser.Stmt.Assignment
                || statement instanceof brs.parser.Stmt.Print
                || statement instanceof brs.parser.Stmt.Return) {
                this.addStatement(statement);
            }
            else {
                debug(`unknown statement type`);
            }
        }
    }
    addStatement(statement, lineNumber) {
        if (!lineNumber) {
            if (!(statement instanceof ElseIfStatement)) {
                lineNumber = statement.location.start.line - 1;
            }
            else {
                console.log('addStatement called with otherStatement, without a line number! - OtherStatements types must provide a line number');
            }
        }
        if (!this.visitableLines.has(lineNumber)) {
            this.visitableLines.set(lineNumber, statement);
        }
        else {
            debug(`line was already registered`);
        }
    }
    getVisitableLinesForExpression(expressions) {
        for (let expression of expressions) {
            if (expression instanceof brs.parser.Expr.AALiteral) {
                this.getVisitableLinesForExpression(expression.elements.map((e) => e.value));
            }
            else if (expression instanceof brs.parser.Expr.ArrayLiteral) {
                this.getVisitableLinesForExpression(expression.elements);
            }
            else if (expression instanceof brs.parser.Expr.Call) {
                this.getVisitableLinesForExpression(expression.args);
            }
            else if (expression instanceof brs.parser.Expr.Binary) {
                this.getVisitableLinesForExpression([expression.left]);
                this.getVisitableLinesForExpression([expression.right]);
            }
            else if (expression instanceof brs.parser.Expr.Function) {
                this.getVisitableLinesForStatements(expression.body.statements);
            }
            else if (expression instanceof brs.parser.Expr.Literal
                || expression instanceof brs.parser.Expr.Variable
                || expression instanceof brs.parser.Expr.DottedGet) {
                debug('known non-visitable expression: ' + expression.constructor.name);
            }
            else {
                debug(`unknown expression`);
            }
        }
    }
}
exports.CodeCoverageProcessor = CodeCoverageProcessor;
class ElseIfStatement {
    constructor(condition) {
        this.condition = condition;
    }
}
