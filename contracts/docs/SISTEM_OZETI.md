# Trust Circle — Sistem Özeti (Türkçe)

> Teminat olmadan kredi. Bankasız, belgesiz, sadece seni tanıyan insanların güvencesiyle.

---

## Sorun

Dünyada **1.4 milyar yetişkin** resmi finansal sisteme erişemiyor. Banka hesapları yok, kredi puanları yok, teminat gösterecek mülkleri yok. Ama her toplulukta insanlar birbirine zaten güveniyor — esnaf komşusuna kefil olur, aile üyesi arkadaşının borcunu garanti eder. Bu gayriresmi "sosyal teminat" sistemi dünya genelinde yılda **500 milyar dolar+** hareket ettiriyor.

Sorun şu: bu sistemin kayıt tutma, yaptırım uygulama ve ölçeklenme kapasitesi yok.

---

## Çözüm: Trust Circle

Trust Circle, insanlar arasında zaten var olan güveni **programlanabilir, uygulanabilir ve ölçeklenebilir** hale getiriyor. Blockchain üzerinde çalışan bir sosyal kredi protokolü.

**Tek cümleyle:** Seni tanıyan insanlar senin için USDC stake ediyor (kefil oluyor), sen bu güvence karşılığında borç alıyorsun, geri ödediğinde hem sen hem kefillerin kazanıyor. Ödemezsen, hem sen hem kefillerin kaybediyor.

---

## Nasıl Çalışır: Adım Adım

### 1. Kayıt (Kimlik Doğrulama)

Kullanıcı World App üzerinden **World ID 4.0** ile kimliğini doğrular. Bu, zero-knowledge proof (sıfır bilgi ispatı) kullanan bir sistemdir — kimlik bilgilerini açığa çıkarmadan "ben gerçek ve tekil bir insanım" ispatı üretir.

**Neden önemli:** Bir kişi birden fazla hesap açarsa, kendine kefil olup borç alır, ödemez ve sistemi sömürür. World ID bunu imkansız kılar: **bir insan = bir hesap**.

Kayıt sonrası kullanıcı:
- **100 itibar puanı** alır (Çaylak seviyesi)
- **ENS alt ismi** alır (örn: `fatma.trustcircle.eth`)
- Maksimum **$100** borç alabilir

### 2. Kefillik (Vouching)

Bir kişi başka birinin borçlanabilmesi için **kendi USDC'sini stake eder**. Bu sadece "güveniyorum" demek değil — gerçek para yatırmaktır.

**Süreç:**
1. Kefil, borçlunun adresini seçer ve USDC miktarını belirler (minimum $10)
2. Kefillik **48 saat beklemede** kalır — hemen aktif olmaz
3. 48 saat sonra kefillik aktifleşir ve borçlunun kredi limitine eklenir

**48 saat neden var:** Flash-loan tarzı saldırıları önlemek için. Biri kefillik oluşturup aynı işlemde borç alıp kaçamasın diye.

**Kefil itibar çarpanı:** Yüksek itibarlı kefillerin sözü daha ağır basar.
| Kefil İtibarı | Çarpan | Etki |
|---------------|--------|------|
| 0–199 | 0.50x | $100 kefillik → $50 kredi |
| 200–499 | 0.75x | $100 kefillik → $75 kredi |
| 500–699 | 1.00x | $100 kefillik → $100 kredi |
| 700–899 | 1.25x | $100 kefillik → $125 kredi |
| 900–1000 | 1.50x | $100 kefillik → $150 kredi |

**Anti-oyun kuralları:**
- Kendine kefil olamazsın
- Maksimum 5 aktif kefillik pozisyonu
- Tek bir kefillik, borçlunun toplam limitinin %40'ını geçemez
- Büyük borçlar için minimum 3-5 bağımsız kefil gerekir

### 3. Borç Alma

Aktif kefilliklerin toplamı kadar borç alınabilir, ama **itibar seviyesi (tier)** her şeyi belirler:

| Seviye | İtibar | Maks Borç | Faiz | Süre | Min Kefil |
|--------|--------|-----------|------|------|-----------|
| Donmuş | 0–99 | $0 | — | — | — |
| Çaylak | 100–199 | $100 | %15 | 14 gün | 1 |
| Yükselen | 200–299 | $500 | %12 | 21 gün | 3 |
| Kurucu | 300–499 | $2,000 | %8 | 30 gün | 3 |
| Güvenilir | 500–699 | $10,000 | %5 | 60 gün | 3 |
| Köklü | 700–899 | $50,000 | %3 | 90 gün | 5 |
| Lider | 900–1000 | $100,000 | %2 | 180 gün | 5 |

**Borç alırken ne olur:**
1. Seviye kontrolü (yeterli itibar var mı?)
2. Kefil kontrolü (yeterli sayıda aktif kefil var mı?)
3. Devre kesici kontrolü (sistem sağlıklı mı?)
4. Borcun %1'i otomatik olarak **sigorta havuzuna** aktarılır
5. Kalan miktar borçluya transfer edilir

### 4. Geri Ödeme

**Zamanında ödeme:**
- Borçlu anapara + faizi öder
- **+10 itibar puanı** kazanır
- Faizin **%80'i kefillere** dağıtılır (orantılı)
- Faizin **%20'si protokole** gider
- Kefillerin stake'leri serbest kalır

**Geç ödeme (7 günlük ek süre):**
- Vade tarihinden sonra 7 gün ek süre var
- **%2 gecikme ücreti** eklenir
- **-10 itibar puanı** kaybedilir
- Hâlâ tam ödeme yapılabilir

**Fazla ödeme:** Borçlu gereğinden fazla gönderirse, fazlalık otomatik iade edilir.

### 5. Temerrüt ve Tasfiye

7 günlük ek süre de geçtikten sonra borç **temerrüde düşer**. Bu noktada herhangi biri tasfiye işlemini başlatabilir.

**Borçluya ne olur:**
- **-50 itibar puanı** (Çaylak seviyesindeki biri → Donmuş)
- **30 gün bekleme süresi** — yeni kefillik alamaz
- Borç alma erişimi kaybedilir, itibar yeniden inşa edilmeli

**Kefillere ne olur:**
- Stake'lerinin **%70'i kesilir** (orantılı)
- **%30'u sigorta havuzu** tarafından karşılanır
- Yani kefil en fazla stake'inin %70'ini kaybeder, %30'u güvence altında

**Tasfiye ödülü:**
Tasfiyeyi başlatan kişi, ödenmemiş borcun bir yüzdesini ödül olarak alır:
| Süre (ek süre sonrası) | Ödül |
|-------------------------|------|
| 1–3 gün | %1 |
| 4–7 gün | %2 |
| 8–14 gün | %3 |
| 15+ gün | %5 |

Bu artan ödül yapısı, temerrütlerin er ya da geç mutlaka çözülmesini sağlar.

---

## İtibar Sistemi (Reputation Engine)

İtibar, Trust Circle'ın kalbidir. Süslü bir puan değil — **borç alma gücünü doğrudan kontrol eden mekanizma**.

### Puan Değişimleri

| Olay | İtibar Değişimi |
|------|-----------------|
| Zamanında geri ödeme | +10 |
| Geç ödeme (ek süre içinde) | -10 |
| Temerrüt | -50 |
| 90 gün hareketsizlik sonrası | Ayda -5 |

### İtibar Çürümesi (Decay)

90 gün hiçbir işlem yapmayan kullanıcının itibarı ayda 5 puan düşer. Bu, eski yüksek puanlı hesapların "itibar istifleme" yapmasını engeller. Herhangi bir işlem (ödeme, kefillik vb.) çürümeyi durdurur.

### Donmuş Hesap

İtibar 100'ün altına düşerse hesap **donar**:
- Borç alınamaz
- Yeni kefillik alınamaz
- Topluluk katılımıyla (başkalarına kefil olarak) itibar yeniden inşa edilmeli

Bu, kalıcı bir yasaklama değil — **geri dönüş yolu var**, ama çaba gerektirir.

---

## Sigorta Havuzu (Insurance Pool)

Her borcun **%1'i** otomatik olarak sigorta havuzuna aktarılır. Bu havuz:

- Temerrüt durumunda kefillerin kaybının **%30'unu karşılar**
- Tasfiye ödüllerini öder
- Hiç kimse ayrıca katılım yapmak zorunda değil — protokol seviyesinde zorunlu

**Neden önemli:** Sigorta olmadan kefillik çok riskli olurdu (ya hep ya hiç). %30 güvenceyle, seçici kefillik yapan biri için beklenen değer pozitif kalır — bu da sisteme katılımı rasyonel kılar.

---

## Devre Kesici (Circuit Breaker)

Protokolün sağlığını gerçek zamanlı izler. **7 günlük kayar pencerede** temerrüt oranını takip eder:

| Durum | Temerrüt Oranı | Ne Olur |
|-------|----------------|---------|
| **YEŞİL** | <%5 | Normal çalışma |
| **SARI** | %10–%20 | Borç limitleri %50 düşer, faizler %50 artar |
| **KIRMIZI** | >=%20 | Yeni borçlar tamamen engellenir |
| **İYİLEŞME** | <=%5'e dönüş | 14 gün boyunca kademeli normalleşme, ardından YEŞİL |

**Ölüm sarmalını engeller:** Temerrütler → panik → kefillik çekilmesi → daha fazla temerrüt döngüsünü, otomatik sıkılaştırma ile kırar.

---

## Oyun Teorisi: Neden Çalışır

Trust Circle'ın her tasarım kararı tek bir amaca hizmet eder: **rasyonel bencilliğin işbirlikçi sonucu üretmesini sağlamak**.

### Nash Dengesi: (Seçici Kefillik, Her Zaman Geri Öde)

**Borçlu için:** Geri ödemenin maliyeti her zaman temerrüdün maliyetinden düşüktür. $100 borcu ödemek → gelecekte $500 borç alma hakkı. Ödememek → hesap donuyor, gelecekteki tüm kredi erişimi kaybediliyor. Gelecek değer > şimdiki borç.

**Kefil için:** Tanıdığı ve güvendiği insanlar için kefillik yapan biri, faiz geliri (%80 paylaşım) + sigorta koruması (%30) sayesinde pozitif beklenen değer elde eder. %85+ doğru tahmin oranı yeterli — gerçekten tanıdığın insanlar için bu makul bir eşik.

**Tasfiyeci için:** Ödül her zaman gas maliyetinden yüksek (birkaç gün içinde). Koordinasyon gerektirmez — saf ekonomik teşvik.

**Saldırgan için:** Her saldırı vektörünün maliyeti kazancından yüksek:
- Sybil saldırısı → World ID engeller
- Flash saldırı → 48 saat gecikme engeller
- İki kişilik suç ortaklığı → minimum 3-5 kefil kuralı engeller
- İtibar çiftçiliği → yıllarca sürer (ödeme başına +10 puan)

---

## Teknik Mimari

```
┌─────────────────────────────────────────────────┐
│                 World App (Mobil)                │
│                                                 │
│   Trust Circle Mini App (MiniKit 2.0)           │
│   Next.js 14 + wagmi + Tailwind                 │
│                                                 │
│   Ekranlar:                                     │
│   [Kayıt] [Ana Sayfa] [Borç Al] [Kefil] [Profil]│
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│            World Chain Sepolia (L2)             │
│                                                 │
│   TrustCircleV2.sol ← Ana kontrat              │
│   ├── Kayıt (World ID doğrulama)               │
│   ├── Kefillik (48 saat gecikme, konsantrasyon) │
│   ├── Borç alma (seviye-kapılı)                │
│   ├── Geri ödeme (ek süre, gecikme ücreti)     │
│   └── Tasfiye (ödül, sigorta, kesilme)         │
│                                                 │
│   ReputationEngine.sol ← Seviye sistemi        │
│   InsurancePool.sol ← Sigorta havuzu           │
│   CircuitBreaker.sol ← Sistem sağlığı          │
│   TrustCircleENS.sol ← Kredi kimliği           │
│                                                 │
│   USDC (ERC20) ← Tüm para akışı               │
└─────────────────────────────────────────────────┘
```

---

## Özet Tablo

| Özellik | Detay |
|---------|-------|
| **Ne:** | Teminatsız sosyal kredi protokolü |
| **Nasıl:** | İnsanlar birbirine kefil olur, USDC stake eder |
| **Nerede:** | World App içinde mobil Mini App |
| **Zincir:** | World Chain Sepolia + Arc Testnet |
| **Kimlik:** | World ID 4.0 (sıfır bilgi ispatı) |
| **İsim:** | ENS alt isimleri (fatma.trustcircle.eth) |
| **Para birimi:** | USDC (6 ondalık) |
| **Seviye sayısı:** | 7 (Donmuş → Lider) |
| **Maks borç:** | $100 (Çaylak) → $100,000 (Lider) |
| **Faiz:** | %2 (Lider) → %15 (Çaylak) |
| **Sigorta:** | Her borcun %1'i havuza, kayıpların %30'u karşılanır |
| **Kefillik gecikmesi:** | 48 saat |
| **Ek süre:** | 7 gün |
| **Temerrüt cezası:** | -50 itibar + 30 gün donma |
| **Tasfiye ödülü:** | %1–%5 (zamana göre artan) |

---

## Fatma'nın Hikayesi

**Fatma** İstanbul'da yaşıyor. Telefonu var ama banka hesabı yok, kredi puanı yok, teminat gösterecek mülkü yok.

1. **Gün 0:** Trust Circle'ı açıyor, World ID ile kimliğini doğruluyor. `fatma.trustcircle.eth` olarak kayıt oluyor. İtibarı: 100 (Çaylak).

2. **Gün 1:** Kuzeni **Mehmet** (itibar 300) Fatma için $50 USDC stake ediyor. 48 saat bekleme başlıyor.

3. **Gün 3:** Kefillik aktifleşiyor. Mehmet'in çarpanı 0.75x → Fatma'nın kredi limiti $37.50. Fatma $37 borç alıyor, 14 gün vadeli, %15 faizle. $0.37 sigortaya gidiyor.

4. **Gün 15:** Fatma $37.21 ödüyor (anapara + faiz). İtibarı 110'a çıkıyor (+10). Mehmet $0.17 faiz geliri kazanıyor.

5. **Aylar sonra:** 10 başarılı ödeme sonrası Fatma 200 itibar puanına ulaşıyor → **Yükselen** seviyesi. Artık $500'a kadar borç alabilir, %12 faizle, 21 gün vadeyle.

6. **Bir yıl sonra:** Fatma 400 itibar puanında → **Kurucu** seviyesi. $2,000 borç alıp küçük işletmesi için stok satın alıyor. Resmi kredi sistemine hiç girmeden, sadece sosyal güven üzerinden kredi ekonomisine katılmış oluyor.

---

*Herkes için kredi, hiç kimseden teminat.*
