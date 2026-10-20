# 02 — UI_UX_GUIDELINES.md
## ডিজাইন ও ইউজার এক্সপেরিয়েন্স

## 1. Design Principles
1. **TV-first:** মোবাইল অ্যাপের মতো নয়; পুরনো টিভিতে চ্যানেল বদলানোর অনুভূতি।
2. **Zero clutter:** playback-এ কোনো permanent overlay, banner, watermark নেই।
3. **D-pad only:** সব কিছু রিমোট দিয়ে পৌঁছানো যাবে; touch/mouse ধরে নেওয়া যাবে না।
4. **Fast & quiet:** অপ্রয়োজনীয় animation নেই; ছোট loading indicator শুধু দরকারে।

## 2. Visual Style
- Background: `#0B0D10` (near-black); Surface panel: `#14181D` (alpha ~92%); Elevated: `#1C2128`
- Primary accent: `#3DA5FF`; Success `#34C759`; Warning `#FFB020`; Error `#FF4D4F`
- Text primary `#F2F5F7`, secondary `#9AA4AF`
- Font: Roboto / Noto Sans Bengali (Bangla সঠিক রেন্ডারের জন্য)। Body ≥ 20sp, title ≥ 28sp (TV দূর থেকে পড়া)।
- Corner radius 12dp; focus ring 3dp accent + হালকা scale 1.05।
- **Overscan safe area:** চারদিকে 48dp margin।

## 3. Screen Map
```
Launch → (প্রথমবার) Setup → Player (Full-screen)
Player: LEFT → Channel Panel | RIGHT → Settings | OK → Info bar | UP/DOWN → channel
Channel Panel → Search | Groups tabs | Favorites
Settings → Playlist | Playback | Monitoring | Telegram | Firebase | Diagnostics | About
```

## 4. Setup Screen
- মাঝখানে দুটি বড় কার্ড: **"M3U URL যোগ করুন"** ও **"ফাইল ইমপোর্ট করুন"**।
- URL স্ক্রিনে on-screen keyboard (Android TV IME) + "Paste" সহায়ক (Telegram থেকে URL পাঠানোর বিকল্প: bot-এ `/setplaylist <url>` — Firebase/Telegram লিংকড থাকলে)।
- Progress: "চ্যানেল পড়া হচ্ছে… 1,240 / ~3,000" ছোট progress bar।
- Error: সরল ভাষায় কারণ + **আবার চেষ্টা** / **অন্য playlist**।

## 5. Player Screen
- Full-screen video, কিছুই overlay নেই।
- **Channel change banner:** নিচের বামে ছোট ব্যানার (নম্বর, নাম, লোগো, current program) ~3 সেকেন্ড, fade out।
- Buffering: কোণায় ছোট spinner; ২ সেকেন্ডের বেশি হলেই দেখাবে।
- Error toast: এক লাইন, যেমন "চ্যানেল পাওয়া যাচ্ছে না — পরের চ্যানেল চেষ্টা করা হচ্ছে"।
- Numeric entry: 0–9 চাপলে ডান-উপরে নম্বর দেখায়, 2 সেকেন্ড পর বা OK তে সুইচ।

## 6. Remote Mapping (ডিফল্ট)
| Key | কাজ |
|---|---|
| UP / CHANNEL_UP | পরের চ্যানেল (Settings-এ reverse করা যাবে) |
| DOWN / CHANNEL_DOWN | আগের চ্যানেল |
| LEFT | Channel panel |
| RIGHT | Settings |
| OK/ENTER | Info bar; panel-এ থাকলে select |
| BACK | panel বন্ধ → না থাকলে exit confirm (২ বার BACK) |
| MENU | Playback options (aspect, audio, subtitle, sleep) |
| 0–9 | নম্বর দিয়ে চ্যানেল |
| FAST_FORWARD/REWIND | (ভবিষ্যৎ: timeshift) |
| RED/GREEN/YELLOW/BLUE | ঐচ্ছিক shortcut: RED=Favorite toggle, GREEN=Search, YELLOW=Aspect, BLUE=Info |

সব key আছে ধরে নেওয়া যাবে না — প্রতিটি কাজের বিকল্প পথ মেনুতে থাকবে।

## 7. Channel Panel (বাম দিকের)
- প্রস্থ ~ স্ক্রিনের 32%; উপরে tabs: **All | Groups | Favorites | Recent | Failed**; সর্বোচ্চ উপরে **Search** ফিল্ড (focusable)।
- Row: নম্বর · লোগো (40dp, না থাকলে ইনিশিয়াল) · নাম · health dot (🟢🟡🔴⚪) · ⭐।
- OK = play + panel auto-close। LONG-PRESS OK = Favorite toggle / context menu।
- Lazy list (RecyclerView/Compose LazyColumn), stable IDs, ছবি লোডিং placeholder সহ।

## 8. Search UX
- Search ফিল্ডে focus করলে TV keyboard; প্রতি অক্ষরে debounce 200ms ফিল্টার।
- Empty state: "কোনো চ্যানেল মেলেনি — অন্য নাম লিখুন" + clear বাটন।
- ফল নির্বাচনে সাথে সাথে play; অন্তর্নিহিত player চলতে থাকবে।
- Bangla/Unicode normalized matching (case-insensitive, diacritics ignore ইংরেজির জন্য)।

## 9. Settings Screen
- বাম মেনু (বিভাগ) + ডান পাশে বিকল্প। বড় toggle/radio, মান সরাসরি দেখানো।
- Destructive কাজে confirmation dialog (ডিফল্ট ফোকাস **Cancel**)।
### 9.1 Telegram Settings Screen
```
Telegram
 ├─ Bot Token        [••••••••••••ab12]   (edit)
 ├─ Chat ID          [123456789]          (edit)
 ├─ Enable           [ON]
 ├─ [ Connect & Test ]   → Status: Connected ✅ / Failed ❌ (কারণ)
 ├─ Alert cooldown   [30 min]
 ├─ Min failures     [3]
 ├─ Daily summary    [ON] time [22:00]
 ├─ Report options   launch msg ✔ | startup scan report ✔ | watch-time report ✔
 ├─ Telegram Commands  ▶ (শুধু Connected হলে দৃশ্যমান)
 └─ Clear credentials
```
**Telegram Commands screen:** পূর্ণ কমান্ড তালিকা (command + বিবরণ), প্রতিটির পাশে toggle (enable/disable), "Allowed Chat IDs" ব্যবস্থাপনা, "Require PIN for sensitive commands" toggle, "Set bot menu" বাটন (`setMyCommands`)।
- Token পুরোপুরি মাস্ক; দেখানো শুধু শেষ ৪ অক্ষর।
- সতর্কবার্তা: "Rooted বা compromised ডিভাইসে credentials সম্পূর্ণ সুরক্ষিত নয়।"

### 9.2 Firebase Settings
Status (Connected/Offline), account (মাস্কড), Sync now, Sync toggles (settings/favorites/history), Crash reports opt-in, Delete cloud data।

## 10. Health Dashboard
- সামারি কার্ড: Healthy / Slow / Unavailable / Unknown গণনা।
- তালিকা: চ্যানেল, status, response time, last success, consecutive failures; ফিল্টার ট্যাব।
- ৭ দিনের ছোট trend (ঐচ্ছিক)।

## 11. Accessibility & Localization
- Text size: Normal / Large / Extra Large।
- উচ্চ কনট্রাস্ট (WCAG AA)।
- `values/` (English) ও `values-bn/` (Bengali) strings; হার্ডকোড স্ট্রিং নয়।
- RTL-ready layout (`start/end`)।
- Bangla নাম কাটছাঁট হলে ellipsize + marquee (focus হলে)।

## 12. Motion
- Panel slide 180ms, banner fade 200ms। কম মেমরি ডিভাইসে অ্যানিমেশন কমানোর "Reduce motion" সেটিং।

## 13. Empty/Error States (বাংলা নমুনা)
- Playlist নেই: "কোনো playlist যোগ করা হয়নি।"
- Network নেই: "ইন্টারনেট সংযোগ নেই। সংযোগ ফিরলে আবার চেষ্টা হবে।"
- Unauthorized (401/403): "এই স্ট্রিমে প্রবেশের অনুমতি নেই / লিংকের মেয়াদ শেষ।"
- Telegram ব্যর্থ: "Telegram যুক্ত হয়নি: Token বা Chat ID ভুল হতে পারে।"
