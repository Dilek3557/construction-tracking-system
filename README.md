# İş Takip Sistemi

Mukavim Mühendislik için geliştirilen proje, aşama ve personel yönetim sistemi.

## Proje hakkında

Mühendislik/ofis projelerinin süreç takibini yapmak için geliştirilmiştir.

- Proje oluşturma
- Aşama (stage) yönetimi
- Personel atama
- Aşama tamamlama / yönetici onayı
- Teslim ve arşiv
- Ofis duyuruları ve okundu takibi
- Kullanıcı aktif/pasif yönetimi

Detaylı kurulum ve test: **[KURULUM.md](./KURULUM.md)**

## Teknolojiler

**Backend:** Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, PostgreSQL, Maven

**Frontend:** React, TypeScript, Vite

**DevOps:** Docker, Docker Compose, Nginx, Environment Variables (.env)

## Mimari

```text
Frontend (React)  →  Backend API (Spring Boot)  →  PostgreSQL
```

Tüm sistem Docker Compose ile çalışır.

## Hızlı bağlantılar

| Servis | Adres |
|--------|--------|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| Health | http://localhost:8080/actuator/health |
| PostgreSQL (host) | localhost:5433 |

## Kurulum (özet)

**Gereksinimler:** Docker, Docker Compose, Maven (backend build için)

```bash
cp .env.example .env
# .env içini doldurun (Postgres ve Spring şifreleri tutarlı olsun)

cd backend/is-takip-sistemi-backend
mvn clean package -DskipTests
cd ../..

docker compose up --build -d
```

Durdurmak: `docker compose down`

`.env` repoya eklenmez; örnek yapı için `.env.example` kullanılır.

## İlk Admin Kullanıcısı

Veritabanında aktif admin yoksa uygulama ilk açılışta otomatik admin oluşturur (`DataInitializer`).

İlk admin bilgileri `.env` dosyasındaki değerlerden alınır:

```env
INITIAL_ADMIN_USERNAME=Mustafa
INITIAL_ADMIN_DISPLAY_NAME=Yonetici
INITIAL_ADMIN_PASSWORD=change-me
```

Kurulumdan sonra admin şifresinin değiştirilmesi önerilir.

## Health Check

`http://localhost:8080/actuator/health` → beklenen: `{"status":"UP"}` (veya gruplu health yanıtı)

## Teslim öncesi test (kısa)

- [ ] Admin login
- [ ] Personel ekleme
- [ ] Proje oluşturma
- [ ] Aşama ekleme
- [ ] Personel atama
- [ ] Personel tamamladı
- [ ] Admin onayladı
- [ ] Teslim / arşiv
- [ ] Duyuru / okudum

## Güvenlik

- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (Admin / Personel)
- Aktif/pasif kullanıcı kontrolü
- CORS yapılandırması
- Hassas değerler ortam değişkenleri (`.env`) ile yönetilir

## Gelecek geliştirmeler

- Flyway / Liquibase migration (`ddl-auto=update` yerine)
- Unit / integration testleri
- CI/CD pipeline
- VPS deployment, domain, Nginx reverse proxy, HTTPS
- Loglama, monitoring, refresh token

## Ekran görüntüleri (isteğe bağlı)

GitHub görünümünü güçlendirmek için ileride eklenebilir:

- Giriş ekranı
- Dashboard
- Görev ekranı

Görselleri `docs/screenshots/` altına koyup buradan linkleyebilirsiniz.

## Proje yapısı

```text
Mukavim_workspace_temiz/
├── backend/is-takip-sistemi-backend/
├── frontend/insaat-takip-sistemi/
├── docker-compose.yml
├── .env.example
├── KURULUM.md
└── README.md
```
