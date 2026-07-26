# Projects — Technical Documentation

## مزامنة إنشاء المشروع في Angular

كان `<form>` في `ProjectFormComponent` يستخدم `(ngSubmit)` من غير ربطه بـ`FormGroup`. نتيجة ذلك كانت native form submission وإعادة تحميل الصفحة قبل تشغيل مسار Angular بصورة صحيحة، ولذلك لم يظهر المشروع الجديد.

الإصلاح يربط النموذج بـ`[formGroup]="form"` ويستخدم `formControlName`. بعد استلام `ProjectResponse` تنفذ صفحة المشاريع immutable upsert: تضع المشروع الراجع أولًا وتحذف أي نسخة تحمل `id` نفسه. هذا يفعّل OnPush/signals فورًا ويمنع التكرار بعد refresh، ثم تُغلق النافذة ويُصفّر state التعديل وتظهر رسالة النجاح.

## مسار الطلب

```text
ProjectsController
    -> IProjectService / ProjectService
        -> IProjectRepository / ProjectRepository
            -> TaskManagerDbContext
                -> SQL Server
```

الـController مسؤول عن HTTP فقط. قواعد العمل والـmapping موجودان في `ProjectService`. استعلامات EF Core والحفظ موجودان في `ProjectRepository`.

## الملفات المهمة

| الطبقة               | الملفات                                                     | المسؤولية                               |
| -------------------- | ----------------------------------------------------------- | --------------------------------------- |
| Domain               | `Domain/Entities/Project.cs`                                | شكل كيان المشروع والعلاقة مع المهام     |
| Application DTOs     | `Application/DTOs/Projects/*`                               | عقود الإدخال والإخراج التي يراها الـAPI |
| Application Contract | `Application/Interfaces/Services/IProjectService.cs`        | العمليات التي توفرها الخدمة             |
| Application Logic    | `Application/Services/ProjectService.cs`                    | قواعد العمل والـmanual mapping          |
| Repository Contract  | `Application/Interfaces/Repositories/IProjectRepository.cs` | العمليات المطلوبة من التخزين            |
| Infrastructure       | `Infrastructure/Repositories/ProjectRepository.cs`          | تنفيذ EF Core                           |
| API                  | `Api/Controllers/ProjectsController.cs`                     | routes وstatus codes                    |

## لماذا توجد DTOs؟

الـController لا يعيد `Project` مباشرة. هذا يمنع كشف navigation properties أو تغيير عقد الـAPI بالخطأ عند تعديل كيان قاعدة البيانات.

- `CreateProjectRequest` و`UpdateProjectRequest` يقبلان فقط الحقول التي يستطيع العميل تعديلها.
- `ProjectResponse` يستخدم للقوائم والإنشاء.
- `ProjectDetailsResponse` يضيف قائمة المهام عند طلب مشروع واحد.

التحويل من Entity إلى DTO مكتوب يدويًا داخل الخدمة حتى يكون واضحًا ولا توجد مكتبة mapping مخفية.

## القراءة من قاعدة البيانات

- `GetAllAsync` يستخدم `AsNoTracking` لأن البيانات للقراءة فقط.
- `GetByIdWithTasksAsync` يستخدم `Include` فقط عندما تكون المهام مطلوبة.
- `ExistsAsync` و`HasTasksAsync` يستخدمان `AnyAsync` حتى يتم الفحص داخل SQL.
- لا يخرج `IQueryable` من الـrepository.
- كل العمليات async وتستقبل `CancellationToken`.

## الحذف والحماية من التعارض

تتحقق الخدمة أولًا بواسطة `HasTasksAsync`. إذا وجدت مهام ترمي `ConflictException`.

هناك احتمال نادر أن تضيف request أخرى مهمة بين الفحص والحذف. علاقة قاعدة البيانات تستخدم `DeleteBehavior.Restrict`، ولذلك يمسك `ProjectRepository` فشل الحذف الناتج من EF ويترجمه أيضًا إلى `ConflictException`. هذه الـ`try/catch` مقصودة لأنها تعالج فشل persistence معروفًا وليست تكرارًا في كل method.

## خطوات تعديل الـFeature

عند إضافة حقل قابل للتعديل:

1. عدّل Entity وEF configuration والمigration فقط إذا كان تغيير قاعدة البيانات مطلوبًا.
2. أضف الحقل إلى request/response المناسب، مع Data Annotation تطابق قيد EF.
3. حدّث الـmanual mapping في `ProjectService`.
4. حدّث التوثيق الوظيفي والتقني.
5. شغّل build واختبر create/read/update.

لا تضف بيانات إلى Entity response مباشرة، ولا تضع business rule داخل الـController أو الـrepository.
