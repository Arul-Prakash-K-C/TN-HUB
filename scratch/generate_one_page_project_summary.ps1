$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

$outPath = Join-Path $PSScriptRoot '..\TN-HUB_ONE_PAGE_PROJECT_SUMMARY.docx'
$outPath = [System.IO.Path]::GetFullPath($outPath)

function Escape-Xml([string]$Text) {
    if ($null -eq $Text) { return '' }
    return [System.Security.SecurityElement]::Escape($Text)
}

function P([string]$Text, [int]$Size = 20, [string]$Color = '000000', [switch]$Bold, [switch]$Italic, [int]$Before = 0, [int]$After = 80, [int]$Left = 0, [string]$Align = 'left') {
    $rPr = '<w:rPr>'
    if ($Bold) { $rPr += '<w:b/>' }
    if ($Italic) { $rPr += '<w:i/>' }
    $rPr += "<w:sz w:val='$Size'/><w:szCs w:val='$Size'/><w:color w:val='$Color'/>"
    $rPr += '</w:rPr>'
    $pPr = "<w:pPr><w:spacing w:before='$Before' w:after='$After'/><w:ind w:left='$Left'/><w:jc w:val='$Align'/></w:pPr>"
    return "<w:p>$pPr<w:r>$rPr<w:t xml:space='preserve'>$(Escape-Xml $Text)</w:t></w:r></w:p>"
}

function Bul([string]$Text) { P "- $Text" 18 '222222' -Left 260 -After 40 }

$body = New-Object System.Collections.Generic.List[string]

$body.Add((P 'TN HUB' 34 '1F5E35' -Bold -Before 120 -After 40 -Align 'center'))
$body.Add((P 'One-Page Project Summary' 22 '5A5A5A' -Italic -After 120 -Align 'center'))

$body.Add((P 'What it is' 24 '1F5E35' -Bold -Before 60 -After 30))
$body.Add((P 'TN HUB is a multi-role digital public service platform for citizens, operators, officers, and admins. It supports service applications, document handling, workflow tracking, approvals, and help-desk support in a SvelteKit + Firebase stack.' 18 '222222' -After 60))

$body.Add((P 'What works well' 24 '1F5E35' -Bold -Before 40 -After 30))
$body.Add((Bul 'Real Firebase authentication and server-side session handling are in place.'))
$body.Add((Bul 'Role-based portals separate citizen, operator, officer, and admin workflows.'))
$body.Add((Bul 'Firestore and Storage are used for application, document, and workflow data.'))
$body.Add((Bul 'Admin approval email flow is real when SMTP configuration is present.'))

$body.Add((P 'Current gaps' 24 '1F5E35' -Bold -Before 40 -After 30))
$body.Add((Bul 'Dummy OTP and mock DigiLocker flows still exist in key journeys.'))
$body.Add((Bul 'Notification requests are duplicated in shared layout/header logic.'))
$body.Add((Bul 'Rejected applications and corrected submissions need better status syncing.'))
$body.Add((Bul 'Officer actions should require document viewing before approve/reject.'))

$body.Add((P 'Priority next steps' 24 '1F5E35' -Bold -Before 40 -After 30))
$body.Add((Bul 'Fix the workflow state model so timeline, status, and backend truth always match.'))
$body.Add((Bul 'Replace mock features with real integrations or clearly disable them.'))
$body.Add((Bul 'Remove duplicate notification fetching and tighten public endpoint validation.'))

$body.Add((P 'Technology stack' 24 '1F5E35' -Bold -Before 40 -After 30))
$body.Add((P 'SvelteKit, Firebase Auth, Firestore, Firebase Storage, server hooks, role-based layouts, and SMTP email delivery.' 18 '222222' -After 40))

$body.Add((P 'Bottom line' 24 '1F5E35' -Bold -Before 30 -After 20))
$body.Add((P 'TN HUB already has a strong real backend foundation. The next step is to remove mock behavior, align workflow state with the database, and polish the admin and officer experience so the product feels consistent and trustworthy.' 18 '222222' -After 40))

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
$($body -join "`r`n")
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
      <w:cols w:space="360"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
'@

$relsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
'@

if (Test-Path $outPath) { Remove-Item $outPath -Force }

$stream = [System.IO.File]::Open($outPath, [System.IO.FileMode]::CreateNew)
try {
    $zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        $utf8 = New-Object System.Text.UTF8Encoding($false)
        foreach ($entry in @(
            @{ Name = '[Content_Types].xml'; Content = $contentTypesXml },
            @{ Name = '_rels/.rels'; Content = $relsXml },
            @{ Name = 'word/document.xml'; Content = $documentXml }
        )) {
            $ze = $zip.CreateEntry($entry.Name)
            $writer = New-Object System.IO.StreamWriter($ze.Open(), $utf8)
            try { $writer.Write($entry.Content) } finally { $writer.Dispose() }
        }
    } finally {
        $zip.Dispose()
    }
} finally {
    $stream.Dispose()
}

Write-Host "Created $outPath"
