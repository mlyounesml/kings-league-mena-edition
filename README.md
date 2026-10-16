# Kings League: MENA Edition 🏆

7v7 arcade top-down. Dark + neon gold/blue. Phaser 3 + TS + Vite.

## تشغيل
```bash
npm i
npm run dev
```

## تحكم
- PC: WASD/أسهم حركة | K تمرير/قطع | Space تسديد/تدخل (ضغط مطول = شحن) | C كارت سري
- موبايل: joystick يسار + PASS/SHOOT يمين + زر 🃏 لامع للكارت (double-tap للتأكيد)

## قواعد (Arcade Adaptation من الرسمي)
- Kickoff Run: كرة منتصف، انطلاق من خط المرمى عند الصافرة.
- Scale-Up: تبدأ 1v1+GK أول 30 ثانية ثم 7v7 (الرسمي: +1 كل دقيقة حتى دقيقة 5).
- Secret Cards نافذة 30-150s فقط، cooldown مشترك 90s + خاص 150s، منع x4 stacking، حظر استخدام هجومي لو متقدم +3، pity للخاسر 0.7x.
- تعادل في النهاية = Shootout انفراد 5 ثوان من المنتصف. تقدم = Matchball (الهدف القادم يكسب).
- أصفر = إقصاء مؤقت، ممنوع طرد حارس بالكارت.

## هيكل
```
src/data/leagues.json      بيانات دوريات/أندية/رؤساء قابلة للتوسعة
src/core/GameStateMachine.ts  MainMenu/TeamSelect/MatchLive/Shootout/GameOver
src/systems/SecretCardSystem.ts خوارزمية الكروت + توازن
src/systems/InputManager.ts   توحيد كيبورد + لمس بدون تداخل
src/systems/TeamAI.ts         تمركز 7 لاعبين + FSM
src/scenes/*.ts               مشاهد Phaser
```

## إضافة دوري جديد
أضف object في `leagues.json` مع `locked:false`. لا تلمس الكود.

## أمان
لا تلصق PAT في الشات. استخدم `gh auth login` ثم:
```bash
git init -b main && git add . && git commit -m "feat: MENA Kings League v1"
gh repo create kings-league-mena-edition --public --source=. --push
```
