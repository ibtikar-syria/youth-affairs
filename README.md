# منصة شؤون الشباب

تطبيق متكامل لإدارة وعرض الفعاليات والفروع، مكوّن من:
- **واجهة أمامية**: React + Vite + Tailwind (`frontend`)
- **واجهة خلفية**: Cloudflare Workers + Hono + D1 + R2 (`backend`)

## النشر بنقرة واحدة على Cloudflare

> ملاحظة: أزرار النشر تعمل أفضل عندما يكون المستودع عامًا (Public) أو لديك صلاحية وصول مناسبة.

### 1) نشر الواجهة الخلفية (Worker API)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ibtikar-syria/youth-affairs/tree/main/backend)

بعد النشر، تأكد من ضبط:
- متغيرات البيئة: `JWT_SECRET` و `CORS_ORIGIN`
- ربط قاعدة `D1` بالـ binding: `DB`
- ربط `R2` بالـ binding: `R2_BUCKET`

### 2) نشر الواجهة الأمامية (Worker Static Assets)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ibtikar-syria/youth-affairs/tree/main/frontend)

بعد النشر، اضبط عنوان الـ API في إعدادات الواجهة الأمامية (إذا كان معرفًا عبر متغير بيئة أثناء البناء).

## التشغيل المحلي السريع

### الخلفية

```bash
cd backend
npm install
npm run dev
```

### الواجهة الأمامية

```bash
cd frontend
npm install
npm run dev
```

## ملاحظات مهمة

- ملف قاعدة البيانات موجود في `database/sqlite.sql`.
- إعدادات Cloudflare الخاصة بكل جزء موجودة في:
  - `backend/wrangler.jsonc`
  - `frontend/wrangler.jsonc`
