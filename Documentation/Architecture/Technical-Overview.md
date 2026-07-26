# Technical Overview

## الطبقات والاعتماديات

```text
Api -> Application
Api -> Infrastructure
Infrastructure -> Application
Infrastructure -> Domain
Application -> Domain
Domain -> no project references
```

- **Domain**: Entities وEnums فقط، ولا يعرف EF Core أو HTTP.
- **Application**: DTOs، interfaces، services، business rules، manual mapping، والاستثناءات المتوقعة.
- **Infrastructure**: EF Core DbContext، configurations، migrations، وتنفيذ repositories.
- **Api**: Controllers، middleware، dependency injection، CORS، JSON، وSwagger.

## دورة الـrequest

1. ASP.NET Core يستقبل الطلب ويحوّل JSON إلى request DTO.
2. `[ApiController]` يطبق Data Annotation validation تلقائيًا.
3. الـController يستدعي service ويمرر `CancellationToken`.
4. الـService يطبق قواعد العمل ويحوّل DTO إلى Entity أو Entity إلى DTO.
5. الـRepository ينفذ EF Core query أو save.
6. الـController يعيد status code المناسب.
7. إذا حدث exception متوقع، يحوله الـmiddleware إلى `ProblemDetails`.

## الإعدادات المشتركة

- repositories والخدمات مسجلة `Scoped` مثل `TaskManagerDbContext`.
- Swagger متاح في Development.
- enums تخرج وتدخل كنص، والقيم الرقمية في JSON مرفوضة.
- CORS يسمح فقط بـ`http://localhost:4200` و`http://localhost:5173`.
- HTTPS redirection مفعّل.
- لا توجد Authentication أو Authorization.

## Checklist لإضافة Feature جديدة

1. افهم هل تحتاج Entity أو تغيير قاعدة البيانات. لا تعدل migration قديمة.
2. أضف request/response DTOs بدل كشف Entities.
3. ضع Data Annotations مساوية لقيود EF الفعلية.
4. أضف repository interface مركزًا على الـfeature، وليس Generic Repository.
5. نفذ service interface وservice لقواعد العمل والـmanual mapping.
6. نفذ repository باستخدام async و`CancellationToken`.
7. استخدم `AsNoTracking` للقراءة، ونفذ الفلترة في SQL.
8. أضف Controller رفيعًا يتعامل مع HTTP فقط.
9. سجل interface والتنفيذ كـScoped في `Program.cs`.
10. أنشئ `Functional.md` يشرح ما تفعله الـfeature.
11. أنشئ `Technical.md` يشرح المسار والملفات والقرارات وكيفية التعديل.
12. شغّل restore/build واختبر status codes وحالات الفشل.

## ما لا نستخدمه عمدًا

لا يستخدم المشروع MediatR أو CQRS أو AutoMapper أو FluentValidation أو Generic Repository أو Unit of Work أو Result wrappers. هذا يحافظ على مسار واضح يمكن لمطور junior تتبعه مباشرة.
