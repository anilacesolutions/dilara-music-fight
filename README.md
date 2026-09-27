# Music Fight

İki kişinin sırayla YouTube'dan şarkı atarak kapıştığı müzik düellosu. Her şarkı,
bir öncekinin **formatına** (tür, enerji, dönem, dünya) yakın olmak zorunda.
Rakip kart gösterir, hakem karar verir, izleyiciler canlı takip eder, puanlar
liderlik tablosuna yazılır.

## Kurulum

```bash
npm install
cp .env.example .env.local   # MONGODB_URI'yi doldur
npm run dev
```

http://localhost:3000 → Üye Ol → Giriş Yap → Lobi → **Music Fight Başlat**.

### Ortam değişkenleri

| Değişken | Ne işe yarar |
|---|---|
| `MONGODB_URI` | MongoDB bağlantısı (Atlas replica set; puanlar transaction ile yazılıyor) |
| `MONGODB_DB` | Veritabanı adı, varsayılan `music_fight` |
| `JUDGE_PROVIDER` | `mock` (başlık benzerliği, LLM yok) ya da `bedrock` (Amazon Nova Lite; şarkı ve sohbet hakemi) |
| `AWS_REGION` / `BEDROCK_MODEL_ID` | Bedrock bölgesi ve modeli — varsayılan `eu-central-1` / `eu.amazon.nova-lite-v1:0` |
| `AWS_BEARER_TOKEN_BEDROCK` | Bedrock API key; AWS SDK kendisi okur |
| `YOUTUBE_API_KEY` | İsteğe bağlı. Varsa şarkı süresi resmi Data API'den okunur |
| `MF_LISTEN_RATIO` | **Sadece geliştirme.** %80 kuralını test için küçültür (ör. `0.02`). Production'da yok sayılır |

## Diller

Site Türkçe, İngilizce ve Almanca yayında. Her sayfa `/<dil>/…` altında: `/tr/lobby`, `/en/lobby`, `/de/lobby`.

- Dilsiz bir adrese gelen ziyaretçiyi [proxy.ts](src/proxy.ts) yönlendirir: önce daha önce seçtiği dil (`mf_locale`
  çerezi), sonra tarayıcının `Accept-Language` başlığı, o da tutmazsa Türkçe.
- **Adresteki dil o ziyaret için kazanır**, yani bir dilde paylaşılan link o dilde açılır. Üst bardaki seçici hem
  sayfayı çevirir hem tercihi çereze yazar.
- Sözlükler [src/i18n](src/i18n) altında üç parçaya bölünmüş: `ui` (tarayıcıya giden metinler), `site` (sunucuda
  işlenen sayfa metinleri), `errors` (sunucunun reddetme mesajları). **Türkçe kaynak dildir**; `en` ve `de`
  dosyaları `typeof tr` ile tiplenir, dolayısıyla eksik ya da imzası değişmiş bir çeviri derlemeyi kırar.
- Sunucu tarafında dil `next/root-params` ile okunur. Server Action'lar ve Route Handler'lar root parametreyi
  göremediği için `mf_locale` çerezine bakar.
- **Hakem gerekçesini üç dilde birden yazar.** Karar bir kez üretilip maça kaydediliyor ve iki oyuncuyla bütün
  izleyiciler aynı kaydı okuyor; sonradan okuyucuya göre çevirmenin yolu yok.
- Tür adları [catalog.ts](src/lib/catalog.ts) içinde üç dilde. "Anadolu Rock" ve "Arabesk" özel isim olarak
  korunuyor; "Türk Halk Müziği" ve "Türk Sanat Müziği" ise İngilizce/Almanca'da anlaşılsın diye çevriliyor.
  Hakeme her zaman türün İngilizce adı gidiyor.

## Oyun akışı

1. Ev sahibi (`a`) oda kurar, linki ya da 5 haneli kodu paylaşır.
2. Kodla gelen kişi **Maça Katıl** (koltuk boşsa) ya da **İzle** seçer. Maç başladıysa sadece izler.
3. **Yazı tura:** İki oyuncudan hızlı olan coin'i fırlatır, hızlı olan yazı/turayı seçer, diğerine öteki taraf düşer.
   Sonuç coin havaya atıldığı an sunucuda çekilir ama **seçim yapılana kadar kimseye gönderilmez**.
   Gelen tarafı elinde tutan oyuncu maçı açar.
4. **Tür seçimi:** Yazı turayı kaybeden, iki profilin ortak türlerinden maçın türünü seçer. Kazanan bu teklifi
   **bir kez** reddedebilir; ikinci seçim kesindir. Her adım için 2 dakika var, dolarsa sunucu kendi karar verir.
5. Sırası gelen oyuncu YouTube linki atar. 10 dakikadan uzun şarkılar ve canlı yayınlar reddedilir.
6. **Hakem şarkıya hemen karar verir ama karar mühürlü kalır** — oyunculardan da izleyicilerden de.
   Açılış şarkısı anlaşılan türe göre, sonraki her şarkı bir öncekinin formatına göre değerlendirilir.
7. Rakip şarkının en az %80'ini dinler, sonra kararını verir: sarı kart, kırmızı kart ya da kart yok.
8. Karar verildiği an mühür herkes için açılır ve puanlar yazılır. Sonra rakip kendi şarkısını atar.

İlk şarkı atılana kadar her iki oyuncu da **Maçtan Ayrıl** diyebilir: oda kapanır, kimseye puan yazılmaz.
İlk şarkıdan sonra bu kapı kapanır, çıkmak isteyen pes eder.

### Maç nasıl biter?

| Yol | Koşul | Sonuç |
|---|---|---|
| **Maçı Bitir** | İki oyuncunun da en az 3 şarkısı var, sayılar eşit, ikisi de basıyor | Skora göre kazanan / berabere |
| **Pes Et** | Her an | Pes eden kaybeder |
| **Süre** | Sırası gelen oyuncu, dinleme süresi bittikten sonra 5 dakika içinde şarkı göndermezse | Hükmen kaybeder |
| **Kural ihlali** | Hesap silinirse (sohbette ipucu) | Silinen oyuncu kaybeder |
| **Maçtan Ayrıl** | Henüz hiç şarkı atılmamışsa, tek oyuncunun basması yeter | Oda kapanır, puan yazılmaz |
| **Boş oda** | 30 dakika içinde rakip gelmezse | Oda kapanır |

Üst sınır yok. Galibiyet/beraberlik bonusu **yalnızca iki oyuncu da en az 3 şarkı attıysa** yazılır;
açılmış şarkı puanları her durumda kalır. Süreler tembel uygulanır: odaya bakan ilk istek (yoklama ya da hamle)
süresi dolmuş maçı bitirir.

### Puanlar ([src/lib/rules.ts](src/lib/rules.ts))

| Durum | Puan |
|---|---|
| Hakem: formata uyuyor | +30 |
| Hakem: formata uymuyor | −20 |
| Açılış şarkısı (anlaşılan türe göre) | +30 / −20 |
| Haklı çıkan sarı / kırmızı kart (şarkı sahibine ek) | −5 / −10 |
| Rakibin şarkısını dinlemeden atlamak (atlayana, sınırsız; atlanan şarkıya sadece sarı kart) | −5 |
| Hakemin uyumlu bulduğu şarkıya kart | kart boşa gider |
| Galibiyet / beraberlik bonusu (min. 3'er şarkı) | +10 / ikisine +5 |
| AI maçı çarpanı | ×0,5 (AI modu henüz yok) |

### İzleyiciler ve sohbet

- Oda koduyla her maç izlenebilir; oyunculardan biri maçı istediği an izleyicilere kapatabilir (varsayılan açık).
- Üst barda canlı izleyici sayısı görünür (son 20 saniyede yoklama yapanlar).
- Oyuncular ve izleyiciler aynı sohbete yazar, hızlı emoji atar.
- **Link paylaşmak engellenir.** Şarkı adı/sanatçı/ipucu vermek hesabın kalıcı olarak silinmesiyle cezalandırılır —
  bu kararı sohbet hakemi verir ([src/lib/judge/chat.ts](src/lib/judge/chat.ts)); şimdilik yer tutucu, kimseyi işaretlemiyor.
- Kötü sözler kelime bazında maskelenir ([src/lib/profanity.ts](src/lib/profanity.ts)).
- Mesajlar şikayet edilebilir (kopyası `reports` koleksiyonunda saklanır) ve yazanı engellenebilir.
  Engellenenler profil sayfasından geri açılır.
- Sohbet maç bitince silinir; bitmeyen odalar için 24 saatlik TTL var.

### Dinleme kuralı nasıl korunuyor?

- **Tarayıcı** gerçekten çalınan saniyeleri sayar: ileri sarma ve sessize alma sayılmaz, aynı yeri tekrar dinlemek süreyi uzatmaz.
- **Sunucu**, şarkı gönderildikten sonra `süre × %80` dolmadan kart kararını kabul etmez.

## Mimari

```
src/
├─ proxy.ts                     dil yönlendirmesi ve mf_locale çerezi
├─ i18n/                        config, ui/ site/ errors/ (tr·en·de), server.ts, client.tsx, link.tsx
├─ app/
│  ├─ [locale]/                 bütün sayfalar dilin altında
│  │  ├─ page.tsx               karşılama: tanıtım, kurallar, 3 liderlik tablosu
│  │  ├─ signup/ login/         üyelik ve giriş (Server Action + useActionState)
│  │  ├─ lobby/                 banner'lar, Music Fight Başlat, oda koduyla katıl/izle
│  │  ├─ room/[code]/           maç ekranı (RoomClient 1,5 sn'de bir oyun + sohbet yoklar)
│  │  ├─ profile/[nickname]/    herkese açık profil + sahibine düzenleme ve engellenenler
│  │  └─ kvkk/                  aydınlatma metni (TASLAK)
│  ├─ actions/                  auth.ts, profile.ts
│  └─ api/                      rooms/…, chat/…, tracks/preview
├─ components/
│  ├─ fight/                    CoinToss, GenrePick, MatchSetup, YouTubeStage, CardDecision, SendSong,
│  │                            ChatPanel, MatchControls, TurnClock, SpectatorStage, MoveHistory, ResultPanel…
│  ├─ lobby/ profile/ auth/
│  ├─ Visualizer.tsx            generatif canvas visualizer
│  └─ FightPreview.tsx          karşılamadaki animasyonlu örnek maç
└─ lib/
   ├─ rules.ts                  tüm puan, süre ve kural sabitleri
   ├─ rooms.ts                  oyun motoru: yazı tura, tür seçimi, mühürlü karar, kartlar, süreler, bitiş, izleyiciler
   ├─ chat.ts chat-rules.ts     sohbet, link engeli, şikayet, engelleme
   ├─ profanity.ts              kötü söz maskesi
   ├─ moderation.ts             ihlalde hesap silme
   ├─ session.ts auth.ts        veritabanı oturumu (httpOnly cookie) + DAL
   ├─ password.ts               scrypt
   ├─ users.ts leaderboard.ts   hesaplar, puan defterinden liderlik tabloları
   ├─ youtube.ts                link → video → başlık + süre
   ├─ catalog.ts time.ts        avatar/tür listeleri, İstanbul takvimi
   └─ judge/                    şarkı hakemi + sohbet hakemi arayüzleri (mock)
```

MongoDB koleksiyonları: `users`, `sessions` (TTL), `rooms`, `score_events` (puan defteri),
`chat_messages` (TTL 24 sa), `presence` (izleyici yoklaması, TTL), `reports`, `moderation_log`.

### API

| Metot | Yol | Ne yapar |
|---|---|---|
| `POST` | `/api/rooms` | Oda kurar |
| `GET` | `/api/rooms/[code]?watch=1&after=<id>` | İzleyiciye özel oda görünümü + yeni sohbet mesajları |
| `POST` | `/api/rooms/[code]/join` | İkinci oyuncu olarak katılır |
| `POST` | `/api/rooms/[code]/coin` | `{ action: "throw" }` coin'i atar · `{ action: "call", side }` yazı/tura seçer |
| `POST` | `/api/rooms/[code]/genre` | `{ action: "propose", genre }` · `{ action: "accept" }` · `{ action: "veto" }` |
| `POST` | `/api/rooms/[code]/cancel` | İlk şarkıdan önce maçı puansız kapatır |
| `POST` | `/api/rooms/[code]/moves` | `{ url }` şarkı atar |
| `POST` | `/api/rooms/[code]/decision` | `{ card: "yellow" \| "red" \| null }` mührü açar |
| `POST` | `/api/rooms/[code]/end` | `{ wantsToEnd }` «Maçı Bitir» oyu |
| `POST` | `/api/rooms/[code]/surrender` | Pes eder |
| `POST` | `/api/rooms/[code]/settings` | `{ spectatorsAllowed }` izleyicileri açar/kapatır |
| `POST` | `/api/rooms/[code]/chat` | `{ text }` mesaj gönderir |
| `POST` | `/api/chat/[messageId]/report` | Mesajı şikayet eder |
| `POST` | `/api/chat/[messageId]/block` | Mesajın yazarını engeller |
| `GET` | `/api/tracks/preview?url=` | Göndermeden önce başlık ve süre kontrolü |

## Bilinen eksikler

- **Bedrock hakemi yazıldı ama henüz devrede değil.** `JUDGE_PROVIDER=bedrock` ile şarkı ve sohbet hakemi Amazon Nova Lite'a
  (Frankfurt, `eu.amazon.nova-lite-v1:0`) bağlanır ([src/lib/judge/bedrock.ts](src/lib/judge/bedrock.ts)). AWS hesabı şu an
  model çağrısına izin vermediği için (`Error 002: Access to Bedrock models is not allowed for this account`) `.env.local`
  `mock`'ta duruyor: `mock` şarkı hakemi başlık/kanal benzerliğine bakar, **açılış şarkısının seçilen türe uyup
  uymadığını anlayamadığı için her açılışı geçerli sayar**, sohbet hakemi kimseyi işaretlemez.
  Sohbet hakemi bir hesabı ancak model %85+ emin olup ipucunu mesajdan birebir alıntılayabildiğinde siler.
- **AI ile kapış** lobide "Yakında"; izleyici modu şimdilik gerçek oyuncu maçları için.
- **Mail doğrulama ve şifremi unuttum** sonraya bırakıldı.
- **Renk paleti geçici.** `ui color palette` görseli projeye ulaşmadı; renkler [globals.css](src/app/globals.css) başındaki `--base-*` değişkenlerinde.
- **Şarkı süresi**, API key yoksa YouTube sayfasından okunuyor; production'dan önce `YOUTUBE_API_KEY` eklenmeli.
- **Kötü söz listesi başlangıç seviyesinde**, harf aralarına boşluk koyarak atlatılabilir.
- **Giriş denemesi sınırı (rate limit) yok.**
- **KVKK metni yer tutucu**, hukukçu tarafından yazılmalı.
- **Gerçek zamanlı değil**, 1,5 saniyelik yoklama kullanılıyor.
