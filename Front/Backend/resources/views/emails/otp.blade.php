<!DOCTYPE html>
<html>
<head>
    <title>Verifikasi Akun SIKOS</title>
</head>
<body>
    <h2>Halo, {{ $userName }}!</h2>
    <p>Terima kasih telah mendaftar di SIKOS (Sistem Informasi Kost).</p>
    <p>Berikut adalah kode OTP verifikasi akun Anda:</p>
    <h1 style="color: #412D15; letter-spacing: 2px;">{{ $otp }}</h1>
    <p>Kode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun.</p>
    <p>Salam hangat,<br>Kost Pak RT</p>
</body>
</html>
