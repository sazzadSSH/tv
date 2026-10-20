আমার বিদ্যমান StTV IPTV Application-এর সম্পূর্ণ কোড বিশ্লেষণ করে নিচে উল্লেখ করা সমস্যাগুলো সংশোধন করো। নতুন করে অ্যাপ তৈরি করবে না। বর্তমান প্রজেক্ট, ডিজাইন, কোড স্ট্রাকচার ও কার্যকর ফিচারগুলো অক্ষত রেখে শুধু প্রয়োজনীয় Correction, Bug Fix এবং Feature Enhancement করবে।

১. TV Display ও Remote Control UI Fix

Full-Screen Playback: টিভি চালু হলে স্ক্রিনে শুধু ভিডিও প্লেয়ার ও প্রয়োজনীয় টিভি কনটেন্ট দেখা যাবে।

On-screen Remote Removal: স্ক্রিনের ওপর বা পাশে থাকা স্থায়ী Remote Control UI সরিয়ে দাও। রিমোটের বাটনগুলো টিভির ডিসপ্লেতে সব সময় দৃশ্যমান থাকা যাবে না।

Clean UI: উপরে প্রদর্শিত StTV নাম, মোট চ্যানেল সংখ্যা, Device Information, Telegram Bot এবং অন্যান্য অপ্রয়োজনীয় তথ্য মূল TV Viewing Screen থেকে সরিয়ে দাও।

Hardware Remote Integration: Android TV Remote-এর আসল D-pad, OK, Back, Left, Right, Up ও Down বাটন সঠিকভাবে কাজ করতে হবে।

Left Button Action: বাম (Left) বাটন চাপলে বিদ্যমান Telegram Settings বা Telegram Link অপশন খুলবে। এই কার্যকারিতা নষ্ট করবে না।

Focus Management: Focus Management, Focus Highlight এবং Navigation ঠিক করো, যাতে রিমোট দিয়ে সহজে সব মেনু ও বাটন ব্যবহার করা যায়।

Minimalist Controls: প্রয়োজন ছাড়া ভিডিও চলার সময় কোনো স্থায়ী মেনু বা কন্ট্রোল স্ক্রিনে থাকবে না।

২. IPTV Playlist ও Streaming Playback Fix

Target Playlist: বর্তমানে নিচের GitHub M3U Playlist থেকে কিছু চ্যানেল কাজ করে না, যদিও একই Playlist অন্য IPTV Player-এ কাজ করে:

URL: https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u

Parser & Player Fix: বর্তমান M3U Parser এবং Video Player-এর কোড পরীক্ষা করে সব Playlist Parsing ও Playback-সংক্রান্ত বাগ সংশোধন করো।

Protocol Support: M3U, M3U8 এবং সমর্থিত HTTP/HTTPS Streaming URL সঠিকভাবে পড়তে হবে।

Format Compatibility: HLS, MPEG-TS এবং অন্যান্য ফরম্যাটের ক্ষেত্রে ব্যবহৃত Player ও তার ডিপেন্ডেন্সি যে ফরম্যাটগুলো সমর্থন করে, সেগুলো সঠিকভাবে চালানোর ব্যবস্থা করো।

Metadata Parsing: M3U ফাইলে থাকা #EXTM3U, #EXTINF, Channel Name, Logo, Group Title এবং Stream URL সঠিকভাবে পার্স করো।

Network & Headers: Redirect, URL Encoding, Query Parameters, User-Agent এবং প্রয়োজনীয় HTTP Headers-এর সমস্যা পরীক্ষা করো।

Resilience: কোনো স্ট্রিম ব্যর্থ হলে অ্যাপ যেন Crash না করে। উপযুক্ত Error Handling, Retry এবং Loading State যোগ করো।

Quick Switching: একটি চ্যানেল কাজ না করলে অন্য চ্যানেলে যাওয়া এবং Playlist-এর পরবর্তী চ্যানেল চালু করা সহজ হতে হবে।

Performance: বড় Playlist লোড করার সময় UI যেন Freeze না করে।

Sync & Refresh: Playlist Refresh ও Channel List Update নির্ভরযোগ্যভাবে কাজ করতে হবে।

বাস্তবসম্মত সামঞ্জস্য: কোনো Player-ই সব ধরনের স্ট্রিম চালাতে পারে না। তাই বর্তমান প্রযুক্তির সীমাবদ্ধতা বিবেচনা করে সর্বোচ্চ সামঞ্জস্য নিশ্চিত করো। কোনো Stream URL অবৈধ, বন্ধ বা সার্ভার থেকে Block করা থাকলে সেটিকে ভুলভাবে কার্যকর বলে দেখাবে না।

৩. Multiple Playlist Management Fix

Multi-Playlist Support: বর্তমান Playlist Management সিস্টেম উন্নত করো, যাতে ব্যবহারকারী একাধিক IPTV Playlist যোগ করতে ও সংরক্ষণ করতে পারেন (যেমন: Playlist 1, Playlist 2, Playlist 3)।

Core Actions: Add Playlist, Edit Playlist, Delete Playlist এবং Rename Playlist ফিচার কার্যকর করো।

Persistence: প্রতিটি Playlist-এর নাম ও URL আলাদাভাবে সংরক্ষিত থাকবে। অ্যাপ বন্ধ করে আবার চালু করলেও সংরক্ষিত Playlist মুছে যাবে না।

Easy Switching: ব্যবহারকারী সহজে একটি Playlist থেকে অন্য Playlist-এ Switch করতে পারবেন।

Independent Management: প্রতিটি Playlist আলাদাভাবে Load, Refresh এবং Validate করা যাবে।

Validation: Duplicate URL, Empty URL এবং Invalid Playlist-এর জন্য যথাযথ Validation ও Error Message দেখাও।

Fault Isolation: একটি Playlist নষ্ট হলে অন্য Playlist যেন ক্ষতিগ্রস্ত না হয়।

UI Consistency: Playlist Management-এর বিদ্যমান UI যতটা সম্ভব বজায় রেখে প্রয়োজনীয় পরিবর্তন করো।

৪. Firebase Integration — বাস্তবায়ন ও যাচাই

Integration Completion: বর্তমান প্রজেক্টে Firebase Integration অসম্পূর্ণ থাকলে সেটি সম্পন্ন করো এবং অ্যাপের সঙ্গে সঠিকভাবে সংযুক্ত করো।

Appropriate Services: Firebase Authentication, Realtime Database অথবা Cloud Firestore—প্রজেক্টের প্রয়োজন ও বিদ্যমান আর্কিটেকচার অনুযায়ী উপযুক্ত সার্ভিস ব্যবহার করো।

Data Storage: Playlist Data, প্রয়োজনীয় Settings এবং Remote Configuration সংরক্ষণের ব্যবস্থা করো।

Admin Controls: অ্যাডমিনের প্রয়োজনীয় কমান্ড বা কনফিগারেশন Firebase-এর মাধ্যমে পরিচালনা করা সম্ভব হলে সেই ব্যবস্থা বাস্তবায়ন করো।

Data Sync & Offline Support: Firebase-এর সঙ্গে Data Read, Write, Update এবং Sync সঠিকভাবে কাজ করছে কি না পরীক্ষা করো। ইন্টারনেট না থাকলে অ্যাপ যেন Crash না করে; Local Data Caching ও পুনরায় সংযোগ হলে Sync করার ব্যবস্থা রাখো।

Security: Firebase Security Rules এমনভাবে কনফিগার করো, যাতে অননুমোদিত ব্যক্তি সংবেদনশীল ডেটা পরিবর্তন করতে না পারে।

বাস্তব যাচাই ও নিরাপত্তা নীতি:

যে Gmail অ্যাকাউন্ট দিয়ে Google AI Studio ব্যবহার করা হচ্ছে, সেই Gmail-এর সঙ্গে Firebase স্বয়ংক্রিয়ভাবে সংযুক্ত হয়েছে বলে ধরে নেবে না।

Firebase Project, Authentication, Configuration এবং Permission বাস্তবে যাচাই করবে।

প্রয়োজনীয় Firebase Project বা Configuration অনুপস্থিত থাকলে সেগুলো তৈরির সুনির্দিষ্ট ধাপ জানাবে।

কোনো কাল্পনিক Project ID, API Key বা সফল সংযোগের দাবি করবে না।

সংবেদনশীল Credentials কখনো Source Code-এ Hardcode করবে না।

৫. About Section — Developer Information

Placement: অ্যাপের Settings বা বিদ্যমান Navigation Structure-এর মধ্যে একটি সুন্দর ও Professional About StTV Section যোগ করো।

Metadata & Copy:

App Name: StTV

Developer: Sazzad Hossen

About Text:

📺 StTV — আমার তৈরি করা প্রথম সফটওয়্যার! ❤️

🆓 সম্পূর্ণ ফ্রি ও বিজ্ঞাপনমুক্ত IPTV অ্যাপ।

🤖 টেলিগ্রাম কমান্ড দিয়েও টিভি দেখতে পারবেন।

💡 আপডেটের জন্য পরামর্শ দিতে WhatsApp করুন: @ssazzad_bd

— Sazzad Hossen

Developer Photo: About Section-এ Developer Photo প্রদর্শন করো। ছবিটি প্রজেক্টে সংযুক্ত থাকলে সেটি ব্যবহার করবে; না থাকলে ছবিটি যুক্ত করার ব্যবস্থা রাখবে।

TV-Friendly UI: ডিজাইনটি Android TV-উপযোগী, পরিচ্ছন্ন ও রিমোট দিয়ে ব্যবহারযোগ্য হবে।

Contact Action: WhatsApp Contact-কে সম্ভব হলে সঠিক WhatsApp Link হিসেবে চালু করো। শুধু @ssazzad_bd থেকে ফোন নম্বর অনুমান করবে না।

Preserve Telegram: Telegram সংক্রান্ত বিদ্যমান কার্যকর ফিচার অক্ষত রাখবে।

Ad-Free Commitment: অ্যাপটি সম্পূর্ণ ফ্রি ও বিজ্ঞাপনমুক্ত থাকবে; নতুন করে কোনো বিজ্ঞাপন SDK বা কোড যুক্ত করবে না।

৬. UI/UX ও Performance Optimization

Design Integrity: বিদ্যমান অ্যাপের মূল ডিজাইন অকারণে পরিবর্তন করবে না।

Android TV Optimization: Android TV-এর বড় স্ক্রিন, D-pad Navigation এবং Remote Control ব্যবহারের সর্বোত্তম উপযোগিতা নিশ্চিত করো।

Performance Cleanup: অপ্রয়োজনীয় Re-render, Memory Leak, দীর্ঘ Loading এবং UI Freeze-এর কারণ খুঁজে সংশোধন করো।

Feedback States: Loading, Empty Playlist, Playback Error, Network Error এবং Success State সঠিকভাবে দেখাও।

Navigation & Back Stack: অ্যাপের বিভিন্ন Screen-এর মধ্যে Navigation এবং Remote Back Button-এর সঠিক আচরণ নিশ্চিত করো।

Refactoring: একই ফিচারের একাধিক অপ্রয়োজনীয় Implementation থাকলে বিদ্যমান আচরণ বজায় রেখে পরিষ্কার ও নির্ভরযোগ্য সমাধান করো।

৭. Comprehensive Bug Testing

কোড পরিবর্তনের পর শুধু কোড লিখে থেমে যাবে না। যতটা সম্ভব Build, Static Analysis এবং বাস্তবসম্মত Test সম্পন্ন করো। নিচের বিষয়গুলো যাচাই করতে হবে:

অ্যাপ চালু ও বন্ধ হওয়া।

Full-Screen TV Display।

Android TV Remote Navigation (D-pad & Buttons)।

বাম বাটন থেকে Telegram Settings খোলা।

GitHub Playlist Download ও Parsing।

বিভিন্ন চ্যানেলে নির্বিঘ্ন Switch করা।

সমর্থিত Stream Format-এর সফল Playback।

Invalid বা Unavailable Stream-এর Error Handling।

একাধিক Playlist Add, Save, Edit ও Delete।

অ্যাপ Restart-এর পর Playlist ডেটা সংরক্ষিত থাকা।

Firebase Connection ও Data Synchronization।

About Section এবং Developer Photo রেন্ডারিং।

Internet Disconnect ও Reconnect হ্যান্ডলিং।

Memory Leak, Crash এবং অন্যান্য Runtime Error শনাক্তকরণ।

সতর্কতা: Build বা Test বাস্তবে চালানো সম্ভব না হলে সেটি পরিষ্কারভাবে উল্লেখ করবে। কোনো বাস্তব পরীক্ষা ছাড়া সবকিছু সফল হয়েছে বলে দাবি করবে না।

৮. Final Implementation Rules

প্রথমে বিদ্যমান Source Code ও Project Structure বিশ্লেষণ করবে।

সমস্যাগুলো চিহ্নিত করে প্রয়োজনীয় কোড সংশোধন করবে।

বিদ্যমান কার্যকর ফিচার, Playlist Data এবং Configuration অকারণে মুছে ফেলবে না।

অপ্রয়োজনীয়ভাবে সম্পূর্ণ অ্যাপ Rewrite করবে না।

কোনো Feature অসম্পূর্ণ রেখে সেটিকে সম্পূর্ণ বলে দেখাবে না।

প্রয়োজনীয় Dependency, Configuration ও Permission সঠিকভাবে আপডেট করবে।

Build Error, Dependency Conflict এবং Compatibility Issue থাকলে সংশোধন করবে।

Firebase Credentials বা অন্য কোনো গোপন তথ্য কোডে প্রকাশ করবে না।

বিশেষ নোট (Auto-Bypass Inactive Channels)

চ্যানেল বাইপাসিং নিয়ম:

যদি কোনো চ্যানেল সাময়িকভাবে বন্ধ থাকে বা স্ট্রিমিং না থাকে (বাফার বা স্লো হলেও সমস্যা নেই, কিন্তু একেবারে ডাটা না থাকলে), তবে চ্যানেল পরিবর্তনের সময় সেই নিষ্ক্রিয় চ্যানেলটি যেন স্বয়ংক্রিয়ভাবে Auto Bypass হয়ে যায়। অর্থাৎ চ্যানেল পরিবর্তনের সময় স্ক্রিনে ওই চ্যানেলটি আসবে না এবং পরবর্তী সক্রিয় চ্যানেলে চলে যাবে। তবে পরবর্তীতে ওই চ্যানেলটিতে স্ট্রিম ফিরে আসলে তা পুনরায় চ্যানেল তালিকায় দৃশ্যমান হবে।

পরবর্তী পদক্ষেপ (Execution Workflow)

প্রথমে বিদ্যমান কোড পুঙ্খানুপুঙ্খভাবে পরীক্ষা করো।

সরাসরি Correction ও Bug Fixing সম্পন্ন করো।

কাজ শেষে একটি সংক্ষিপ্ত সারাংশ প্রদান করো:

কী কী পরিবর্তন করা হয়েছে।

কোন সমস্যাগুলো সমাধান হয়েছে।

কোন বিষয়গুলো বাস্তবে টেস্ট করা হয়েছে।

কোন কাজের জন্য Firebase Configuration বা অতিরিক্ত ব্যবহারকারী ইনপুট প্রয়োজন।
