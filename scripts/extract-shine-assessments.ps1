param(
    [Parameter(Mandatory = $true)][string]$SourcePath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [Parameter(Mandatory = $true)][string]$AssetsPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $SourcePath))
try {
    function Read-Part([string]$Name) {
        $entry = $archive.GetEntry($Name)
        if (-not $entry) { return $null }
        $reader = New-Object System.IO.StreamReader($entry.Open())
        try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    [xml]$document = Read-Part 'word/document.xml'
    $ns = New-Object System.Xml.XmlNamespaceManager($document.NameTable)
    $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
    $ns.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
    function Read-Text($Node) {
        $parts = foreach ($part in $Node.SelectNodes('.//w:t | .//w:br | .//w:tab', $ns)) {
            if ($part.LocalName -eq 'br') { "`n" }
            elseif ($part.LocalName -eq 'tab') { "`t" }
            else { $part.InnerText }
        }
        return ($parts -join '')
    }
    [xml]$relationships = Read-Part 'word/_rels/document.xml.rels'
    $imageRelationships = @{}
    New-Item -ItemType Directory -Force -Path $AssetsPath | Out-Null
    foreach ($relationship in $relationships.Relationships.Relationship) {
        if ($relationship.Target -like 'media/*') {
            $filename = [System.IO.Path]::GetFileName($relationship.Target)
            $imageRelationships[$relationship.Id] = $filename
            $inputStream = $archive.GetEntry("word/$($relationship.Target)").Open()
            $outputStream = [System.IO.File]::Create((Join-Path $AssetsPath $filename))
            try { $inputStream.CopyTo($outputStream) }
            finally { $inputStream.Dispose(); $outputStream.Dispose() }
        }
    }
    $blocks = @(); $index = 0
    foreach ($node in $document.SelectSingleNode('//w:body', $ns).ChildNodes) {
        $block = [ordered]@{ index = $index; type = $node.LocalName; text = (Read-Text $node) }
        $table = if ($node.LocalName -eq 'tbl') { $node } else { $node.SelectSingleNode('.//w:tbl', $ns) }
        if ($table) {
            $block.rows = @($table.SelectNodes('./w:tr', $ns) | ForEach-Object {
                ,@($_.SelectNodes('./w:tc', $ns) | ForEach-Object { Read-Text $_ })
            })
        }
        $block.images = @($node.SelectNodes('.//a:blip', $ns) | ForEach-Object {
            $relationshipId = $_.GetAttribute('embed', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
            if (-not $imageRelationships.ContainsKey($relationshipId)) { throw "Missing image $relationshipId" }
            $imageRelationships[$relationshipId]
        })
        $block.commentIds = @($node.SelectNodes('.//w:commentRangeStart', $ns) | ForEach-Object {
            $_.GetAttribute('id', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
        })
        $blocks += $block
        $index++
    }
    $comments = @()
    $commentsPart = Read-Part 'word/comments.xml'
    if ($commentsPart) {
        [xml]$commentsXml = $commentsPart
        foreach ($comment in $commentsXml.SelectNodes('//w:comment', $ns)) {
            $comments += [ordered]@{
                id = $comment.GetAttribute('id', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
                text = (Read-Text $comment)
            }
        }
    }
    $result = [ordered]@{
        sourceFile = [System.IO.Path]::GetFileName($SourcePath)
        sourceSha256 = (Get-FileHash -LiteralPath $SourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
        blocks = $blocks
        comments = $comments
        trackedInsertionCount = $document.SelectNodes('//w:ins', $ns).Count
        trackedDeletionCount = $document.SelectNodes('//w:del', $ns).Count
    }
    $json = ConvertTo-Json -InputObject $result -Depth 40
    [System.IO.File]::WriteAllText($OutputPath, $json, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output "Extracted $($blocks.Count) blocks, $($imageRelationships.Count) images, and $($comments.Count) editorial comments."
} finally { $archive.Dispose() }
