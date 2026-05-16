# Kurulum Rehberi — İş Takip Sistemi

Bu belge teknik kurulum içindir. Genel tanıtım için [README.md](./README.md) dosyasına bakın.

---

## 1. Gereksinimler

| Yazılım | Kontrol |
|---------|---------|
| Docker | `docker --version` |
| Docker Compose | `docker compose version` |
| Java 17+ | `java -version` |
| Maven | `mvn -version` |
| Git (isteğe bağlı) | `git --version` |

Proje kök dizini: `Mukavim_workspace_temiz` (içinde `docker-compose.yml` ve `.env` bulunur).

---

## 2. Adresler (Backend / Frontend)

| Servis | URL / adres |
|--------|-------------|
| **Frontend (arayüz)** | http://localhost:5173 |
| **Backend API** | http://localhost:8080 |
| **Health Check** | http://localhost:8080/actuator/health |
| **PostgreSQL (bilgisayardan)** | `localhost:5433` (konteyner içi port: 5432) |

---

## 3. `.env` hazırlama

1. Proje **kök klasöründe**:

   ```bash
   cp .env.example .env
   ```

2. `.env` dosyasını düzenleyin. Örnek:

   ```env
   POSTGRES_DB=is_takip
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=GÜÇLÜ_ŞİFRE

   SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/is_takip
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=GÜÇLÜ_ŞİFRE

   JWT_SECRET=EN_AZ_32_KARAKTER_GİZLİ_ANAHTAR
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173
   ```

**Kurallar**

- `POSTGRES_PASSWORD` ile `SPRING_DATASOURCE_PASSWORD` **aynı** olmalı.
- `.env` **Git’e eklenmez**; yalnızca `.env.example` paylaşılır.
- `docker-compose.yml` içinde `env_file: .env` ile değerler konteynerlere aktarılır.

---

## 4. Maven build (Backend JAR)

Dockerfile, `target/*.jar` dosyasını kopyalar. İlk kurulum veya backend kodu değiştiyse:

```bash
cd backend/is-takip-sistemi-backend
mvn clean package -DskipTests
cd ../..
```

Başarılı çıktı: `BUILD SUCCESS` ve `target/is-takip-sistemi-backend-0.0.1-SNAPSHOT.jar`

---

## 5. Docker ile sistemi ayağa kaldırma

Proje kökünden:

```bash
docker compose up --build -d
```

- `-d` → arka planda çalışır  
- `--build` → imajları yeniden oluşturur (kod değiştiyse gerekli)

**Beklenen sıra:** Postgres healthy → Backend başlar → Frontend başlar.

İlk açılışta backend **1–2 dakika** `(health: starting)` gösterebilir; normaldir.

---

## 6. Health Check kontrolü

### Docker üzerinden

```bash
docker ps
```

| Konteyner | Beklenen durum |
|-----------|----------------|
| `is-takip-postgres` | `Up (healthy)` |
| `is-takip-backend` | `Up (healthy)` |
| `is-takip-frontend` | `Up` |

### Tarayıcı / curl

```bash
curl -s http://localhost:8080/actuator/health
```

Örnek yanıt: `{"status":"UP"}` veya gruplu health JSON.

Frontend: http://localhost:5173 açılmalı.

---

## 7. İlk login (Admin)

Veritabanında aktif **ADMIN** yoksa uygulama ilk açılışta otomatik admin oluşturur (`DataInitializer`).

İlk admin bilgileri `.env` dosyasındaki değerlerden alınır:

```env
INITIAL_ADMIN_USERNAME=Mustafa
INITIAL_ADMIN_DISPLAY_NAME=Yonetici
INITIAL_ADMIN_PASSWORD=change-me
```

1. http://localhost:5173 adresine gidin.  
2. `.env` dosyasındaki kullanıcı adı ve şifreyle giriş yapın.  
3. Kurulumdan sonra admin şifresinin değiştirilmesi önerilir.

Zaten admin varsa bu adım tekrarlanmaz.

---

## 8. Container loglarına bakma

```bash
# Backend (en sık)
docker logs is-takip-backend --tail 100

# Canlı takip
docker logs -f is-takip-backend

# Postgres
docker logs is-takip-postgres --tail 50

# Frontend
docker logs is-takip-frontend --tail 50
```

---

## 9. Sistemi durdurma

Sadece durdur (veri kalır):

```bash
docker compose down
```

Veritabanı volume’ünü de sil (tüm DB verisi gider):

```bash
docker compose down -v
```

---

## 10. Sık karşılaşılan hatalar

| Belirti | Olası neden | Çözüm |
|---------|-------------|--------|
| Backend `Restarting` | Boş DB şifresi | Kökte dolu `.env`, `SPRING_DATASOURCE_PASSWORD` kontrol |
| `no password was provided` | `.env` okunmadı | Compose’u **kökten** çalıştır; `env_file: .env` var mı bak |
| `(health: starting)` uzun süre | Spring yavaş açılıyor | 1–2 dk bekle; `start_period` 120s |
| `unhealthy` backend | Uygulama crash | `docker logs is-takip-backend` |
| CORS hatası (tarayıcı) | Yanlış origin | `ALLOWED_ORIGINS` içine kullandığınız port (5173 vb.) |
| `Connection refused` localhost:8080 | Backend ayakta değil | `docker ps`, loglar |
| Port 5432 çakışması | Başka Postgres | Bu proje host’ta **5433** kullanır |
| Eski frontend görünümü | Eski imaj | `docker compose up --build` |

---

## 11. Kod değişince ne yapılır?

| Değişiklik | Komut |
|------------|--------|
| Sadece backend Java | `mvn package` → `docker compose up -d --build` |
| Sadece frontend | `docker compose up -d --build` (frontend servisi) |
| Hiç kod yok, PC yeniden açıldı | `docker compose up -d` |
| `.env` değişti | `docker compose down` → `docker compose up -d` |

---

## 12. Teslim öncesi test listesi

- [ ] Admin login  
- [ ] Personel ekleme  
- [ ] Proje oluşturma  
- [ ] Aşama ekleme  
- [ ] Personel atama  
- [ ] Personel tamamladı  
- [ ] Admin onayladı  
- [ ] Teslim / arşiv  
- [ ] Duyuru / okudum  

---

## 13. İleride (canlı ortam)

- VPS, domain, Nginx reverse proxy, HTTPS  
- Flyway / Liquibase (`ddl-auto=update` yerine)  
- Düzenli `pg_dump` veya volume yedekleme  

---

*Bu rehber `docker-compose.yml`, `env_file` ve healthcheck yapılandırmasına göre hazırlanmıştır.*
