# ElectroPi Task Manager Documentation

## Layout

- [Functional Documentation](Features/Layout/Functional.md)
- [Technical Documentation](Features/Layout/Technical.md)

هذا المجلد هو نقطة البداية لفهم النظام قبل تعديل الكود.

توثيق واجهة Angular موجود في
[`FrontEnd/Documentation`](../FrontEnd/Documentation/README.md).

## التوثيق حسب الـFeature

### Projects

- [Functional Documentation](Features/Projects/Functional.md): ما الذي تفعله إدارة المشاريع وكيف تُستخدم الـendpoints.
- [Technical Documentation](Features/Projects/Technical.md): مسار التنفيذ، الملفات، قواعد العمل، وكيفية التعديل.

### Tasks

- [Functional Documentation](Features/Tasks/Functional.md): ما الذي تفعله إدارة المهام والفلترة وتغيير الحالة.
- [Technical Documentation](Features/Tasks/Technical.md): مسار التنفيذ، الـvalidation، الاستعلامات، وكيفية التطوير.

### Error Handling

- [Functional Documentation](Features/ErrorHandling/Functional.md): شكل الأخطاء الذي يحصل عليه مستهلك الـAPI.
- [Technical Documentation](Features/ErrorHandling/Technical.md): الاستثناءات والـmiddleware وكيفية إضافة خطأ متوقع جديد.

## نظرة عامة

- [Technical Overview](Architecture/Technical-Overview.md): الطبقات، الاعتماديات، دورة الطلب، وإرشادات إضافة feature جديدة.

## تشغيل المشروع

1. تأكد أن SQL Server متاح وأن `DefaultConnection` في `ElectroPi.TaskManager.Api/appsettings.json` مناسب لجهازك.
2. طبّق الـmigration الموجودة فقط إذا لم تكن قاعدة البيانات قد أُنشئت:

   ```powershell
   dotnet ef database update --project ElectroPi.TaskManager.Infrastructure --startup-project ElectroPi.TaskManager.Api
   ```

3. شغّل الـAPI:

   ```powershell
   dotnet run --project ElectroPi.TaskManager.Api
   ```

4. في بيئة Development افتح `/swagger` لتجربة الـendpoints.

لا توجد Authentication أو Authorization في النسخة الحالية.
