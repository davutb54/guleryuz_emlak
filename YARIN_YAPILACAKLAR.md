# Emlakçı Ziyareti - Yapılacaklar Listesi

Bu belge, yeni yapılan veritabanı değişikliklerini canlıya almak ve şifresi olmayan Windows bilgisayarına güvenli uzaktan bağlantı (SSH) kurmak için izlenecek adımları içerir.

## 1. Veritabanı ve Kod Güncellemesi

Emlakçının bilgisayarına gittiğinde mevcut sistemi güncellemek için aşağıdaki komutları çalıştırman yeterlidir. Prisma, `migrate deploy` komutu ile yeni tabloları veya sütunları veritabanına sorunsuz şekilde ekleyecektir.

Eğer daha önceden `guncelle.ps1` scriptini oluşturduysan doğrudan onu çalıştırabilirsin. Yoksa aşağıdaki adımları manuel yapabilirsin:

1. **PowerShell**'i aç ve projenin dizinine git:
   ```powershell
   cd C:\guleryuz
   ```

2. Yeni kodları GitHub'dan çek:
   ```powershell
   git pull origin main
   ```

3. Gerekli paketleri kur:
   ```powershell
   npm ci
   ```

4. **Veritabanını Güncelle:** (En önemli adım, yaptığın şema değişikliklerini SQLite'a uygular)
   ```powershell
   npx prisma migrate deploy
   ```

5. Yeni kodlarla build al ve sistemi yeniden başlat:
   ```powershell
   npm run build
   pm2 restart guleryuz
   ```

## 2. Şifresiz Bilgisayara Uzaktan Erişim (SSH) Kurulumu

Hesap adı **MAKRO GAYRİMENKUL** (boşluklu + Türkçe karakter), şifre yok.
Windows SSH şifreyle giriş yapamayacağımız için **SSH Anahtarı** kullanmak ZORUNLUDUR.

---

### Adım 2.0: Gitmeden Önce — Kendi Bilgisayarında Anahtar Üret

Emlakçıya gitmeden kendi bilgisayarında bir kez yap:

```powershell
ssh-keygen -t ed25519 -C "davut-guleryuz"
```
*(Sorulan her soruya Enter bas, passphrase istemez)*

Üretilen public key'i görüntüle ve kendine WhatsApp/mail ile gönder ya da USB'ye kopyala:
```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```
Bu uzun satırın tamamı lazım olacak (ssh-ed25519 ile başlar).

---

### Adım 2.1: Emlakçının Bilgisayarında — OpenSSH Kur

Emlakçının bilgisayarında **Yönetici yetkili PowerShell** aç
*(Başlat → PowerShell → Sağ tık → Yönetici olarak çalıştır)*

```powershell
# OpenSSH Server kur (zaten kuruluysa hata vermez, sorun değil)
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Servisi başlat ve Windows açılışında otomatik çalışsın
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

---

### Adım 2.2: Hesabın Admin mi Değil mi? — Kontrol Et

Aynı Yönetici PowerShell'de şunu çalıştır:

```powershell
net localgroup Administrators | findstr /i "MAKRO"
```

- Çıktıda `MAKRO GAYRİMENKUL` **görünüyorsa** → **Admin hesap** → Adım 2.3-A'ya git
- Çıktı **boşsa** → **Normal hesap** → Adım 2.3-B'ye git

---

### Adım 2.3-A: Admin Hesap İçin Anahtar Kurulumu

Windows SSH, admin hesaplar için `.ssh` klasörünü değil merkezi bir dosyayı kullanır.

**Yönetici yetkili PowerShell'de** devam et:

```powershell
# Merkezi SSH klasörü yoksa oluştur
New-Item -ItemType Directory -Force "C:\ProgramData\ssh"

# Dosyayı notepad ile aç (yoksa oluşturur)
notepad "C:\ProgramData\ssh\administrators_authorized_keys"
```

Açılan Not Defteri'ne kendi bilgisayarından aldığın **public key satırını** yapıştır, kaydet ve kapat.

```powershell
# Dosya izinlerini ayarla (bu adım olmadan SSH kabul etmez)
icacls.exe "C:\ProgramData\ssh\administrators_authorized_keys" /inheritance:r
icacls.exe "C:\ProgramData\ssh\administrators_authorized_keys" /grant "SYSTEM:F"
icacls.exe "C:\ProgramData\ssh\administrators_authorized_keys" /grant "BUILTIN\Administrators:F"

# SSH servisini yeniden başlat
Restart-Service sshd
```

Kurulum bitti → **Adım 2.4'e geç**

---

### Adım 2.3-B: Normal Hesap İçin Anahtar Kurulumu

**Normal PowerShell** aç (Yönetici değil, MAKRO GAYRİMENKUL hesabıyla açık olan):

```powershell
# .ssh klasörü oluştur
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"

# Dosyayı notepad ile aç
notepad "$env:USERPROFILE\.ssh\authorized_keys"
```

Açılan Not Defteri'ne public key satırını yapıştır, kaydet ve kapat.

```powershell
# Dosya izinlerini ayarla
icacls.exe "$env:USERPROFILE\.ssh\authorized_keys" /inheritance:r
icacls.exe "$env:USERPROFILE\.ssh\authorized_keys" /grant "$env:USERNAME`:F"
icacls.exe "$env:USERPROFILE\.ssh\authorized_keys" /grant "SYSTEM:F"
```

Şimdi **Yönetici PowerShell**'e geç ve servisi yeniden başlat:
```powershell
Restart-Service sshd
```

Kurulum bitti → **Adım 2.4'e geç**

---

### Adım 2.4: Kendi Bilgisayarında SSH Config Güncelle

Kendi bilgisayarında `C:\Users\davutb54\.ssh\config` dosyasını notepad ile aç
*(dosya yoksa oluştur)*:

```powershell
notepad "$env:USERPROFILE\.ssh\config"
```

Şunu ekle — `User` satırında Türkçe karakter ve boşluğu olduğu gibi yaz:

```text
Host guleryuz-ssh
    HostName ssh.guleryuzgayrimenkul.com
    User MAKRO GAYRİMENKUL
    ProxyCommand cloudflared access ssh --hostname %h
    ServerAliveInterval 60
```

Dosyayı **UTF-8 olarak kaydet**: Dosya → Farklı Kaydet → Kodlama: UTF-8 → Kaydet.

---

### Adım 2.5: Cloudflare Tunnel Ayarı (Emlakçı Bilgisayarında)

Emlakçının bilgisayarındaki `cloudflared` config dosyasına SSH satırı eklenmiş olmalı.
Config dosyası genellikle `C:\Users\MAKRO GAYRİMENKUL\.cloudflared\config.yml` yolunda bulunur:

```yaml
tunnel: TUNNEL_ID
credentials-file: C:\Users\MAKRO GAYRİMENKUL\.cloudflared\TUNNEL_ID.json

ingress:
  - hostname: guleryuzgayrimenkul.com
    service: http://localhost:3000
  - hostname: www.guleryuzgayrimenkul.com
    service: http://localhost:3000
  - hostname: ssh.guleryuzgayrimenkul.com   # ← bu satır ekli değilse ekle
    service: ssh://localhost:22
  - service: http_status:404
```

Satırı ekledikten sonra cloudflared'ı yeniden başlat:
```powershell
Restart-Service cloudflared
# veya cloudflared servis değil görev çubuğundaysa:
# cloudflared tunnel run
```

---

### Adım 2.6: Test Et

Kendi bilgisayarına dön, PowerShell aç:

```powershell
ssh guleryuz-ssh
```

- Tarayıcıda Cloudflare onay sayfası açılırsa → e-postana gelen kodu gir
- `PS C:\Users\MAKRO GAYRİMENKUL>` gibi bir prompt görürsen → **bağlantı başarılı!**

**Bağlanamazsan kontrol listesi:**
```powershell
# Emlakçı bilgisayarında SSH portunu dinliyor mu?
netstat -an | findstr ":22"

# Firewall SSH'e izin veriyor mu?
Get-NetFirewallRule -Name *OpenSSH* | Select Name, Enabled, Direction
# Enabled=False görürsen:
New-NetFirewallRule -Name "OpenSSH-Server" -DisplayName "OpenSSH Server" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

## 3. İleride Bağlanma ve Tam Erişim

SSH (Secure Shell) ile bağlandığınızda emlakçının bilgisayarına **"Tam Yetkili Komut Satırı Erişimi"** sağlamış olursunuz. 

### "Tam Erişim" Ne Demek?
- **Evet, tam erişiminiz olur:** Emlakçının bilgisayarında sanki klavyesinin başındaymışsınız gibi her türlü **komutu** çalıştırabilirsiniz.
- Dosya silebilir, oluşturabilir, projenizi güncelleyebilir, yedek alabilir ve servisleri (PM2 vb.) yeniden başlatabilirsiniz.
- Sadece AnyDesk veya TeamViewer gibi **görsel bir ekran (fare ile yönetilen masaüstü)** görmezsiniz. Siyah bir terminal (PowerShell) ekranı üzerinden her şeyi kontrol edersiniz. Yazılımsal güncellemeler ve yönetim için bu fazlasıyla yeterlidir.

### Formattan Sonra veya Yeni Bilgisayarda Bağlanma Adımları
Eğer kendi bilgisayarınıza format atarsanız, bağlantıyı yeniden kurmak sadece birkaç dakikanızı alır:

1. Format atmadan önce kendi bilgisayarınızdaki `.ssh` klasörünüzün tamamını (içindeki `id_ed25519` ve `config` dahil) mutlaka **USB belleğe yedekleyin**.
2. Formattan sonra bu klasörü yeni bilgisayarınızda aynı yere (`C:\Users\KendiKullaniciAdiniz\.ssh`) geri koyun.
3. Kendi bilgisayarınıza **Cloudflared** uygulamasını (Windows sürümünü indirip Next diyerek) kurun.
4. PowerShell'i açıp sadece şu komutu yazın:
   ```powershell
   ssh guleryuz-ssh
   ```
5. Enter'a bastığınızda tarayıcınızda Cloudflare güvenlik ekranı açılacaktır. Kendi e-posta adresinize gelen pini girdiğiniz an bağlantı onaylanır. Terminalinize döndüğünüzde emlakçının bilgisayarına giriş yapmış olursunuz. Artık dilediğiniz işlemi yapabilirsiniz.

## 4. Fotoğraf Yükleme İyileştirmeleri — Sunucuya Deploy

Kodda şu değişiklikler yapıldı, sunucuya uygulanması gerekiyor:

- **Rate limit** artırıldı: 30 → 200 yükleme/saat (eski limitde birden fazla fotoğraf yükleyince takılıyordu)
- **Dosya boyutu limiti** artırıldı: 10 MB → 50 MB (büyük fotoğraflar reddediliyordu, kullanıcıya net hata gösterilmiyordu)
- **Cloudinary entegrasyonu** eklendi: isteğe bağlı, `.env`'de yoksa eski yerel depolama devam eder

### Sunucuya Deploy Adımları

```powershell
cd C:\guleryuz
git pull origin main
npm ci
npm run build
pm2 restart guleryuz
```

### Cloudinary Kurulumu (İsteğe Bağlı — Ücretsiz)

Cloudinary'nin ücretsiz planı var: **25 GB depolama, kart bilgisi istemez.**
1000 fotoğrafta bile (foto başı ~1 MB) yalnızca 1 GB kullanılır. Ücretli plana geçmek **şart değil**.

Faydalı olduğu durumlar: sunucu değişikliğinde/format atılınca fotoğraflar kaybolmaz, CDN ile hızlı yüklenir.

1. [cloudinary.com](https://cloudinary.com) → Sign Up (ücretsiz)
2. Dashboard → **Settings → Access Keys** bölümünden bilgileri al
3. Sunucudaki `.env` dosyasına ekle:
   ```env
   CLOUDINARY_CLOUD_NAME="cloud_adin"
   CLOUDINARY_API_KEY="1234567890"
   CLOUDINARY_API_SECRET="abc123..."
   ```
4. `pm2 restart guleryuz` — hepsi bu kadar, kod zaten hazır

---

## 5. Facebook ile Giriş Kurulumu

Sisteme Facebook ile giriş özelliği eklenmiştir. Ancak bunun canlıda ve geliştirme ortamında çalışabilmesi için Facebook Developer hesabı üzerinden uygulama oluşturulup ortam değişkenlerinin (API anahtarlarının) girilmesi gerekmektedir.

Yarın yapılması gereken adımlar:

1. **Facebook Geliştirici Platformu:** [developers.facebook.com](https://developers.facebook.com/) adresine giderek "Uygulamalarım" kısmından yeni bir uygulama oluştur. Uygulama türü olarak "Tüketici (Consumer)" seçebilirsin.
2. **Facebook Login Kurulumu:** Uygulama paneline girdiğinde "Facebook Girişi" ürününü kur.
3. **Yönlendirme URI'lerini Ayarla:** Facebook Login > Ayarlar sayfasında "Geçerli OAuth Yönlendirme URI'leri" kısmına şunları ekle:
   - Geliştirme ortamı için: `http://localhost:3000/api/auth/callback/facebook`
   - Canlı sunucu için: `https://www.guleryuzgayrimenkul.com/api/auth/callback/facebook` *(kendi domain adresini yazmalısın)*
4. **Uygulama Kimliklerini Al:** Ayarlar > Temel sayfasından **App ID (Uygulama Kimliği)** ve **App Secret (Uygulama Gizli Anahtarı)** bilgilerini al.
5. **Bilgisayara Ekle:** Emlakçının bilgisayarına bağlandığında, oradaki `.env` dosyasını açıp en altına şu satırları ekle:
   ```env
   FACEBOOK_CLIENT_ID="aldigin-app-id"
   FACEBOOK_CLIENT_SECRET="aldigin-app-secret"
   ```
6. **Sistemi Yeniden Başlat:** Bu işlemlerden sonra projeyi yeniden başlat (`pm2 restart guleryuz`) ve Facebook ile girişin çalıştığını test et.
