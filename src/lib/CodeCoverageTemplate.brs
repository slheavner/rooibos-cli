

'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
'++ rooibos code coverage util functions DO NOT MODIFY
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function RBS_CC_#ID#_reportLine(lineNumber, reportType = 1)
  if m._rbs_ccExpectedMap = invalid
    ? "Coverage maps are not created - creating now"
    m._rbs_ccExpectedMap = {}
    m._rbs_ccResolvedMap = {}
    m._rbs_ccFilePathMap = {}
  end if

  lineMap = m._rbs_ccResolvedMap["file#ID#"]

  if lineMap = invalid
    ? "There was no line map found for file #FILE_PATH# with CC id #ID# - using default"
    lineMap = #LINE_MAP#
    filePathMap = m._rbs_ccFilePathMap
    filePathMap["file#ID#"] = "#FILE_PATH#"
    m._rbs_ccFilePathMap = filePathMap
  end if

  if lineNumber < lineMap.count()
    lineMap[lineNumber] = reportType
    fileMap = m._rbs_ccResolvedMap
    fileMap["file#ID#"] = lineMap
    m._rbs_ccResolvedMap = fileMap
  else
    ? "ERROR - code coverage line number " + stri(lineNumber) + " is out of the code coverages file map's bounds, for file #FILE_PATH# with CC id #ID# - has the file been modified since the code coverage test was generated?"
  end if

  return true
end function