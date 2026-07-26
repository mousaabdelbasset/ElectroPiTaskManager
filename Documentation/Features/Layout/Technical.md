# Layout — Technical Documentation

`AppLayoutComponent` يستخدم logical CSS utilities مثل `start`, `ms`, و`border-e`، لذلك ينتقل الشريط والمسافات تلقائيًا عند تغيير `dir`.

الشعار مرجع ملف عادي `/assets/logo.png` وليس base64، وله `alt` مترجم من `brand.logoAlt`. زر New Task موجود داخل container بقيمة padding أفقية واحدة، والزر نفسه `w-full`، وهذا يضمن تساوي المسافتين في الاتجاهين.

نقطة التحول الحالية لم تتغير: الشريط ثابت على desktop ويصبح قائمة overlay تحت `lg`. لم تتغير بنية routes أو الـlayout architecture.
