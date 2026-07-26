# Error Handling — Technical Documentation

## المكونات

- `BadRequestException`: input غير صحيح طبقًا لقواعد التطبيق.
- `NotFoundException`: resource مطلوب غير موجود.
- `ConflictException`: تعارض معروف مع الحالة الحالية.
- `ExceptionHandlingMiddleware`: يحول الاستثناءات إلى `ProblemDetails`.

الاستثناءات موجودة في Application حتى تستطيع الخدمات استخدامها دون الاعتماد على API. الـmiddleware موجود في API لأنه يتعامل مع HTTP.

## ترتيب التنفيذ

`ExceptionHandlingMiddleware` مسجل مبكرًا في pipeline قبل Swagger وHTTPS وCORS والـcontrollers، ولذلك يمثل شبكة الأمان النهائية للأخطاء التي تحدث بعده.

الـmiddleware:

1. يستدعي الجزء التالي من pipeline.
2. يمسك الاستثناء.
3. يحدد status وtitle وRFC type.
4. يضيف `traceId`.
5. يسجل الاستثناءات غير المتوقعة فقط باستخدام `ILogger`.
6. يعيد رسالة عامة لـ500 ولا يعيد `InnerException` أو stack trace.

## إضافة خطأ متوقع جديد

لا تنشئ exception جديدًا إلا إذا كان له معنى وHTTP mapping مختلف أو واضح.

1. أضف exception صغيرًا في `Application/Exceptions`.
2. أضف mapping محددًا في switch داخل `ExceptionHandlingMiddleware`.
3. لا تضع `try/catch` مكررًا في كل service method.
4. استخدم `try/catch` محليًا فقط عندما يمكن ترجمة خطأ تقني معروف إلى معنى business واضح.
5. حدّث التوثيق الوظيفي عند ظهور status code جديد للمستهلك.
