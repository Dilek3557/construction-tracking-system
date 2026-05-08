| Frontend’de gördüğün      | Backend karşılığı                        |
|---------------------------|------------------------------------------|
| Proje listesi             | `Project`                                |
| Proje detay               | `Project` + `Stage`                      |
| Aşama (Temel kazısı vs)   | `Stage`                                  |
| Aşamaya atanan kişi       | `StageAssignment`                        |
| “Bitti” butonu            | `StageAssignment.completed`              |
| Onay bekliyor             | `Stage.status = WAITING_APPROVAL`        |
| Yönetici onayı            | `Stage.status = APPROVED`                |
| Sağdaki interaktif notlar | `ProjectNote`                            |
| Üstteki resmi duyuru      | `OfficeAnnouncement`                     |
| “Okudum”                  | `AnnouncementAck`                        |
| Alttaki genel notlar      | `GeneralNote`                            |
| Dashboard kritik kart     | `DashboardService.getCriticalProjects()` |
| Dashboard onay bekleyen   | `StageRepository.countByStatus()`        |
| Dashboard teslim edilen   | `ProjectRepository.countByStatus()`      |

# 📌 İş Takip Sistemi (Backend)

Bu proje, bir şirket içinde projelerin ve iş süreçlerinin takip edilmesi için geliştirilmiş bir backend uygulamasıdır.

Amaç:

- Projeleri yönetmek
- Aşamaları takip etmek
- Personel atamak
- Onay süreçlerini kontrol etmek
- Dashboard üzerinden genel durumu görmek

---

# 🧠 Sistem Mantığı

## Roller

### 👤 Yönetici

- Proje oluşturur
- Aşama (stage) ekler
- Personel atar
- Aşamaları onaylar
- Projeyi teslim eder / arşivler
- Duyuru yayınlar

### 👷 Personel

- Kendisine atanan işleri görür
- İşi tamamladığını işaretler
- Not bırakabilir

---

# 🧱 Temel Yapı (Entities)

## 📁 Project

- Proje bilgileri (isim, firma, nitelik, tarih)
- Durum: ACTIVE / DELIVERED
- Arşiv durumu

## 📁 Stage

- Projenin alt aşamaları
- Örn: Temel kazısı, beton dökme

## 📁 StageAssignment

- Aşamaya atanan kişiler
- "Bitti" durumu burada tutulur

## 📁 ProjectNote

- Proje içindeki interaktif notlar (chat gibi)

## 📁 OfficeAnnouncement

- Üstteki resmi duyuru

## 📁 AnnouncementAck

- "Okudum" bilgisi

## 📁 GeneralNote

- Alt taraftaki genel ofis notları

---

# 🔄 İş Akışı

1. Yönetici proje oluşturur
2. Aşamalar eklenir
3. Personel atanır
4. Personel işi tamamlar (`Bitti`)
5. Tüm atamalar tamamlanırsa → `WAITING_APPROVAL`
6. Yönetici onaylar → `APPROVED`
7. Proje teslim edilir → `DELIVERED`
8. İstenirse arşive alınır

---

# 📊 Dashboard Özellikleri

- 🔴 Kritik projeler (deadline ≤ 3 gün)
- 🔵 Onay bekleyen aşamalar
- 🟢 Teslim edilen projeler
- 📈 Proje nitelik dağılımı grafiği

---

# 📡 API Endpoints (Özet)

## Project

- `POST /projects`
- `GET /projects`
- `GET /projects/active`
- `GET /projects/archived`
- `PUT /projects/{id}/deliver`
- `PUT /projects/{id}/archive`

## Dashboard

- `GET /dashboard/critical-projects`
- `GET /dashboard/waiting-approval-stage-count`
- `GET /dashboard/delivered-project-count`
- `GET /dashboard/project-type-distribution`

---

# 📊 Grafik Mantığı

Proje nitelik dağılımı:

- Tüm projeler (arşiv dahil) dikkate alınır
- projectType alanına göre gruplanır
- Her türün sayısı hesaplanır

Örnek:

```json
[
  { "name": "Betonarme", "count": 5 },
  { "name": "Çelik", "count": 3 }
]