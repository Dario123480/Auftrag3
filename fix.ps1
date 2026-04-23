$files = @("about.html", "contact.html", "index.html", "login.html", "password-forgot.html", "produkte.html")
foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Encoding UTF8 -Raw
        $c = $c -replace '🍔 Burger Empire', 'Burger Empire'
        $c = $c -replace 'ðŸ\x94\x94 Burger Empire', 'Burger Empire'
        Set-Content -Path $f -Value $c -Encoding UTF8
    }
}
