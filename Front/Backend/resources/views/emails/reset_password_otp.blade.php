<!DOCTYPE html>
<html>
<head>
    <title>Reset Password SIKOS</title>
</head>
<body>
    <h2>Halo, {{ $userName }}!</h2>
    <p>Kami menerima permintaan untuk mereset password akun SIKOS Anda.</p>
    <p>Berikut adalah kode OTP untuk mereset password Anda:</p>
    <h1 style="color: #412D15; letter-spacing: 2px;">{{ $otp }}</h1>
    <p>Kode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapa pun jika Anda tidak merasa melakukan permintaan ini.</p>
    <p>Salam hangat,<br>Kost Pak RT</p>
</body>
</html>
