param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $SourcePath))
try {
    function Read-XmlPart([string]$Name) {
        $entry = $archive.GetEntry($Name)
        if (-not $entry) { throw "Workbook part missing: $Name" }
        $reader = New-Object System.IO.StreamReader($entry.Open())
        try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    $workbook = Read-XmlPart 'xl/workbook.xml'
    $ns = New-Object System.Xml.XmlNamespaceManager($workbook.NameTable)
    $ns.AddNamespace('s', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    $relations = Read-XmlPart 'xl/_rels/workbook.xml.rels'
    $targets = @{}
    foreach ($relation in $relations.Relationships.Relationship) { $targets[$relation.Id] = $relation.Target }
    $strings = @()
    if ($archive.GetEntry('xl/sharedStrings.xml')) {
        $shared = Read-XmlPart 'xl/sharedStrings.xml'
        $strings = @($shared.SelectNodes('//s:si', $ns) | ForEach-Object {
            ($_.SelectNodes('.//s:t', $ns) | ForEach-Object { $_.InnerText }) -join ''
        })
    }
    $sheets = @()
    foreach ($sheet in $workbook.SelectNodes('//s:sheets/s:sheet', $ns)) {
        $relationId = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        $target = $targets[$relationId]
        $part = if ($target.StartsWith('/')) { $target.TrimStart('/') } else { "xl/$target" }
        $sheetXml = Read-XmlPart $part
        $rows = @()
        foreach ($row in $sheetXml.SelectNodes('//s:sheetData/s:row', $ns)) {
            $cells = [ordered]@{}
            foreach ($cell in $row.SelectNodes('./s:c', $ns)) {
                $value = $cell.SelectSingleNode('./s:v', $ns)
                $text = if ($cell.t -eq 's') { $strings[[int]$value.InnerText] }
                    elseif ($cell.t -eq 'inlineStr') { ($cell.SelectNodes('.//s:t', $ns) | ForEach-Object { $_.InnerText }) -join '' }
                    elseif ($value) { $value.InnerText } else { '' }
                $formula = $cell.SelectSingleNode('./s:f', $ns)
                $cells[$cell.r] = [ordered]@{ value = $text; type = [string]$cell.t; formula = $(if ($formula) { $formula.InnerText } else { $null }) }
            }
            $rows += [ordered]@{ number = [int]$row.r; cells = $cells }
        }
        $sheets += [ordered]@{ name = [string]$sheet.name; part = $part; rows = $rows }
    }
    $result = [ordered]@{
        sourceFile = [System.IO.Path]::GetFileName($SourcePath)
        sourceSha256 = (Get-FileHash -LiteralPath $SourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
        sheets = $sheets
    }
    [System.IO.File]::WriteAllText($OutputPath, (ConvertTo-Json -InputObject $result -Depth 40), (New-Object System.Text.UTF8Encoding($false)))
    $sheets | ForEach-Object { Write-Output "$($_.name): $($_.rows.Count) rows" }
} finally { $archive.Dispose() }
