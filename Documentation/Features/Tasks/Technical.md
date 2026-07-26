# Tasks — Technical Documentation

## تنفيذ الواجهة الحالي

- `TaskFormComponent` يُبقي control الحالة داخل النموذج، لكنه يخفيه أثناء الإنشاء ويرسل `ToDo` صراحة. أثناء التعديل يظهر الحقل بصورة طبيعية.
- `DateFormatterService` يبني قيمة `datetime-local` من أجزاء التقويم المحلي بدل التحويل عبر UTC، لمنع اختلاف اليوم بسبب المنطقة الزمنية.
- validator تاريخ الاستحقاق يقارن ببداية اليوم المحلي. عند تعديل مهمة متأخرة يقبل القيمة الأصلية بالدقة التي يعرضها input فقط.
- `ProjectDetailsPageComponent` يستخدم Angular CDK `CdkDropListGroup` و`CdkDropList` و`CdkDrag`. النقل بين الأعمدة يستدعي PATCH الحالي ولا ينشئ ترتيبًا داخل العمود.
- `pendingStatusTaskIds` يمنع إرسال طلب حالة ثانٍ للمهمة نفسها أثناء انتظار الطلب الأول.
- في السحب، تُحدّث signal الخاصة بالمشروع أولًا. عند الخطأ تُستعاد نسخة المهمة الأصلية؛ أما قائمة الحالة فتنتظر نجاح الـAPI قبل تحديث الواجهة.

## تحقق الـBackend من التاريخ

`TaskItemService` يرفض تاريخًا قبل `DateTime.Today` عند الإنشاء. في `PUT` يسمح بتاريخ قديم فقط عندما يطابق التاريخ التاريخي المخزن حتى مستوى الدقيقة، لأن `datetime-local` لا ينقل الثواني. القاعدة موجودة في Application service وليست في Controller أو Repository، ولم تتطلب migration.

## مسار الطلب

```text
TasksController
    -> ITaskItemService / TaskItemService
        -> ITaskItemRepository / TaskItemRepository
        -> IProjectRepository (للتحقق من المشروع)
            -> TaskManagerDbContext
                -> SQL Server
```

`TaskItemService` يعتمد على repository المهام وعلى `IProjectRepository`. هذا ضروري لتطبيق قاعدة أن كل مهمة يجب أن ترتبط بمشروع موجود.

## الملفات المهمة

| الطبقة            | الملفات                                                         | المسؤولية                               |
| ----------------- | --------------------------------------------------------------- | --------------------------------------- |
| Domain            | `Domain/Entities/TaskItem.cs` و`Domain/Enums/TaskItemStatus.cs` | الكيان والحالات                         |
| Application DTOs  | `Application/DTOs/Tasks/*`                                      | request/response contracts              |
| Validation        | `Application/Validation/NotDefaultDateAttribute.cs`             | منع `DateTime` الافتراضي دون منع الماضي |
| Application Logic | `Application/Services/TaskItemService.cs`                       | validation وقواعد المشروع والـmapping   |
| Infrastructure    | `Infrastructure/Repositories/TaskItemRepository.cs`             | EF Core queries والحفظ                  |
| API               | `Api/Controllers/TasksController.cs`                            | routes وقراءة فلتر الحالة               |

## الـValidation

قيود Data Annotations تطابق EF configuration:

- `Title`: required وmaximum 200.
- `Description`: maximum 2000.
- `ProjectId`: من 1 إلى أكبر `int`.
- `Status`: `EnumDataType`.
- `DueDate`: `NotDefaultDate`.

`JsonStringEnumConverter` في `Program.cs` يجعل JSON يستخدم أسماء الحالات ويرفض الأرقام. فلتر `status` يُقرأ كنص داخل الـController ثم يُطابق أسماء enum فقط؛ هذا يمنع قبول `?status=0`.

تكرر الخدمة فحوص قواعد العمل المهمة، مثل العنوان غير المكوّن من مسافات ووجود المشروع، لأن الخدمة قد تُستدعى مستقبلًا من مدخل غير HTTP.

## الاستعلام والفلترة

`TaskItemRepository.GetAllAsync` يبني query داخليًا:

1. يبدأ بـ`AsNoTracking`.
2. يضيف `Where` فقط عند وجود status.
3. ينفذ `ToListAsync` بعد الفلترة والترتيب.

بذلك تنفذ SQL Server الفلترة، ولا يتم تحميل كل المهام في الذاكرة أولًا. الـ`IQueryable` لا يخرج من الـrepository.

`GetByProjectIdAsync` يضيف `Where(task => task.ProjectId == projectId)` قبل `ToListAsync`.

## التعديل

في `PUT`:

1. تتحقق الخدمة من id وبيانات request.
2. تحمل المهمة أو ترمي `NotFoundException`.
3. تتحقق من وجود المشروع الجديد حتى لو تغير `ProjectId`.
4. تنقل القيم يدويًا إلى Entity.
5. يحدّث repository الصف ويحفظ.

في `PATCH status` يتم تغيير `Status` فقط، بينما تبقى باقي قيم Entity كما تم تحميلها.

## إضافة حالة جديدة

1. أضف القيمة إلى `TaskItemStatus`.
2. راجع أي frontend يعتمد على قائمة الحالات.
3. حدّث التوثيق والأمثلة.
4. اختبر JSON وفلتر query.

التخزين الحالي للحالة رقم صحيح بسبب `HasConversion<int>()`. إضافة قيمة enum جديدة لا تحتاج migration ما دام نوع العمود لم يتغير.
