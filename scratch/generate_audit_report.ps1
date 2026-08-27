$ErrorActionPreference = 'Stop'

$outPath = Join-Path $PSScriptRoot '..\TN-HUB_COMPLETE_AUDIT_REPORT.docx'
$outPath = [System.IO.Path]::GetFullPath($outPath)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $doc = $word.Documents.Add()
    $sec = $doc.Sections.Item(1)
    $sec.PageSetup.TopMargin = 72
    $sec.PageSetup.BottomMargin = 72
    $sec.PageSetup.LeftMargin = 72
    $sec.PageSetup.RightMargin = 72
    $sec.PageSetup.HeaderDistance = 35.5
    $sec.PageSetup.FooterDistance = 35.5

    $normal = $doc.Styles.Item('Normal')
    $normal.Font.Name = 'Calibri'
    $normal.Font.Size = 11
    $normal.ParagraphFormat.SpaceAfter = 6
    $normal.ParagraphFormat.SpaceBefore = 0
    $normal.ParagraphFormat.LineSpacingRule = 0

    foreach ($styleName in @('Heading 1', 'Heading 2', 'Heading 3')) {
        $style = $doc.Styles.Item($styleName)
        $style.Font.Name = 'Calibri'
        $style.ParagraphFormat.SpaceBefore = 12
        $style.ParagraphFormat.SpaceAfter = 6
    }
    $doc.Styles.Item('Heading 1').Font.Size = 16
    $doc.Styles.Item('Heading 1').Font.Color = 0xB5742E
    $doc.Styles.Item('Heading 2').Font.Size = 13
    $doc.Styles.Item('Heading 2').Font.Color = 0xB5742E
    $doc.Styles.Item('Heading 3').Font.Size = 12
    $doc.Styles.Item('Heading 3').Font.Color = 0x784D1F

    $sel = $word.Selection

    function Add-Paragraph {
        param(
            [string]$Text = '',
            [string]$Style = $null,
            [int]$Size = 11,
            [bool]$Bold = $false,
            [bool]$Italic = $false,
            [string]$Color = '000000',
            [int]$SpaceAfter = 6
        )
        $p = $doc.Paragraphs.Add()
        $p.Range.Text = $Text
        if ($Style) { $p.Range.Style = $Style }
        $p.Range.Font.Name = 'Calibri'
        $p.Range.Font.Size = $Size
        $p.Range.Font.Bold = [int]$Bold
        $p.Range.Font.Italic = [int]$Italic
        $p.Range.Font.Color = [int]("0x$Color")
        $p.Format.SpaceAfter = $SpaceAfter
        $p.Format.SpaceBefore = 0
        return $p
    }

    function Add-Bullet {
        param([string]$Text)
        $p = $doc.Paragraphs.Add()
        $p.Range.Text = $Text
        $p.Range.Style = $doc.Styles.Item('Normal')
        $p.Format.LeftIndent = 18
        $p.Format.FirstLineIndent = -18
        $p.Range.ListFormat.ApplyBulletDefault()
        $p.Range.Font.Name = 'Calibri'
        $p.Range.Font.Size = 11
        $p.Format.SpaceAfter = 4
        return $p
    }

    function Add-Heading1 { param([string]$Text) Add-Paragraph -Text $Text -Style 'Heading 1' -Size 16 -Bold $true -SpaceAfter 4 | Out-Null }
    function Add-Heading2 { param([string]$Text) Add-Paragraph -Text $Text -Style 'Heading 2' -Size 13 -Bold $true -SpaceAfter 4 | Out-Null }

    # Title block
    Add-Paragraph -Text 'TN HUB Complete Audit Report' -Size 26 -Bold $false -SpaceAfter 3 | Out-Null
    Add-Paragraph -Text 'System audit of architecture, security, performance, workflow integrity, and feature completeness.' -Size 11 -Italic $true -Color '555555' -SpaceAfter 2 | Out-Null
    Add-Paragraph -Text 'Scope: source code, routes, server APIs, Firebase rules, build output, demo data, and integration coverage.' -Size 9 -Color '666666' -SpaceAfter 10 | Out-Null

    # Executive summary table
    $tbl = $doc.Tables.Add($doc.Range($doc.Content.End - 1, $doc.Content.End - 1), 2, 2)
    $tbl.Borders.Enable = 1
    $tbl.AllowAutoFit = $false
    $tbl.Columns.Item(1).Width = 95
    $tbl.Columns.Item(2).Width = 360
    $tbl.Rows.Item(1).Range.Font.Size = 10
    $tbl.Cell(1,1).Shading.BackgroundPatternColor = 0xF4F6F9
    $tbl.Cell(1,1).Range.Text = 'Key takeaway'
    $tbl.Cell(1,2).Range.Text = 'TN HUB is technically real in its backend core, but several visible user journeys remain demo-only or partially simulated.'
    $tbl.Cell(2,1).Shading.BackgroundPatternColor = 0xF9FAFB
    $tbl.Cell(2,1).Range.Text = 'Most urgent risks'
    $tbl.Cell(2,2).Range.Text = 'Dummy OTP, mock DigiLocker, local simulation fallback on the officer review page, demo credentials, and a Windows build tracing failure.'
    foreach ($r in 1..2) {
        foreach ($c in 1..2) {
            $tbl.Cell($r,$c).Range.Font.Name = 'Calibri'
            $tbl.Cell($r,$c).Range.Font.Size = 10
        }
    }
    $doc.Paragraphs.Add() | Out-Null

    $sections = @(
        @{ Title = '1. Project Architecture'; Items = @(
            'Browser requests enter SvelteKit through hooks.server.js, which verifies the HttpOnly Firebase session cookie and injects locals.user.',
            'Route guards in src/lib/utils/authGuard.js separate citizen, operator, department, and admin routes.',
            'Page server loaders expose locals.user to layouts and pages, while src/routes/api/* handles privileged Firestore and Storage work.',
            'Firebase Auth is the client identity layer; Firebase Admin, Firestore, and Storage are the server state layer.'
        )},
        @{ Title = '2. Role to Route Map'; Items = @(
            'Citizen: /dashboard, /applications, /applications/[id], /documents, /notifications, /profile, /complaints.',
            'Operator: /operator/dashboard, /operator/applications, /operator/applications/[id]/edit, /operator/ai-chat, /operator/contact, /operator/grievance, /operator/profile, /operator/settings.',
            'Department user: /department/dashboard, /department/applications, /department/applications/[id], /department/notifications, /department/profile, /department/settings, /department/contact.',
            'Admin: /admin, /admin/approvals, /admin/helpdesk, /admin/profile.',
            'Legacy compatibility: /department/officer now redirects to the real department portal.'
        )},
        @{ Title = '3. Folder/File Problems'; Items = @(
            'Likely temporary or debug-oriented files: scratch/delete-applications.cjs, scratch/seed-officers.js, scratch/update-tnstc-url.js, scratch/clear-data.cjs, the scratch log files, test-firestore.js, test-list-dbs.js, patch.py, and likely e-sevai.docx / e_sevai_text.txt if they are no longer needed.',
            '.svelte-kit and node_modules are already ignored and should stay out of version control.',
            'Legacy UI artifacts still exist, especially the old /department/officer mock route.'
        )},
        @{ Title = '4. Dead Code / Unused Code'; Items = @(
            'The legacy officer page is effectively dead UI because its server loader immediately redirects to /department/dashboard.',
            'Mock data modules under src/lib/data are still used by demo seeding and demo-facing views, so they are not safe to delete yet.',
            'npm run check did not surface a broad unused-import or unused-variable problem.'
        )},
        @{ Title = '5. Performance Bottlenecks'; Items = @(
            'src/routes/+layout.svelte polls /api/notifications every 10 seconds for authenticated users.',
            'Header and MobileHeader also fetch unread-count separately, so notification traffic is duplicated.',
            'The build output shows a large module graph and heavy CSS compile time; the heaviest chunks are i18n, assistant logic, and application repositories.',
            'Reducing layout-wide polling and consolidating unread-notification fetches are the clearest quick performance wins.'
        )},
        @{ Title = '6. Memory / Vite / SSR Problems'; Items = @(
            'The earlier heap OOM was not reproduced in this audit.',
            'The current build failure is a Windows readlink permission error from @vercel/nft during the Vercel adapter closeBundle step.',
            'vite.config.js already externalizes firebase-admin and related Node-only modules to avoid SSR transport timeout issues.'
        )},
        @{ Title = '7. Middleware Problems'; Items = @(
            'hooks.server.js is simple and correct: it verifies the session cookie, clears invalid cookies, and assigns locals.user.',
            'No conflicting middleware or infinite redirect loop was found.',
            'Route access is primarily enforced by the auth guard, which aligns with the portal structure.'
        )},
        @{ Title = '8. Authentication Problems'; Items = @(
            'Firebase email/password auth is real.',
            'Server session cookies are real and verified through Firebase Admin.',
            'Official registrations are pending until admin approval and custom claims are applied.',
            'Google login was not found.',
            'OTP sign-in is not real; the service application form uses a hardcoded demo OTP path.'
        )},
        @{ Title = '9. Security Vulnerabilities'; Items = @(
            'Demo credentials are visible in the login UI and live in src/lib/data/users.js.',
            'The OTP flow is predictable and not server-trusted.',
            'The DigiLocker path is simulated, so it should not be described as a real external integration.',
            'No obvious rate limiting was found on public intake endpoints such as /api/contact and /api/complaints.',
            'Server-side authorization is otherwise much stronger than the demo UI suggests.'
        )},
        @{ Title = '10. Firebase Problems'; Items = @(
            'Firebase Admin initialization is single-instance and server-only.',
            'Firestore and Storage rules are restrictive and aligned with the server-authorized workflow.',
            'Demo seeding writes to live collections in a controlled manner, so demo and production data share the same schema.',
            'No duplicate Firebase app initialization problem was found.'
        )},
        @{ Title = '11. API Problems'; Items = @(
            'Core endpoints are real for auth/session, application CRUD, actions, document upload/download, notifications, complaints, profile, department settings, and Thozhan.',
            'The department application review page can fall back to local simulation if the API fails, which makes the UI less trustworthy than the backend.',
            'Contact/support writes tickets to Firestore but does not appear to send email.',
            'Duplicate notification fetching is the clearest API efficiency issue.'
        )},
        @{ Title = '12. Database Problems'; Items = @(
            'Collections observed: users, departments, services, workflows, applications, documents, notifications, complaints, supportTickets, auditLogs, systemCounters.',
            'Tracking IDs are server-generated and application history is append-only, which is good.',
            'Several list queries are limited to 100 without pagination.',
            'SLA storage exists, but weekend/holiday-aware calculations were not found.'
        )},
        @{ Title = '13. Mock / Dummy Features'; Items = @(
            'Clearly mocked: OTP, DigiLocker fetch/import, legacy officer queue, demo credentials, and several demo data sets.',
            'Thozhan is controlled and guided rather than free-form AI.',
            'Email approval is real only when SMTP env vars are configured.'
        )},
        @{ Title = '14. Incomplete Features'; Items = @(
            'Google login is missing.',
            'Real OTP provider integration is missing.',
            'SMS delivery is missing.',
            'Real DigiLocker integration is missing.',
            'Payment gateway integration is not implemented.',
            'SLA calendar logic is incomplete or unverified.'
        )},
        @{ Title = '15. DigiLocker Status'; Items = @(
            'Not real.',
            'The citizen document vault and service application pages simulate DigiLocker documents with fake data and a generated blob PDF.',
            'The UI explicitly labels the feature as mock.'
        )},
        @{ Title = '16. OTP Status'; Items = @(
            'Not real.',
            'The application form accepts a hardcoded 1234 code.',
            'No resend, expiration, or server-trusted verification flow was found.'
        )},
        @{ Title = '17. Email Status'; Items = @(
            'Partially real.',
            'src/lib/server/email.js is a real SMTP implementation.',
            'Admin approval email can be sent if SMTP is configured.',
            'Contact/helpdesk email delivery was not verified as a real outbound mail flow.'
        )},
        @{ Title = '18. SMS Status'; Items = @(
            'Not implemented as a real provider integration.',
            'The UI contains SMS labels and toggles, but no actual SMS gateway was found.'
        )},
        @{ Title = '19. Payment Status'; Items = @(
            'Incomplete.',
            'Razorpay environment placeholders exist, but no working payment flow or webhook verification path was found.'
        )},
        @{ Title = '20. Document Vault Status'; Items = @(
            'Real upload/download path exists for citizen vault documents.',
            'Uploads are private in Firebase Storage and downloads are authorized server-side.',
            'DigiLocker import remains mock.'
        )},
        @{ Title = '21. Service Workflow Status'; Items = @(
            'The workflow engine is real and server-backed.',
            'Submission validates required fields and required documents.',
            'Final approve/reject requires submitted documents to be viewed first.',
            'The legacy officer UI still contains a simulation fallback that should be removed.'
        )},
        @{ Title = '22. Application Submission Problems'; Items = @(
            'The server submission path is mostly sound: it validates fields, checks documents, and avoids duplicate application creation on resubmission.',
            'The front-end still contains demo-only OTP and DigiLocker steps, which can confuse the perceived submission state.',
            'Any remaining submit failure is more likely a UI or network flow issue than a missing server transaction.'
        )},
        @{ Title = '23. Thozhan AI Status'; Items = @(
            'Thozhan is guided and option-driven, not open-ended chat.',
            'No external AI provider call was found in the audited path.',
            'The intended predefined help categories are implemented.'
        )},
        @{ Title = '24. Role / Portal Problems'; Items = @(
            'Portal separation is mostly correct.',
            'The legacy /department/officer route is preserved as a redirect only.',
            'No major role leakage was found in the server authorization model.'
        )},
        @{ Title = '25. UI / Frontend Technical Problems'; Items = @(
            'Light mode still needs cleanup in several screens, but that is a presentation issue rather than a backend failure.',
            'The citizen application timeline is based on raw history entries, so it may display stages like Start even when the workflow has advanced.',
            'The department review page should not fall back to simulated action handling.'
        )},
        @{ Title = '26. Dependency Problems'; Items = @(
            'The dependency set is small and sensible: SvelteKit, Vite, Tailwind, firebase, firebase-admin, and @lucide/svelte.',
            'No obvious duplicate dependency set was found.',
            'No Google auth, SMS, or payment provider dependency was found.'
        )},
        @{ Title = '27. Critical Bugs'; Items = @(
            'Dummy OTP and mock DigiLocker are still present in primary user flows.',
            'The department application review page can simulate success after API failure.',
            'The citizen timeline does not fully reflect the real workflow state.',
            'npm run build currently fails on the Windows tracing step.'
        )},
        @{ Title = '28. Quick Wins'; Items = @(
            'Remove the local simulation fallback from the department review page.',
            'Replace the dummy OTP with a real provider or disable it for now.',
            'Replace the mock DigiLocker branch with a clear not-available state.',
            'Reduce notification polling duplication.',
            'Hide demo credentials from production-facing login UI.'
        )},
        @{ Title = '29. High Priority Fixes'; Items = @(
            'Fix the Windows adapter tracing build error.',
            'Remove simulated officer fallback behavior.',
            'Replace dummy OTP with a real flow or remove it.',
            'Stop showing mock DigiLocker as if it were real integration.',
            'Consolidate notification fetching.'
        )},
        @{ Title = '30. Long-Term Improvements'; Items = @(
            'Real phone OTP integration.',
            'Real DigiLocker OAuth and retrieval.',
            'SMS gateway integration.',
            'Real payment gateway and webhook verification.',
            'Weekend and holiday-aware SLA calculations.',
            'Pagination and rate limiting on public intake endpoints.'
        )},
        @{ Title = '31. Recommended Implementation Order'; Items = @(
            'Phase 0: stabilize build, SSR, and notification polling.',
            'Phase 1: security, auth, validation, and rate limiting.',
            'Phase 2: architecture cleanup and removal of local simulation fallbacks.',
            'Phase 3: performance tuning.',
            'Phase 4: feature completion for OTP, DigiLocker, SMS, payment, and Google login.',
            'Phase 5: reliability improvements for submission and workflow state synchronization.',
            'Phase 6: UI and light-mode polishing after the technical paths are stable.'
        )}
    )

    foreach ($section in $sections) {
        Add-Heading1 $section.Title
        foreach ($item in $section.Items) {
            Add-Bullet $item
        }
    }

    Add-Heading1 'Feature Matrix'
    Add-Paragraph -Text 'Summary of implementation status across the main portals and backend.' -Size 11 -Color '555555' -SpaceAfter 6 | Out-Null
    $featureTable = $doc.Tables.Add($doc.Range($doc.Content.End - 1, $doc.Content.End - 1), 23, 8)
    $featureTable.Borders.Enable = 1
    $featureTable.AllowAutoFit = $false
    $featureTable.Columns.Item(1).Width = 92
    $featureTable.Columns.Item(2).Width = 58
    $featureTable.Columns.Item(3).Width = 58
    $featureTable.Columns.Item(4).Width = 58
    $featureTable.Columns.Item(5).Width = 58
    $featureTable.Columns.Item(6).Width = 58
    $featureTable.Columns.Item(7).Width = 78
    $featureTable.Columns.Item(8).Width = 82
    $headers = @('Feature','Customer','Operator','Officer','Admin','Backend','Real Integration','Status')
    for ($i = 1; $i -le 8; $i++) {
        $featureTable.Cell(1,$i).Range.Text = $headers[$i-1]
        $featureTable.Cell(1,$i).Shading.BackgroundPatternColor = 0xF2F4F7
        $featureTable.Cell(1,$i).Range.Font.Bold = $true
        $featureTable.Cell(1,$i).Range.Font.Size = 9
    }
    $featureRows = @(
        @('Authentication','Real','Real','Real','Real','Yes','Yes','Mostly implemented'),
        @('OTP','UI only','UI only','UI only','UI only','No','No','Mocked'),
        @('Email','Partial','Partial','Partial','Partial','Yes','Partial','Partially real'),
        @('SMS','UI only','UI only','UI only','UI only','No','No','Incomplete'),
        @('Google Login','Missing','Missing','Missing','Missing','No','No','Missing'),
        @('Registration','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Profile','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Services','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Applications','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Documents','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Document Vault','Real','N/A','N/A','N/A','Yes','Partial','Working'),
        @('DigiLocker','Mock','Mock','Mock','Mock','No','No','Mocked'),
        @('Payment','Missing','Missing','Missing','Missing','No','No','Incomplete'),
        @('Notifications','Real','Real','Real','Real','Yes','Yes','Working'),
        @('SLA','Partial','Partial','Partial','Partial','Yes','Partial','Partially implemented'),
        @('Tracking','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Help Desk','Real','Real','Real','Real','Yes','Partial','Working'),
        @('Reports','Partial','Partial','Partial','Partial','Yes','Partial','Partial'),
        @('Service Integration','Partial','Partial','Partial','Partial','Yes','Partial','Partial'),
        @('Thozhan AI','Guided','Guided','Guided','Guided','Yes','No external AI','Controlled'),
        @('Department routing','Real','Real','Real','Real','Yes','Yes','Working'),
        @('Officer processing','N/A','N/A','Real','Real','Yes','Yes','Working'),
        @('Admin approval','N/A','N/A','N/A','Real','Yes','Yes','Working')
    )
    for ($r = 0; $r -lt $featureRows.Count; $r++) {
        for ($c = 0; $c -lt 8; $c++) {
            $cell = $featureTable.Cell($r + 2, $c + 1)
            $cell.Range.Text = $featureRows[$r][$c]
            $cell.Range.Font.Size = 8
        }
    }

    Add-Heading1 'Prioritized Performance and Risk Table'
    Add-Paragraph -Text 'Highest impact issues identified during the audit.' -Size 11 -Color '555555' -SpaceAfter 6 | Out-Null
    $riskTable = $doc.Tables.Add($doc.Range($doc.Content.End - 1, $doc.Content.End - 1), 7, 7)
    $riskTable.Borders.Enable = 1
    $riskTable.AllowAutoFit = $false
    $riskTable.Columns.Item(1).Width = 52
    $riskTable.Columns.Item(2).Width = 105
    $riskTable.Columns.Item(3).Width = 122
    $riskTable.Columns.Item(4).Width = 110
    $riskTable.Columns.Item(5).Width = 112
    $riskTable.Columns.Item(6).Width = 48
    $riskTable.Columns.Item(7).Width = 44
    $riskHeaders = @('Severity','File','Problem','Why it matters','Recommended fix','Risk','Conf.')
    for ($i = 1; $i -le 7; $i++) {
        $riskTable.Cell(1,$i).Range.Text = $riskHeaders[$i-1]
        $riskTable.Cell(1,$i).Shading.BackgroundPatternColor = 0xF2F4F7
        $riskTable.Cell(1,$i).Range.Font.Bold = $true
        $riskTable.Cell(1,$i).Range.Font.Size = 9
    }
    $riskRows = @(
        @('Critical','src/routes/+layout.svelte','Global notification polling every 10s plus duplicate unread-count fetches','Unnecessary network traffic on authenticated pages','Consolidate notification loading; avoid duplicate fetches','Low','High'),
        @('Critical','src/routes/(department)/department/applications/[id]/+page.svelte','Falls back to local simulated action handling','Can show success even when API fails','Remove local simulation and surface API error','Low','High'),
        @('High','src/routes/(public)/services/[slug]/apply/+page.svelte','Hardcoded OTP flow and mock DigiLocker path','Misrepresents real integrations and can block user trust','Replace with real provider or mark as unavailable','Medium','High'),
        @('High','vite.config.js / build output','Windows adapter tracing readlink failure','Build completes compile phase but fails at packaging','Adjust adapter tracing or environment permissions','Medium','High'),
        @('Medium','src/lib/server/applications/repository.js','Large multi-responsibility server module','Heavy server bundle and harder maintenance','Split repository responsibilities into smaller modules','Medium','Medium'),
        @('Low','src/lib/data/* demo fixtures','Demo data still lives alongside production code','Causes confusion if left visible in UI','Keep for seed scripts only or isolate clearly','Low','Medium')
    )
    for ($r = 0; $r -lt $riskRows.Count; $r++) {
        for ($c = 0; $c -lt 7; $c++) {
            $cell = $riskTable.Cell($r + 2, $c + 1)
            $cell.Range.Text = $riskRows[$r][$c]
            $cell.Range.Font.Size = 8
        }
    }

    Add-Heading1 'Exact Files to Modify Next'
    foreach ($file in @(
        'src/routes/(public)/services/[slug]/apply/+page.svelte',
        'src/routes/(citizen)/documents/+page.svelte',
        'src/routes/(department)/department/applications/[id]/+page.svelte',
        'src/routes/(citizen)/applications/[id]/+page.svelte',
        'src/routes/+layout.svelte',
        'src/lib/server/applications/repository.js',
        'src/lib/server/notifications/repository.js',
        'src/routes/(public)/login/+page.svelte',
        'src/routes/(department)/officer/+page.svelte',
        'src/routes/(department)/officer/+page.server.js',
        'vite.config.js',
        'src/lib/data/users.js',
        'src/lib/data/documents.js',
        'src/lib/server/email.js',
        'src/routes/api/contact/+server.js'
    )) { Add-Bullet $file }

    Add-Paragraph -Text 'What actually works right now: server auth, route guards, Firestore-backed workflows, Storage-backed document upload/download, admin approvals, notifications, complaint intake, and controlled Thozhan guidance.' -Size 11 -Color '333333' -SpaceAfter 4 | Out-Null

    $doc.SaveAs([ref]$outPath)
    $doc.Close()
    Write-Output $outPath
}
finally {
    $word.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
}
