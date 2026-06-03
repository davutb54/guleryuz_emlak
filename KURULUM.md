# Güleryüz Gayrimenkul — Kurulum ve Yayın Rehberi

> **Hedef:** Projeyi müşterinin bilgisayarında çalıştırmak, Cloudflare Tunnel ile domain üzerinden yayınlamak.

---

## 0. GitHub'a Atmadan Önce (Geliştirici Bilgisayarında)

### 0.1 seed-test.ts Dosyasını Sil

Bu dosya sahte test verisi içeriyor, production'da kullanılmayacak:

```bash
# Projenin kök dizininde:
rm prisma/seed-test.ts
```

### 0.2 .gitignore Kontrolü

Bu satırların `.gitignore`'da olduğunu doğrula:

```
.env
prisma/dev.db
prisma/prod.db
public/uploads/
src/generated/
node_modules/
.next/
```

### 0.3 Son Kez Push Et

```bash
git add .
git commit -m "production hazırlığı - seed-test silindi"
git push
```

---

## 1. Müşteri Bilgisayarı Hazırlığı (Windows 10/11)

### 1.1 Node.js 22 Kurulumu

1. [nodejs.org/en/download](https://nodejs.org/en/download) adresine git
2. **Windows Installer (.msi)** → **LTS (22.x)** indir
3. Kurulum sihirbazını çalıştır (hepsi Next ile devam et)
4. Doğrula — Windows Terminal veya PowerShell aç:

```powershell
node --version   # v22.x.x çıkmalı
npm --version    # 10.x.x çıkmalı
```

### 1.2 Git Kurulumu

1. [git-scm.com/download/win](https://git-scm.com/download/win) → indir ve kur
2. Doğrula:

```powershell
git --version    # git version 2.x.x çıkmalı
```

### 1.3 PM2 Kurulumu (Arka Planda Çalışması İçin)

```powershell
npm install -g pm2
npm install -g pm2-windows-startup
```

### 1.4 OpenSSH Sunucusu Kurulumu (Uzaktan Erişim İçin)

Bu adım sayesinde Cloudflare Tunnel üzerinden bilgisayara SSH ile bağlanabilirsin.

**Ayarlar → Uygulamalar → İsteğe Bağlı Özellikler** yolunu izleyebilir ya da PowerShell ile kurabilirsin:

```powershell
# Yönetici olarak PowerShell aç (sağ tık → Yönetici olarak çalıştır)

# OpenSSH Server kurulu mu kontrol et
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'

# Kurulu değilse kur
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Servisi başlat
Start-Service sshd

# Bilgisayar açılışında otomatik başlasın
Set-Service -Name sshd -StartupType Automatic

# Firewall kuralı (genelde otomatik eklenir, yoksa elle ekle)
New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' `
  -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

Çalışıyor mu kontrol et:
```powershell
Get-Service sshd
# Status: Running çıkmalı
```

> **Not:** Cloudflare Tunnel üzerinden bağlanacağımız için 22 portunu dışarıya açmaya gerek yok.
> Tunnel şifrelenmiş tünel içinden geçer, internete port açık olmaz.

---

## 2. Projeyi Çekme

Müşteri bilgisayarında terminal aç (Windows Terminal veya PowerShell):

```powershell
# Projeyi nereye koymak istiyorsanız oraya gidin
# Örneğin:
cd C:\

# Projeyi indir
git clone https://github.com/KULLANICI_ADI/guleryuz-gayrimenkul.git guleryuz

# Klasöre gir
cd C:\guleryuz
```

> **Private repo ise:** GitHub Personal Access Token gerekir.
> Token alma: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → `repo` işaretle → kopyala
>
> ```powershell
> git clone https://TOKEN@github.com/KULLANICI_ADI/guleryuz-gayrimenkul.git guleryuz
> ```

---

## 3. .env Dosyası Oluşturma

`C:\guleryuz` klasörünün içinde `.env` adında yeni bir dosya oluştur (Notepad veya VS Code ile):

```
C:\guleryuz\.env
```

Aşağıdaki içeriği yapıştır ve **her satırı doldur**:

```bash
# ─── VERİTABANI ───────────────────────────────────────────────────────────────
# Production veritabanı dosya yolu (dev.db değil, prod.db kullanıyoruz)
DATABASE_URL="file:./prisma/prod.db"

# ─── AUTH.JS ──────────────────────────────────────────────────────────────────
# Oturum şifreleme anahtarı — MUTLAKA değiştir, asla paylaşma
# Nasıl üretilir: PowerShell'de şu komutu çalıştır:
#   [System.Web.Security.Membership]::GeneratePassword(48, 12)
# veya herhangi bir güçlü rastgele string (en az 32 karakter)
AUTH_SECRET="BURAYA_EN_AZ_32_KARAKTERLIK_RASTGELE_YAZI"

# Domain hazır olduğunda https:// ile güncelle
AUTH_URL="https://guleryuzgayrimenkul.com"
AUTH_TRUST_HOST="true"

# ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
# console.cloud.google.com'dan alınır (aşağıda Google OAuth kurulum adımları var)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ─── SİTE URL ─────────────────────────────────────────────────────────────────
# Open Graph, sitemap ve email linkleri için kullanılır
# Domain aktif olduğunda https:// ile güncelle
NEXT_PUBLIC_BASE_URL="https://guleryuzgayrimenkul.com"

# ─── EMAIL (RESEND) ───────────────────────────────────────────────────────────
# resend.com'dan ücretsiz hesap aç, API key al
# Boş bırakırsan email bildirimleri çalışmaz ama site çalışmaya devam eder
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@guleryuzgayrimenkul.com"

# ─── İLK ADMİN HESABI ────────────────────────────────────────────────────────
# Sadece ilk kurulumda kullanılır (npm run db:seed komutu için)
# Seed sonrası bu şifreyi admin panelinden değiştir!
SEED_ADMIN_EMAIL="admin@guleryuzgayrimenkul.com"
SEED_ADMIN_PASSWORD="IlkKurulumSifresi2026!"
SEED_ADMIN_NAME="Güleryüz Yönetici"
```

### AUTH_SECRET Üretme (PowerShell'de):

```powershell
# Bu komut güçlü bir rastgele string üretir:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

Çıktıyı kopyalayıp `AUTH_SECRET=` değerine yapıştır.

---

## 4. Paketleri Kur ve Veritabanını Oluştur

```powershell
cd C:\guleryuz

# Paketleri kur (birkaç dakika sürer)
npm ci

# Prisma client üret
npx prisma generate

# Veritabanı tablolarını oluştur (prod.db dosyası otomatik oluşturulur)
npx prisma migrate deploy

# İlk admin kullanıcısını oluştur
npm run db:seed
```

Seed başarılıysa şöyle bir çıktı göreceksin:
```
✅ Admin: admin@guleryuzgayrimenkul.com
✅ SiteSettings kaydedildi
```

---

## 5. Production Build ve PM2

```powershell
cd C:\guleryuz

# Production build al (5-10 dakika sürebilir)
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js

# Durum kontrolü
pm2 status
# "guleryuz" satırında "online" yazıyorsa tamam

# Logları gör
pm2 logs guleryuz --lines 30
```

Çalışıyor mu test et — tarayıcıda aç:
```
http://localhost:3000
```

Site açılıyorsa sonraki adıma geç.

### 5.1 Bilgisayar Açılışında Otomatik Başlama

```powershell
# PM2 listesini kaydet
pm2 save

# Windows startup kaydı ekle
pm2-startup install
```

---

## 6. Cloudflare Tunnel Kurulumu

Cloudflare Tunnel sayesinde:
- Statik IP gerekmez
- Port açmaya gerek yok
- Ücretsiz SSL otomatik gelir
- Domain, müşterinin bilgisayarına yönlenir

### 6.1 Domain'i Cloudflare'e Taşı

1. [cloudflare.com](https://cloudflare.com) → ücretsiz hesap aç (veya giriş yap)
2. **Add a Site** → domain adını yaz (örn. `guleryuzgayrimenkul.com`) → **Add Site**
3. Plan seç: **Free** (yeterli)
4. Cloudflare mevcut DNS kayıtlarını otomatik tarar → **Continue**
5. Sana iki nameserver adresi verir, örneğin:
   ```
   ava.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
6. Domain sağlayıcısına git (Natro, İsimtescil, vb.) → Domain ayarları → **Nameserver** bölümünü bul → Cloudflare'in verdiği iki nameserver'ı gir → Kaydet
7. Cloudflare panelinde **Done, check nameservers** → birkaç dakika - 24 saat içinde aktif olur
8. Cloudflare sana "Great news! Cloudflare is now protecting your site" maili atar

### 6.2 cloudflared Kurulumu (Windows)

1. [developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) adresine git
2. **Windows** → **64-bit** → `.msi` dosyasını indir
3. Kur (standart kurulum)
4. Doğrula:

```powershell
cloudflared --version
```

### 6.3 Cloudflare Hesabına Giriş

```powershell
cloudflared tunnel login
```

Tarayıcı açılır → Cloudflare hesabına giriş yap → Domain'i seç → **Authorize**

Terminal'de `Cert.pem saved` mesajını görürsen başarılı.

### 6.4 Tunnel Oluştur

```powershell
# Tunnel ismi: guleryuz (istediğin bir isim)
cloudflared tunnel create guleryuz
```

Çıktıda bir **Tunnel ID** (UUID) göreceksin. Kaydet:
```
Created tunnel guleryuz with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 6.5 Tunnel Yapılandırma Dosyası

`C:\Users\KULLANICI_ADI\.cloudflared\` klasöründe `config.yml` dosyası oluştur:

```yaml
tunnel: TUNNEL_ID_BURAYA
credentials-file: C:\Users\KULLANICI_ADI\.cloudflared\TUNNEL_ID_BURAYA.json

ingress:
  - hostname: guleryuzgayrimenkul.com
    service: http://localhost:3000
  - hostname: www.guleryuzgayrimenkul.com
    service: http://localhost:3000
  - hostname: ssh.guleryuzgayrimenkul.com
    service: ssh://localhost:22
  - service: http_status:404
```

> `TUNNEL_ID_BURAYA` ve `KULLANICI_ADI` kısmını gerçek değerlerle değiştir.
>
> `ssh.guleryuzgayrimenkul.com` alt domaini dışarıdan görünmez, sadece
> Cloudflare Access üzerinden yetkili kullanıcılar erişebilir.

### 6.6 DNS Kaydı Ekle

```powershell
# Ana domain
cloudflared tunnel route dns guleryuz guleryuzgayrimenkul.com

# www subdomain
cloudflared tunnel route dns guleryuz www.guleryuzgayrimenkul.com

# SSH alt domaini
cloudflared tunnel route dns guleryuz ssh.guleryuzgayrimenkul.com
```

### 6.7 Tunnel'ı Windows Service Olarak Kur

```powershell
# Windows Service olarak kur (bilgisayar açılışında otomatik başlar)
cloudflared service install

# Servisi başlat
Start-Service cloudflared
```

Kontrol:
```powershell
Get-Service cloudflared
# Status: Running çıkmalı
```

### 6.8 Test

Tarayıcıda aç:
```
https://guleryuzgayrimenkul.com
```

Site açılıyor ve SSL simgesi (kilit) görünüyorsa kurulum tamamdır.

---

## 6B. Cloudflare SSH Erişimi Kurulumu (Uzaktan Bağlantı)

Bu adımlar sayesinde dünyanın herhangi bir yerinden müşterinin bilgisayarına
`ssh.guleryuzgayrimenkul.com` üzerinden bağlanabilirsin. Cloudflare üzerinden
geçtiği için müşteri bilgisayarında port açmaya gerek yok.

### 6B.1 Cloudflare Access Uygulaması Oluştur (Güvenlik İçin Zorunlu)

1. [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → Cloudflare hesabınla giriş yap
2. Sol menü → **Access** → **Applications** → **Add an application**
3. **Self-hosted** seç
4. Doldur:
   - Application name: `Guleryuz SSH`
   - Session Duration: `24 hours`
   - Application domain: `ssh.guleryuzgayrimenkul.com`
5. **Next** → **Policy** sekmesi:
   - Policy name: `Sadece Geliştirici`
   - Action: **Allow**
   - Rule: **Emails** → kendi e-posta adresini yaz (örn. `seninadresin@gmail.com`)
6. **Next** → **Next** → **Add application**

Bu ayar sayesinde `ssh.guleryuzgayrimenkul.com`'a yalnızca senin e-postan ile
giriş yapılabilir. Cloudflare her bağlantıda e-posta doğrulaması ister.

### 6B.2 Geliştirici Bilgisayarına cloudflared Kur

Kendi bilgisayarında da cloudflared kurulu olmalı (kurulum 6.2 ile aynı):

- Windows: `.msi` indir ve kur
- macOS: `brew install cloudflare/cloudflare/cloudflared`
- Linux: `curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared.deb`

### 6B.3 SSH Config Dosyasını Güncelle (Geliştirici Bilgisayarında)

`C:\Users\SENIN_KULLANICI_ADIN\.ssh\config` dosyasına şunu ekle
(dosya yoksa oluştur):

```
Host guleryuz-ssh
    HostName ssh.guleryuzgayrimenkul.com
    User MUSTERI_BILGISAYARI_KULLANICI_ADI
    ProxyCommand cloudflared access ssh --hostname %h
```

> `MUSTERI_BILGISAYARI_KULLANICI_ADI` = müşterinin Windows kullanıcı adı.
> Öğrenmek için müşteri bilgisayarında: `echo $env:USERNAME`

### 6B.4 İlk Bağlantı

```powershell
# Geliştirici bilgisayarından:
ssh guleryuz-ssh
```

İlk bağlantıda tarayıcı açılır → Cloudflare Access sayfasına gider →
kendi e-postanı gir → doğrulama kodu gelir → onayla → SSH bağlantısı kurulur.

Bağlandıktan sonra müşterinin bilgisayarında PowerShell oturumu açılır.
Oradan `guncelle.ps1` çalıştırabilir, logları görebilir, her şeyi yapabilirsin.

### 6B.5 SSH ile Güncelleme Yapmak

```powershell
# Geliştirici bilgisayarından bağlan:
ssh guleryuz-ssh

# Bağlandıktan sonra müşteri bilgisayarında:
C:\guleryuz\guncelle.ps1
```

### 6B.6 Sorun: "Permission denied" Hatası

Windows SSH varsayılan olarak şifre ile giriş kabul eder, ama ilk bağlantıda
hata alabilirsin. Müşteri bilgisayarında şu komutu çalıştır:

```powershell
# Yönetici PowerShell ile:

# Şifre ile giriş izni ver
$sshdConfig = "C:\ProgramData\ssh\sshd_config"
(Get-Content $sshdConfig) -replace '#PasswordAuthentication yes', 'PasswordAuthentication yes' |
  Set-Content $sshdConfig

# SSH servisini yeniden başlat
Restart-Service sshd
```

Artık `ssh guleryuz-ssh` dediğinde müşteri bilgisayarının Windows şifresini ister.

### 6B.7 Daha Güvenli: SSH Anahtar Çifti (Şifresiz Giriş)

```powershell
# Geliştirici bilgisayarında anahtar üret (daha önce üretmediysen):
ssh-keygen -t ed25519 -C "guleryuz-deploy"
# Dosya konumu: C:\Users\SENIN_ADIN\.ssh\id_ed25519
# Şifre: boş bırakabilirsin (Enter)

# Public anahtarı kopyala:
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
# Çıktıyı kopyala
```

```powershell
# Müşteri bilgisayarında (SSH bağlantısında ya da orada oturarak):
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
# Kopyaladığın public key'i buraya yapıştır:
Add-Content "$env:USERPROFILE\.ssh\authorized_keys" "ssh-ed25519 AAAA... guleryuz-deploy"
```

Artık şifre sormadan otomatik bağlanırsın.

---

## 7. Google OAuth Kurulumu

### 7.1 Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com) → giriş yap
2. **Proje seç** → **Yeni proje** → isim: `Guleryuz Gayrimenkul` → Oluştur
3. Sol menü → **API'ler ve Hizmetler** → **OAuth onay ekranı**
   - Kullanıcı türü: **Harici** → Oluştur
   - Uygulama adı: `Güleryüz Gayrimenkul`
   - Kullanıcı destek e-postası: emlakçının Gmail adresi
   - Geliştirici e-posta: aynı
   - **Kaydet ve devam et** → hepsinde → Panoya dön
4. **Kimlik bilgileri** → **Kimlik bilgileri oluştur** → **OAuth 2.0 İstemci Kimliği**
   - Uygulama türü: **Web uygulaması**
   - Ad: `Guleryuz Web`
   - **Yetkili JavaScript kaynakları**: `https://guleryuzgayrimenkul.com`
   - **Yetkili yönlendirme URI'leri**:
     ```
     https://guleryuzgayrimenkul.com/api/auth/callback/google
     ```
   - **Oluştur**
5. Çıkan **İstemci Kimliği** (Client ID) ve **İstemci Sırrı** (Client Secret) değerlerini kopyala

### 7.2 .env Güncelle

`.env` dosyasında bu iki satırı doldur:

```bash
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

### 7.3 Build'i Yeniden Al

```powershell
cd C:\guleryuz
npm run build
pm2 restart guleryuz
```

---

## 8. İlk Giriş ve Admin Kurulumu

1. `https://guleryuzgayrimenkul.com/tr/giris` adresine git
2. Giriş bilgileri (seed'de ne yazdıysan):
   - **E-posta:** `admin@guleryuzgayrimenkul.com`
   - **Şifre:** `.env`'de `SEED_ADMIN_PASSWORD` ne yazdıysan
3. Admin paneline git: `/tr/admin`
4. **2FA Zorunlu:** Google Authenticator'ı telefona indir → `/tr/admin/2fa-kurulum` sayfasında QR kodu tara
5. **Site Ayarları** (`/tr/admin/ayarlar`) → telefon, adres, çalışma saatleri, sosyal medya linklerini doldur
6. **Profil** → şifreyi güvenli bir şifre ile değiştir

---

## 9. Uzaktan Güncelleme

Geliştirici olarak yeni özellik ekleyip GitHub'a push ettiğinde müşteri bilgisayarında güncellemek için:

### 9.1 Güncelleme Script'i Oluştur

`C:\guleryuz\guncelle.ps1` dosyasını oluştur:

```powershell
# Güleryüz - Güncelleme Script'i
Write-Host "Güncelleme başlıyor..." -ForegroundColor Yellow

Set-Location C:\guleryuz

# 1. GitHub'dan son kodu çek
Write-Host "Kod çekiliyor..." -ForegroundColor Cyan
git pull origin main

# 2. Yeni paketleri kur
Write-Host "Paketler güncelleniyor..." -ForegroundColor Cyan
npm ci

# 3. Yeni migration varsa uygula
Write-Host "Veritabanı güncelleniyor..." -ForegroundColor Cyan
npx prisma migrate deploy

# 4. Yeniden build al
Write-Host "Build alınıyor (5-10 dakika)..." -ForegroundColor Cyan
npm run build

# 5. PM2'yi yeniden başlat
Write-Host "Uygulama yeniden başlatılıyor..." -ForegroundColor Cyan
pm2 restart guleryuz

Write-Host "✅ Güncelleme tamamlandı!" -ForegroundColor Green
pm2 status
```

### 9.2 Güncelleme Nasıl Yapılır?

**Seçenek A — Cloudflare SSH ile Uzaktan (Önerilir):**
```powershell
# Kendi bilgisayarından bağlan:
ssh guleryuz-ssh

# Müşteri bilgisayarında otomatik giriş → güncelle:
C:\guleryuz\guncelle.ps1
```

**Seçenek B — Tek Satırda Uzaktan Güncelleme:**
```powershell
# Bağlanıp script'i tek komutla çalıştır:
ssh guleryuz-ssh "powershell -File C:\guleryuz\guncelle.ps1"
```

**Seçenek C — Müşteri Kendisi Çalıştırır:**
Masaüstüne `guncelle.ps1` için kısayol oluştur. Seni aradığında "çalıştır" diyebilirsin.

---

## 10. Yedekleme

`C:\guleryuz\yedekle.ps1` dosyasını oluştur:

```powershell
# Güleryüz - Yedekleme Script'i
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "C:\guleryuz-yedek"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Veritabanı yedeği
Copy-Item "C:\guleryuz\prisma\prod.db" "$backupDir\prod_$date.db"

# Fotoğraflar yedeği
Compress-Archive -Path "C:\guleryuz\public\uploads\*" -DestinationPath "$backupDir\uploads_$date.zip" -Force

Write-Host "✅ Yedek tamamlandı: $backupDir" -ForegroundColor Green

# 30 günden eski yedekleri sil
Get-ChildItem $backupDir -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
```

**Otomatik Günlük Yedekleme (Task Scheduler):**

```powershell
# Her gece 02:00'de çalıştır
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\guleryuz\yedekle.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
Register-ScheduledTask -TaskName "GuleryuzYedek" -Action $action -Trigger $trigger -RunLevel Highest
```

---

## 11. Sık Kullanılan Komutlar

```powershell
# Uygulamanın durumuna bak
pm2 status

# Canlı logları izle
pm2 logs guleryuz

# Uygulamayı yeniden başlat
pm2 restart guleryuz

# Uygulamayı durdur
pm2 stop guleryuz

# Uygulamayı başlat
pm2 start guleryuz

# Cloudflare Tunnel durumu
Get-Service cloudflared

# Cloudflare Tunnel yeniden başlat
Restart-Service cloudflared
```

---

## 12. Sorun Giderme

### Site açılmıyor

```powershell
# PM2 çalışıyor mu?
pm2 status
# "online" değilse:
pm2 start ecosystem.config.js

# Cloudflare Tunnel çalışıyor mu?
Get-Service cloudflared
# "Running" değilse:
Start-Service cloudflared

# Logları kontrol et
pm2 logs guleryuz --lines 50
```

### Build hatası

```powershell
# .env dosyası doğru mu?
Get-Content C:\guleryuz\.env

# node_modules'ü sil ve yeniden kur
Remove-Item -Recurse -Force node_modules
npm ci
npm run build
```

### Cloudflare Tunnel bağlanamıyor

```powershell
# config.yml'deki TUNNEL_ID doğru mu?
Get-Content "$env:USERPROFILE\.cloudflared\config.yml"

# Tunnel listesi
cloudflared tunnel list

# Manuel test
cloudflared tunnel run guleryuz
# Hata mesajı görünüyorsa sorun config'de
```

### SSH bağlanamıyor

```powershell
# Geliştirici bilgisayarından:

# cloudflared sürümünü kontrol et
cloudflared --version

# Bağlantıyı verbose modda dene (hata nedenini gösterir)
ssh -v guleryuz-ssh

# Cloudflare Access token'ı sıfırla
cloudflared access login https://ssh.guleryuzgayrimenkul.com
```

```powershell
# Müşteri bilgisayarında (orada oturarak ya da ilk kurulumda):

# sshd çalışıyor mu?
Get-Service sshd

# Çalışmıyorsa başlat
Start-Service sshd

# Port 22 dinleniyor mu?
netstat -an | Select-String ":22 "

# Windows Firewall engelliyor mu?
Get-NetFirewallRule -Name '*ssh*' | Select-Object Name, Enabled, Direction
```

### Veritabanı hatası

```powershell
# prod.db var mı?
Test-Path C:\guleryuz\prisma\prod.db

# Yoksa migration yeniden uygula
cd C:\guleryuz
npx prisma migrate deploy
npm run db:seed
```

---

## 13. Kurulum Kontrol Listesi

### Geliştirici Bilgisayarında (GitHub'a Atmadan Önce)
- [ ] `prisma/seed-test.ts` silindi
- [ ] `.gitignore` kontrol edildi
- [ ] GitHub'a push edildi

### Müşteri Bilgisayarında
- [ ] Node.js 22 kuruldu
- [ ] Git kuruldu
- [ ] PM2 + pm2-windows-startup kuruldu
- [ ] Proje `git clone` ile indirildi
- [ ] `.env` dosyası oluşturuldu ve dolduruldu
- [ ] `npm ci` çalıştırıldı
- [ ] `npx prisma migrate deploy` çalıştırıldı
- [ ] `npm run db:seed` çalıştırıldı
- [ ] `npm run build` çalıştırıldı
- [ ] `pm2 start ecosystem.config.js` çalıştırıldı
- [ ] `localhost:3000` çalışıyor
- [ ] `pm2 save` + `pm2-startup install` çalıştırıldı

### Müşteri Bilgisayarı — SSH
- [ ] OpenSSH Server kuruldu (`Add-WindowsCapability`)
- [ ] `sshd` servisi başlatıldı ve Automatic yapıldı
- [ ] Firewall kuralı eklendi (port 22)

### Cloudflare — Site
- [ ] Domain Cloudflare'e taşındı (nameserver değiştirildi)
- [ ] cloudflared kuruldu
- [ ] `cloudflared tunnel login` yapıldı
- [ ] Tunnel oluşturuldu
- [ ] `config.yml` yapılandırıldı (site + SSH ingress ikisi de var)
- [ ] DNS kayıtları eklendi (domain, www, ssh üçü de)
- [ ] `cloudflared service install` + `Start-Service cloudflared` çalıştırıldı
- [ ] `https://guleryuzgayrimenkul.com` açılıyor

### Cloudflare — SSH Erişimi
- [ ] Cloudflare Access uygulaması oluşturuldu (`ssh.guleryuzgayrimenkul.com`)
- [ ] Policy'ye geliştirici e-postası eklendi
- [ ] Geliştirici bilgisayarına cloudflared kuruldu
- [ ] `.ssh\config` dosyasına `guleryuz-ssh` host eklendi
- [ ] `ssh guleryuz-ssh` ile bağlantı test edildi
- [ ] SSH anahtar çifti kuruldu (şifresiz giriş)

### Google OAuth
- [ ] Google Cloud projesi oluşturuldu
- [ ] OAuth 2.0 Client ID alındı
- [ ] `.env`'e `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` eklendi
- [ ] Authorized redirect URI eklendi
- [ ] `npm run build` + `pm2 restart guleryuz` yapıldı

### Son Kontroller
- [ ] Admin girişi çalışıyor
- [ ] 2FA kuruldu
- [ ] Site ayarları dolduruldu
- [ ] Yedekleme script'i ve Task Scheduler kuruldu
- [ ] `guncelle.ps1` test edildi
