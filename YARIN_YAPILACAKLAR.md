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

Windows OpenSSH, şifresi olmayan hesaplara dışarıdan standart yöntemle (şifre girerek) bağlanmaya güvenlik sebebiyle izin vermez. Şifre koyamayacağımız için **SSH Anahtarı (Public Key Authentication)** kullanmak ZORUNLUDUR. 

Bu sayede, kendi bilgisayarın ve emlakçının bilgisayarı arasında bir şifreleme anahtarı eşleşecek ve Windows şifresi olmadan bile güvenli şekilde giriş yapabileceksin.

### Adım 2.1: Kendi Bilgisayarında Anahtar Üret (Geliştirici Cihazı)
Emlakçıya gitmeden önce (veya kendi bilgisayarın yanındaysa oradayken) bir terminal açıp şu komutu çalıştır:
```powershell
ssh-keygen -t ed25519 -C "davut-uzaktan-baglanti"
```
*(Sorulan sorulara Enter basıp geçebilirsin)*

Bu komut sana `C:\Users\SeninKullaniciAdin\.ssh\id_ed25519.pub` adında bir dosya üretecek.
**Bu dosyanın içindeki metni kopyala** ve emlakçının bilgisayarında erişebileceğin bir yere (kendine mail at, WhatsApp'tan gönder vs.) aktar.

### Adım 2.2: Emlakçının Bilgisayarında SSH Kurulumu
Emlakçının bilgisayarına geçtiğinde şunları yap:

1. **OpenSSH Server kurulu değilse kur ve başlat:** (Yönetici yetkili PowerShell açarak)
   ```powershell
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   Start-Service sshd
   Set-Service -Name sshd -StartupType Automatic
   ```

2. **Anahtarını Emlakçının Bilgisayarına Tanıt:** (Normal PowerShell ile)
   ```powershell
   # .ssh klasörü oluştur
   New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
   
   # Yetkili anahtarlar dosyasını oluştur ve not defteriyle aç
   notepad "$env:USERPROFILE\.ssh\authorized_keys"
   ```
   Açılan not defterine kendi bilgisayarında ürettiğin **public key (.pub)** içeriğini yapıştır ve dosyayı kaydet.

3. **İzinleri Ayarla (Çok Önemli):** Windows'un güvenlik kuralları gereği bu anahtarı kabul etmesi için aşağıdaki komutlarla klasör izinlerini düzelt:
   ```powershell
   icacls.exe "$env:USERPROFILE\.ssh\authorized_keys" /inheritance:r
   icacls.exe "$env:USERPROFILE\.ssh\authorized_keys" /grant "$env:USERNAME:F"
   icacls.exe "$env:USERPROFILE\.ssh\authorized_keys" /grant "SYSTEM:F"
   ```

4. **SSH Servisini Yeniden Başlat:** (Yönetici yetkili PowerShell ile)
   ```powershell
   Restart-Service sshd
   ```

### Adım 2.3: Cloudflare Tunnel İle Dışarıdan Erişim Bağlantısı
`KURULUM.md` dosyasında da anlatıldığı gibi dışarıdan erişmek için Cloudflare üzerinden bir köprü kurmalıyız.

1. Emlakçının bilgisayarında `cloudflared` çalışıyor olmalı ve Tunnel `config.yml` dosyasında şu satırlar olmalı:
   ```yaml
     - hostname: ssh.guleryuzgayrimenkul.com
       service: ssh://localhost:22
   ```

2. **Kendi Ev/İş bilgisayarında** `.ssh/config` (Örn: `C:\Users\Davut\.ssh\config`) dosyasını açıp şunu ekle:
   ```text
   Host guleryuz-ssh
       HostName ssh.guleryuzgayrimenkul.com
       User EMLAKCI_WINDOWS_KULLANICI_ADI
       ProxyCommand cloudflared access ssh --hostname %h
   ```
   *(EMLAKCI_WINDOWS_KULLANICI_ADI yerine emlakçının bilgisayarındaki aktif Windows kullanıcı adını yazmalısın. Bunu öğrenmek için emlakçıda `echo $env:USERNAME` yazabilirsin.)*

Tüm bunları yaptıktan sonra, evinden kendi bilgisayarından `ssh guleryuz-ssh` yazdığında, Windows parolasız dahi olsa şifre eşleşmesi (SSH Key) üzerinden Cloudflare aracılığıyla güvenli şekilde bilgisayara girebilecek ve `guncelle.ps1` komutlarını uzaktan çalıştırabileceksin.

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
