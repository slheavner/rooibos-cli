function RBS_ReportCodeCoverage()
  ? ""
  ? "...Generating code coverage report"
  ? ""
  m.global._rbs_ccn.save = true
  cc = m.global._rbs_ccn
  hitFiles = []
  missFiles = []
  allLinesCount = 0
  allLinesHit = 0
  for each key in cc.expectedMap
    filename = cc.filePathMap[key]
    expectedCount = cc.expectedMap[key].count()
    allLinesCount += expectedCount
    if expectedCount > 0
      if cc.resolvedMap[key] <> invalid
        resolvedCount = cc.resolvedMap[key].count()
        allLinesHit += resolvedCount
        resolvedPercent = (resolvedCount / expectedCount) * 100
        hitFiles.push({percent:resolvedPercent, text:filename + ": " +str(resolvedPercent).trim() + "% (" + stri(resolvedCount).trim() + "/" + stri(expectedCount).trim() + ")"})
      else
        resolvedCount = 0
        resolvedPercent = 0
        missFiles.push(filename + ": MISS!")
      end if
    end if
  end for
  allLinesPercent = (allLinesHit / allLinesCount) * 100
  ? ""
  ? ""
  ? "+++++++++++++++++++++++++++++++++++++++++++"
  ? "Code Coverage Report (alpha - crude output)"
  ? "+++++++++++++++++++++++++++++++++++++++++++"
  ? ""
  ? "Total Coverage: " ; str(allLinesPercent).trim() ; "% (" ; stri(allLinesHit).trim() ; "/" + stri(allLinesCount).trim() ; ")"
  ? "Files: " ; cc.resolvedMap.count(); "/" ; cc.expectedMap.count()
  ? "HIT FILES"
  hitFiles.SortBy("percent")
  for i = 0 to hitFiles.count() -1
    ? hitFiles[i].text
  end for

  ? "MISSED FILES"
  for i = 0 to missFiles.count() -1
    ? missFiles[i]
  end for

end function