$OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding

$RESEND_API_KEY = "re_jYWvaGaM_JRKsfJPpeRs6nvMnWvqPwcAV"
$userName = "Sam"

$html = @"
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 16px; color: #374151;">Hi $userName,</p>
  <p style="font-size: 16px; color: #374151;">Happy Independence Day! 🇬🇭</p>
  <p style="font-size: 16px; color: #374151;">As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.</p>
  <p style="font-size: 16px; color: #374151;">Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!</p>
  <p style="font-size: 16px; color: #374151;">Best,<br/>Sam from Penny Pal</p>
</div>
"@

$text = @"
Hi $userName,

Happy Independence Day! 🇬🇭

As we celebrate Ghana's independence today, let it also be a powerful reminder of your own journey toward financial independence.

Just as our forebears fought for the liberty we enjoy today, every logged expense and saved cedi is a step toward your own true freedom. Keep tracking your progress, keep growing your savings, and enjoy the celebrations!

Best,
Sam from Penny Pal
"@

$body = @{
    from = "Sam from Penny Pal <support@mypennypal.com>"
    to = @("bigsamcreates@gmail.com")
    subject = "Happy Independence Day!"
    text = $text
    html = $html
}

# The trick is to ensure ConvertTo-Json doesn't escape unicode by avoiding deep conversion if possible, 
# or by explicitly encoding the resulting JSON string to bytes.
$jsonBody = $body | ConvertTo-Json -Depth 5

$bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)

# Use Invoke-RestMethod for simplicity but pass byte array
try {
    $response = Invoke-RestMethod -Uri "https://api.resend.com/emails" `
                                  -Method Post `
                                  -Headers @{ "Authorization" = "Bearer $RESEND_API_KEY" } `
                                  -ContentType "application/json; charset=utf-8" `
                                  -Body $bytes
    $response | ConvertTo-Json
} catch {
    Write-Error $_.Exception.Message
}
