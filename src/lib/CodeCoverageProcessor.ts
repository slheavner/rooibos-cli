import * as brs from 'brs';
import * as Debug from 'debug';

import * as path from 'path';

import { CodeCoverageLineType } from './CodeCoverageType';
import File from './File';
import { ProcessorConfig } from './ProcessorConfig';

const debug = Debug('CodeCoverageProcessor');

export class CodeCoverageProcessor {

  constructor(config: ProcessorConfig) {
    this._config = config;
    this._fileId = 0;
    let fs = require('fs');

    try {
      this._coverageBrsTemplate = fs.readFileSync(path.join(__dirname, './CodeCoverageTemplate.brs'), 'utf8');
    } catch (e) {
      console.log('Error:', e.stack);
    }
  }

  private _config: ProcessorConfig;
  private _fileId: number;
  private _coverageBrsTemplate: string;

  get config(): ProcessorConfig {
    return this._config;
  }

  public async process() {
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

        const file = new File(fullPath, projectPath, filename, path.extname(filename));
        let lexResult = brs.lexer.Lexer.scan(file.getFileContents());
        let parser = new brs.parser.Parser();
        let parseResult = parser.parse(lexResult.tokens);
        file.ast = parseResult.statements;
        this.processFile(file);

        processedFiles.push(file);
      }
    }
    debug(`finished processing code coverage`);
  }

  public processFile(file: File) {
    this._fileId++;
    let fileContents = '';
    let lines = file.getFileContents().split(/\r?\n/);
    let coverageMap: CodeCoverageLineType[] = [];
    let visitableLines = new Map<number, brs.parser.Stmt.Statement | OtherStatement>();
    this.getVisitibleLinesFor(file.ast, visitableLines);
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      let line = lines[lineNumber];
      let statement = visitableLines.get(lineNumber);
      let coverageType = CodeCoverageLineType.noCode;
      if (statement) {
        if (statement instanceof brs.parser.Stmt.If) {
          //1. work out where we can insert this on the if statement
          let match = /(^\s*if\s*)((?!then).)*/i.exec(line);
          if (match) {
            if (match.length > 2) {
              let funcCall = this.getFuncCallText(lineNumber, CodeCoverageLineType.condition);
              line = `${match[1]} ${funcCall} and (${match[0].substring(match[1].length)})`;
            }
          }
        } else if (statement instanceof OtherStatement) {
          //is it an else if?
          let match = /(^\s*else if\s*)((?!then).)*/i.exec(line);
          if (match) {
            if (match.length > 2) {
              let funcCall = this.getFuncCallText(lineNumber, CodeCoverageLineType.condition);
              line = `${match[1]} ${funcCall} and (${match[0].substring(match[1].length)})`;
            }
          }
        } else {
          //all types that can be prefixed with the funcall and a colon (i.e for, while, return foreach, assign)
          let funcCall = this.getFuncCallText(lineNumber, CodeCoverageLineType.code);
          line = `${funcCall}: ${line}`;
        }
      } else {
        debug(`could not ascertain symbol type for line "${line} - ignoring`);
      }

      if (!line.endsWith('\n')) {
        line += '\n';
      }
      fileContents += line;
      coverageMap.push(coverageType);
    }

    // iterate over file

    //for each line in file iterate
    fileContents += this.getBrsAPIText(file, coverageMap);
    file.setFileContents(fileContents);
    debug(`Writing to ${file.fullPath}`);
    //file.saveFileContents();
  }

  public getBrsAPIText(file: File, coverageMap: CodeCoverageLineType[]): string {
    let lineMapText = this.getLineMapText(coverageMap);
    let template = this._coverageBrsTemplate.replace(/\#ID\#/g, this._fileId.toString().trim());
    template = template.replace(/\#LINE_MAP\#/g, lineMapText);
    template = template.replace(/\#FILE_PATH\#/g, file.fullPath);
    return template;
  }

  public getLineMapText(lineMap: CodeCoverageLineType[]): string {
    let text = '[';
    const limit = 200;
    for (let i = 0; i < lineMap.length; i++) {
      text += lineMap[i].toString().trim() + ',';
      if (i > 0 && i % limit === 0) {
        text += '\n';
      }
    }
    text += ']';
    return text;
  }

  private getFuncCallText(lineNumber: number, lineType: CodeCoverageLineType) {
    return `RBS_CC_${this._fileId}_reportLine(${lineNumber.toString().trim()}, ${lineType.toString().trim()})`;
  }

  private getVisitibleLinesFor(statements: ReadonlyArray<brs.parser.Stmt.Statement>, visitableLines: Map<number, brs.parser.Stmt.Statement | OtherStatement>) {
    for (let statement of statements) {
      if (statement instanceof brs.parser.Stmt.Function) {
        this.getVisitibleLinesFor(statement.func.body.statements, visitableLines);
      } else if (statement instanceof brs.parser.Stmt.If) {
        if (!visitableLines.has(statement.location.start.line - 1)) {
          visitableLines.set(statement.location.start.line - 1, statement);
        }
        if (statement.thenBranch) {
          this.getVisitibleLinesFor(statement.thenBranch.statements, visitableLines);
        }
        if (statement.elseIfs) {
          for (let i = 0; i < statement.elseIfs.length; i++) {
            let elseIfStatement = statement.elseIfs[i];
            this.getVisitibleLinesFor(elseIfStatement.thenBranch.statements, visitableLines);
            let elseIfLine = statement.tokens.elseIfs[i].location.start.line - 1;
            if (!visitableLines.has(elseIfLine)) {
              visitableLines.set(elseIfLine, new OtherStatement(elseIfStatement));
            }
          }
        }
        if (statement.elseBranch) {
          this.getVisitibleLinesFor(statement.elseBranch.statements, visitableLines);
        }
      } else if (statement instanceof brs.parser.Stmt.For
        || statement instanceof brs.parser.Stmt.ForEach
        || statement instanceof brs.parser.Stmt.While) {

        if (!visitableLines.has(statement.location.start.line - 1)) {
          visitableLines.set(statement.location.start.line - 1, statement);
        }
        this.getVisitibleLinesFor(statement.body.statements, visitableLines);
      } else if (statement instanceof brs.parser.Stmt.Expression
        || statement instanceof brs.parser.Stmt.Assignment
        || statement instanceof brs.parser.Stmt.DottedSet
        || statement instanceof brs.parser.Stmt.IndexedSet
        || statement instanceof brs.parser.Stmt.Print
        || statement instanceof brs.parser.Stmt.Return
      ) {
        if (!visitableLines.has(statement.location.start.line - 1)) {
          visitableLines.set(statement.location.start.line - 1, statement);
        }
      }
    }
  }
}

class OtherStatement {
  constructor(public statement: any) {

  }
}
