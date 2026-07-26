# Error Handling — Functional Documentation

## الغرض

الـAPI يعيد الأخطاء المتوقعة وغير المتوقعة بشكل موحد باستخدام `ProblemDetails` بدل نصوص عشوائية أو stack traces.

## Status codes

| الحالة | المعنى |
|---|---|
| `400 Bad Request` | request أو business input غير صحيح |
| `404 Not Found` | المشروع أو المهمة غير موجود |
| `409 Conflict` | العملية صحيحة شكليًا لكنها تتعارض مع الحالة الحالية، مثل حذف مشروع به مهام |
| `500 Internal Server Error` | خطأ غير متوقع |

## شكل الاستجابة

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "Project with id 99 was not found.",
  "instance": "/api/projects/99",
  "traceId": "..."
}
```

احتفظ بـ`traceId` عند الإبلاغ عن مشكلة. لا تعيد استجابة `500` تفاصيل قاعدة البيانات أو stack trace للعميل.
