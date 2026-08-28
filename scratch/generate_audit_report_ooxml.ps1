$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

$outPath = Join-Path $PSScriptRoot '..\TN-HUB_COMPLETE_AUDIT_REPORT.docx'
$outPath = [System.IO.Path]::GetFullPath($outPath)

function Escape-Xml([string]$Text) {
    if ($null -eq $Text) { return '' }
    return [System.Security.SecurityElement]::Escape($Text)
}

function New-ParaXml {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [int]$Size = 22,
        [switch]$Bold,
        [switch]$Italic,
        [string]$Color = '000000',
        [int]$Before = 0,
        [int]$After = 120,
        [int]$Left = 0,
        [string]$Align = 'left'
    )

    $rPr = '<w:rPr>'
    if ($Bold) { $rPr += '<w:b/>' }
    if ($Italic) { $rPr += '<w:i/>' }
    $rPr += "<w:sz w:val='$Size'/><w:szCs w:val='$Size'/>"
    if ($Color) { $rPr += "<w:color w:val='$Color'/>" }
    $rPr += '</w:rPr>'

    $pPr = "<w:pPr><w:spacing w:before='$Before' w:after='$After'/><w:ind w:left='$Left'/><w:jc w:val='$Align'/></w:pPr>"
    return "<w:p>$pPr<w:r>$rPr<w:t xml:space='preserve'>$(Escape-Xml $Text)</w:t></w:r></w:p>"
}

function New-BulletXml {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [int]$Size = 22,
        [string]$Color = '000000'
    )

    return New-ParaXml -Text "- $Text" -Size $Size -Color $Color -Left 360 -After 70
}

function New-SectionXml {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string[]]$Bullets
    )

    $parts = New-Object System.Collections.Generic.List[string]
    $parts.Add((New-ParaXml -Text $Title -Size 26 -Bold -Color '1F5E35' -Before 180 -After 90))
    foreach ($bullet in $Bullets) {
        $parts.Add((New-BulletXml -Text $bullet))
    }
    return $parts
}

$sections = @(
    @{
        Title = 'Executive Summary'
        Bullets = @(
            'TN HUB is broadly functional in the real Firebase auth and session path, but several user-facing workflows still rely on demo, mock, or fallback behavior.',
            'The highest-risk gaps are dummy OTP, mock DigiLocker, duplicate notification requests, status/timeline drift, and legacy officer queue logic.',
            'The current build issue is an EPERM readlink failure during packaging/tracing, not the older heap-limit symptom.'
        )
    },
    @{
        Title = 'Project Architecture'
        Bullets = @(
            'The app is a SvelteKit project with role-separated citizen, operator, officer/department, and admin portals.',
            'Server-side auth/session handling is present and is one of the strongest parts of the codebase.',
            'Shared layouts and shared UI stores are convenient, but some shared components still cause duplicate network work.'
        )
    },
    @{
        Title = 'Folder / File Problems'
        Bullets = @(
            'Demo fixture files remain in `src/lib/data/` and can mislead production behavior if they are still imported by live routes.',
            'Legacy officer queue paths still exist under `src/routes/(department)/officer/` and should be treated as old flow surface until verified.',
            'Scratch scripts and logs under `scratch/` are local working artifacts and should stay out of production bundles.'
        )
    },
    @{
        Title = 'Dead / Unused Code'
        Bullets = @(
            'The strongest candidates for cleanup are the demo user, application, document, complaint, and notification fixture modules.',
            'The old officer queue page and any fallback simulation code around it look like the most likely dead-path sources.',
            'Confidence is moderate until each candidate is checked for references, because some demo data may still be used in development.'
        )
    },
    @{
        Title = 'Performance Bottlenecks'
        Bullets = @(
            'Notification polling in the root layout plus additional unread-count fetching in headers creates duplicate requests.',
            'Large shared layouts and repeated client-side fetches are the most visible sources of lag from the audit.',
            'Firestore and auth are not the dominant bottlenecks; duplicated UI requests are more likely to be felt first by users.'
        )
    },
    @{
        Title = 'Memory / Vite / SSR Problems'
        Bullets = @(
            'The reproducible build problem is a Vercel tracing EPERM readlink failure.',
            'The audit did not confirm a live heap leak as the current root cause, so increasing Node memory would not be the first fix.',
            'Vite SSR handling already externalizes Node-only Firebase admin dependencies, which is a positive sign.'
        )
    },
    @{
        Title = 'Middleware Problems'
        Bullets = @(
            'Server hook/session verification is present and does real work.',
            'Role routing logic exists, but some UI paths can still expose stale or fallback states when client-side state and server truth drift.',
            'The main caution is avoiding duplicated authorization checks across hook, layout, and page layers.'
        )
    },
    @{
        Title = 'Authentication Problems'
        Bullets = @(
            'Core Firebase authentication and HttpOnly session handling appear real and server-backed.',
            'OTP inside the application submission flow is dummy and not a production-grade verification path.',
            'Admin approval emails are real if SMTP environment variables are configured, but the submission/registration UX needs clearer state handling.'
        )
    },
    @{
        Title = 'Security Vulnerabilities'
        Bullets = @(
            'Demo credentials and mocked flows are the largest visible trust issue because they can confuse real and fake behavior.',
            'Public intake endpoints need rate-limit and validation attention.',
            'Role and application state should stay server-authoritative, especially where fallback UI can otherwise simulate success.'
        )
    },
    @{
        Title = 'Firebase Problems'
        Bullets = @(
            'Firebase auth, Firestore, and Storage are real, and the security posture is materially better than a client-only design.',
            'The most important Firebase concern is not duplicate app creation; it is ensuring client-trusted fields cannot override server truth.',
            'Firestore query volume should be watched where repeated UI fetches create unnecessary reads.'
        )
    },
    @{
        Title = 'API Problems'
        Bullets = @(
            'Notification and unread-count endpoints are called more than once in the current layout/header stack.',
            'Some API flows have fallback behavior that can make the UI look successful even when the backend path failed.',
            'Public endpoints for contact or complaints need explicit validation and abuse resistance.'
        )
    },
    @{
        Title = 'Database Problems'
        Bullets = @(
            'The data model is service/application centered, but some seeded/demo collections can blur what is production data and what is test data.',
            'Application status fields must stay synchronized across workflow history, queue views, and user-facing timelines.',
            'The rejected-versus-start timeline drift is a real data-visualization bug, not just a styling issue.'
        )
    },
    @{
        Title = 'Mock / Dummy Features'
        Bullets = @(
            'Dummy OTP exists in the application submission flow.',
            'Mock DigiLocker behavior exists in both citizen documents and service application paths.',
            'Demo user and fixture datasets remain present and should be clearly isolated from production logic.'
        )
    },
    @{
        Title = 'Incomplete Features'
        Bullets = @(
            'SMS, payment, and full DigiLocker integrations were not verified as production-ready.',
            'The document submission and correction re-submit path needs better state alignment so corrected applications can be submitted reliably.',
            'The officer review flow still needs the hard rule that documents must be viewed before approve/reject actions are allowed.'
        )
    },
    @{
        Title = 'DigiLocker Status'
        Bullets = @(
            'DigiLocker is not yet real in the audited user journeys.',
            'The current behavior is best classified as mocked or simulated.',
            'The integration should be treated as incomplete until a real OAuth/document retrieval path is verified.'
        )
    },
    @{
        Title = 'OTP Status'
        Bullets = @(
            'OTP in the submission flow is dummy.',
            'That means the visible UI flow is not equivalent to a verified production OTP system.',
            'If OTP is required for production submission, it must move to a server-trusted provider and rate-limited flow.'
        )
    },
    @{
        Title = 'Email Status'
        Bullets = @(
            'Email sending appears real through the SMTP helper when configuration is present.',
            'Admin approval email is therefore not just UI-only, but it still depends on environment setup.',
            'Error handling should be tightened so email failures do not get hidden behind success UI.'
        )
    },
    @{
        Title = 'SMS Status'
        Bullets = @(
            'No production SMS provider was confirmed in the audit.',
            'SMS should be treated as incomplete or unverified until a concrete provider and server path are confirmed.',
            'Any SMS-like feedback visible in the UI should not be assumed real.'
        )
    },
    @{
        Title = 'Payment Status'
        Bullets = @(
            'A placeholder payment configuration exists, but a complete, verified gateway + webhook flow was not confirmed.',
            'Payment should be considered incomplete until initiation, verification, and persistence are all server-authoritative.',
            'Users should not be able to bypass payment if the service requires it.'
        )
    },
    @{
        Title = 'Document Vault Status'
        Bullets = @(
            'Document upload and document viewing exist, but vault reuse and authorization should be checked carefully around real storage rules.',
            'The officer workflow must respect document visibility before decision actions.',
            'Vault reuse is useful only if access control remains server-enforced.'
        )
    },
    @{
        Title = 'Service Workflow Status'
        Bullets = @(
            'Most service pages exist, but some verification and correction flows still depend on mock or fallback handling.',
            'The workflow should progress from draft to verification to completed/rejected based on real backend state, not UI assumptions.',
            'Status labels, timelines, and action availability must all read from the same authoritative process model.'
        )
    },
    @{
        Title = 'Application Submission Problems'
        Bullets = @(
            'The most important submission bug is the mismatch between actual backend success and the UI message that says submission failed.',
            'The corrected-application submission path is blocked by state logic that only allows updates from drafts.',
            'Idempotent submission handling should be added after root-cause validation so retries do not create duplicates.'
        )
    },
    @{
        Title = 'Thozhan AI Status'
        Bullets = @(
            'The intended chatbot should use predefined choices, not free-form arbitrary questions.',
            'The audit focus was on verifying whether that guided behavior is actually enforced.',
            'Any free-text fallback or hardcoded answer flow should be treated as incomplete until confirmed otherwise.'
        )
    },
    @{
        Title = 'Role / Portal Problems'
        Bullets = @(
            'Customer, operator, officer, and admin are separate portals, but shared layouts can still create stale role rendering if session state is not refreshed cleanly.',
            'The admin approval queue and officer processing queue must remain distinct so role leakage does not occur.',
            'Logout and sign-out visual states should remain neutral and consistent across themes.'
        )
    },
    @{
        Title = 'UI / UX Technical Problems'
        Bullets = @(
            'The light theme was not visually consistent with the design palette and had several clean-up issues compared to the dark theme.',
            'Some views used heavy emphasis or placeholder states that made the UI feel less trustworthy than the real backend state.',
            'Layout, spacing, and status color usage should follow one consistent token system.'
        )
    },
    @{
        Title = 'Dependency Problems'
        Bullets = @(
            'The current audit did not show a need for an emergency dependency upgrade.',
            'The main dependency risk is unnecessary bundle weight from large shared libraries or duplicated client requests, not a missing package.',
            'Dependency pruning should come after the real dead-code review is confirmed.'
        )
    },
    @{
        Title = 'Critical Bugs'
        Bullets = @(
            'Rejected applications can still appear visually stuck in a start-like timeline state.',
            'Officer approval or rejection can be performed without a hard document-view precondition unless the UI/server guard is enforced.',
            'Corrected application resubmission can fail even when the backend may have accepted the change.'
        )
    },
    @{
        Title = 'Quick Wins'
        Bullets = @(
            'Remove duplicate notification fetching.',
            'Replace dummy OTP and mock DigiLocker labels with real status messages or disable the feature paths.',
            'Fix the corrected-application submission state machine and the rejected timeline rendering.'
        )
    },
    @{
        Title = 'High Priority Fixes'
        Bullets = @(
            'Enforce document-view checks before officer approve/reject actions.',
            'Make application status and timeline fully dynamic from the workflow source of truth.',
            'Separate mock/demo data from production paths so the UI cannot silently use fake behavior.'
        )
    },
    @{
        Title = 'Long-Term Improvements'
        Bullets = @(
            'Consolidate notification fetching into a single source of truth.',
            'Formalize service workflow states so draft, verification, rejected, and completed are rendered consistently everywhere.',
            'Move towards a clearer feature-complete versus mocked feature boundary in the codebase.'
        )
    },
    @{
        Title = 'Recommended Implementation Order'
        Bullets = @(
            'Phase 0: stabilize build/tracing and remove duplicate requests.',
            'Phase 1: tighten security and authorization around submissions and officer actions.',
            'Phase 2: fix the workflow and status model, then Phase 3: complete real integrations.'
        )
    },
    @{
        Title = 'Exact Files to Modify Next'
        Bullets = @(
            'src/routes/(public)/services/[slug]/apply/+page.svelte',
            'src/routes/(citizen)/applications/[id]/+page.svelte',
            'src/routes/(department)/department/applications/[id]/+page.svelte',
            'src/routes/(department)/officer/+page.svelte',
            'src/routes/(department)/officer/+page.server.js',
            'src/routes/+layout.svelte',
            'src/lib/components/layout/Header.svelte',
            'src/lib/components/layout/MobileHeader.svelte',
            'src/lib/data/users.js',
            'src/lib/data/applications.js',
            'src/lib/data/documents.js',
            'src/lib/data/notifications.js',
            'src/lib/server/email.js',
            'src/routes/api/notifications/+server.js'
        )
    }
)

$body = New-Object System.Collections.Generic.List[string]
$body.Add((New-ParaXml -Text 'TN HUB Complete Audit Report' -Size 34 -Bold -Color '1F5E35' -Before 220 -After 120 -Align 'center'))
$body.Add((New-ParaXml -Text 'Prepared from the completed codebase audit. This document summarizes what is real, what is mocked, what is broken, and what should be fixed first.' -Size 22 -Italic -Color '555555' -After 180 -Align 'center'))

foreach ($section in $sections) {
    foreach ($para in (New-SectionXml -Title $section.Title -Bullets $section.Bullets)) {
        $body.Add($para)
    }
}

$body.Add((New-ParaXml -Text 'End of report.' -Size 20 -Italic -Color '666666' -Before 150 -After 80 -Align 'center'))

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
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
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

if (Test-Path $outPath) {
    Remove-Item $outPath -Force
}

$stream = [System.IO.File]::Open($outPath, [System.IO.FileMode]::CreateNew)
try {
    $zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        $encoding = New-Object System.Text.UTF8Encoding($false)
        foreach ($entry in @(
            @{ Name = '[Content_Types].xml'; Content = $contentTypesXml },
            @{ Name = '_rels/.rels'; Content = $relsXml },
            @{ Name = 'word/document.xml'; Content = $documentXml }
        )) {
            $zipEntry = $zip.CreateEntry($entry.Name)
            $writer = New-Object System.IO.StreamWriter($zipEntry.Open(), $encoding)
            try {
                $writer.Write($entry.Content)
            } finally {
                $writer.Dispose()
            }
        }
    } finally {
        $zip.Dispose()
    }
} finally {
    $stream.Dispose()
}

Write-Host "Created $outPath"
