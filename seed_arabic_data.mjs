import crypto from 'crypto';

const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = process.env.VITE_SUPABASE_PROJECT_ID || 'scevazmwmcranvftgcpx';

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Query failed (${res.status}): ${text}\nSQL: ${sql.slice(0, 300)}...`);
  }
  return await res.json();
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function seed() {
  console.log('🚀 Starting comprehensive Arabic database seeding for Al-Saae Journey...');

  // ==========================================
  // 1. STAGES (المراحل الدراسية)
  // ==========================================
  console.log('📚 1. Creating Stages (المراحل الدراسية)...');
  const stage1Id = '11111111-1111-4111-8111-111111111111'; // الصف الأول الثانوي
  const stage2Id = '22222222-2222-4222-8222-222222222222'; // الصف الثاني الثانوي
  const stage3Id = '33333333-3333-4333-8333-333333333333'; // الصف الثالث الثانوي (الثانوية العامة)
  const stage4Id = '44444444-4444-4444-8444-444444444444'; // الصف الثالث الإعدادي (الشهادة الإعدادية)

  await query(`
    INSERT INTO public.stages (id, name, description, thumbnail_url)
    VALUES
      ('${stage3Id}', 'الصف الثالث الثانوي (الثانوية العامة)', 'شرح كامل وتدريبات ومراجعات مكثفة للشهادة الثانوية العامة 2026', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80'),
      ('${stage2Id}', 'الصف الثاني الثانوي', 'منهج اللغة العربية المتكامل للصف الثاني الثانوي - الترم الأول والثاني', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80'),
      ('${stage1Id}', 'الصف الأول الثانوي', 'تأسيس النظام الحديث في فروع اللغة العربية للصف الأول الثانوي', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80'),
      ('${stage4Id}', 'الصف الثالث الإعدادي (الشهادة الإعدادية)', 'كورس الإتقان في النحو والقراءة والنصوص للشهادة الإعدادية', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      thumbnail_url = EXCLUDED.thumbnail_url;
  `);

  // ==========================================
  // 2. SUBJECTS (فروع اللغة العربية)
  // ==========================================
  console.log('📖 2. Creating Arabic Subjects (فروع اللغة العربية)...');
  const subjGrammarId = 'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa'; // النحو والصرف
  const subjRhetoricId = 'bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb'; // البلاغة والنقد
  const subjLiteratureId = 'cccccccc-3333-4ccc-8ccc-cccccccccccc'; // الأدب والنصوص
  const subjReadingId = 'dddddddd-4444-4ddd-8ddd-dddddddddddd'; // القراءة والقصة
  const subjRevisionId = 'eeeeeeee-5555-4eee-8eee-eeeeeeeeeeee'; // المراجعات الشاملة

  await query(`
    INSERT INTO public.subjects (id, name, description, thumbnail_url)
    VALUES
      ('${subjGrammarId}', 'النحو والإعراب التطبيقي', 'شرح قواعد النحو والصرف وتدريبات الإعراب من الصفر حتى أعلى مستويات النظام الحديث', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80'),
      ('${subjRhetoricId}', 'البلاغة العربية والتذوق الأدبي', 'علم البيان والبديع والمعاني وتحليل الصور البيانية والمحسنات', 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&auto=format&fit=crop&q=80'),
      ('${subjLiteratureId}', 'الأدب وتاريخ المدارس الأدبية', 'مدارس الشعر الحديث: الإحياء والبعث، الاتجاه الوجداني، أبوللو، المهاجر، والواقعية', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80'),
      ('${subjReadingId}', 'النصوص المتحررة والقراءة النقدية', 'مهارات استخراج الفكرة الرئيسة والمغزى الضمني والعلاقات بين الجمل', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'),
      ('${subjRevisionId}', 'المراجعة النهائية وليالي الامتحان', 'ورش حل النماذج الشاملة وتوقعات امتحانات الثانوية العامة', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      thumbnail_url = EXCLUDED.thumbnail_url;
  `);

  // ==========================================
  // 3. 5 ARABIC COURSES (3 PAID & 2 FREE)
  // ==========================================
  console.log('🎓 3. Creating 5 Arabic Courses (3 Paid, 2 Free)...');
  const course1Id = 'c1111111-1111-4111-8111-111111111111'; // Paid: النحو الشامل 3rd Sec
  const course2Id = 'c2222222-2222-4222-8222-222222222222'; // Paid: البلاغة والأدب المكثفة 3rd Sec
  const course3Id = 'c3333333-3333-4333-8333-333333333333'; // Free: كورس التأسيس المجاني
  const course4Id = 'c4444444-4444-4444-8444-444444444444'; // Paid: نصوص وأدب 2nd Sec
  const course5Id = 'c5555555-5555-4555-8555-555555555555'; // Free: كبسولات البلاغة السريعة

  await query(`
    INSERT INTO public.courses (
      id, stage_id, subject_id, title, description, thumbnail_url,
      status, is_paid, price_piastres, discount_price_piastres,
      is_featured, featured_at, stage_ids, subject_ids
    )
    VALUES
      (
        '${course1Id}',
        '${stage3Id}',
        '${subjGrammarId}',
        'كورس النحو الشامل للثانوية العامة (من الصفر إلى الدرجة النهائية)',
        'شرح تفصيلي لجميع وحدات النحو السبعة مع بنك أسئلة يحتوي على أكثر من 1500 فكرة امتحانية متحررة طبقاً لأحدث مواصفات الثانوية العامة.',
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
        'published',
        true,
        35000,
        25000,
        true,
        now(),
        ARRAY['${stage3Id}']::uuid[],
        ARRAY['${subjGrammarId}']::uuid[]
      ),
      (
        '${course2Id}',
        '${stage3Id}',
        '${subjRhetoricId}',
        'دورة البلاغة والأدب المكثفة وحل النصوص المتحررة',
        'إتقان الصور المركبة والممتدة والمحسنات البديعية وتطبيقات شاملة على جميع المدارس الشعرية والنثرية.',
        'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&auto=format&fit=crop&q=80',
        'published',
        true,
        28000,
        20000,
        true,
        now(),
        ARRAY['${stage3Id}']::uuid[],
        ARRAY['${subjRhetoricId}', '${subjLiteratureId}']::uuid[]
      ),
      (
        '${course3Id}',
        '${stage1Id}',
        '${subjGrammarId}',
        'دورة تأسيس النحو والإعراب الذهبية لجميع المراحل (مجاناً)',
        'كورس تأسيسي مجاني 100% يغطي أساسيات الجملة الاسمية والفعلية، علامات الإعراب الأصلية والفرعية، والمفاهيم النحوية الأساسية.',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
        'published',
        false,
        NULL,
        NULL,
        true,
        now(),
        ARRAY['${stage1Id}', '${stage2Id}', '${stage3Id}', '${stage4Id}']::uuid[],
        ARRAY['${subjGrammarId}']::uuid[]
      ),
      (
        '${course4Id}',
        '${stage2Id}',
        '${subjLiteratureId}',
        'الفرسان في اللغة العربية للصف الثاني الثانوي (الترم الأول)',
        'شرح منهج الصف الثاني الثانوي كاملاً: أعمال المصادر والمشتقات، إعراب الأفعال، والأدب الجاهلي والإسلامي والأموي.',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
        'published',
        true,
        22000,
        18000,
        false,
        null,
        ARRAY['${stage2Id}']::uuid[],
        ARRAY['${subjLiteratureId}', '${subjGrammarId}']::uuid[]
      ),
      (
        '${course5Id}',
        '${stage3Id}',
        '${subjRhetoricId}',
        'كبسولات البلاغة السريعة وفنون التذوق الأدبي (مجاناً)',
        'سلسلة فيديوهات قصيرة ومكثفة تركز على أهم الفروق البلاغية الشائعة وطرق التعامل مع أسئلة النصوص الحديثة بدون تعقيد.',
        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
        'published',
        false,
        NULL,
        NULL,
        false,
        null,
        ARRAY['${stage3Id}', '${stage2Id}']::uuid[],
        ARRAY['${subjRhetoricId}']::uuid[]
      )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      thumbnail_url = EXCLUDED.thumbnail_url,
      status = EXCLUDED.status,
      is_paid = EXCLUDED.is_paid,
      price_piastres = EXCLUDED.price_piastres,
      discount_price_piastres = EXCLUDED.discount_price_piastres,
      is_featured = EXCLUDED.is_featured;
  `);

  // ==========================================
  // 4. UNITS AND LESSONS
  // ==========================================
  console.log('📑 4. Creating Course Units & Rich Arabic Lessons...');
  const u11 = '11111111-0001-4111-8111-111111111111';
  const u12 = '11111111-0002-4111-8111-111111111111';
  const u13 = '11111111-0003-4111-8111-111111111111';
  const u14 = '11111111-0004-4111-8111-111111111111';

  const u21 = '22222222-0001-4222-8222-222222222222';
  const u22 = '22222222-0002-4222-8222-222222222222';

  const u31 = '33333333-0001-4333-8333-333333333333';
  const u32 = '33333333-0002-4333-8333-333333333333';

  const u41 = '44444444-0001-4444-8444-444444444444';
  const u51 = '55555555-0001-4555-8555-555555555555';

  const unitsData = [
    { id: u11, course_id: course1Id, title: 'الوحدة الأولى: قواعد النطق والإملاء وهمزة القطع والوصل', position: 1 },
    { id: u12, course_id: course1Id, title: 'الوحدة الثانية: المشتقات العاملة والمصادر وأسماء التفضيل', position: 2 },
    { id: u13, course_id: course1Id, title: 'الوحدة الثالثة: نواسخ الجملة الاسمية والضمائر', position: 3 },
    { id: u14, course_id: course1Id, title: 'الوحدة الخامسة: إعراب وبناء الأفعال وتوكيد الفعل بالنون', position: 4 },

    { id: u21, course_id: course2Id, title: 'الوحدة الأولى: علم البيان (التشبيه، الاستعارة، الكناية، المجاز)', position: 1 },
    { id: u22, course_id: course2Id, title: 'الوحدة الثانية: مدرسة الإحياء والبعث وجيل التطوير', position: 2 },

    { id: u31, course_id: course3Id, title: 'المستوى الأول: أساسيات الإعراب وأنواع الكلمة والجملة', position: 1 },
    { id: u32, course_id: course3Id, title: 'المستوى الثاني: المنصوبات والمجرورات وحروف الجر الزائدة', position: 2 },

    { id: u41, course_id: course4Id, title: 'الوحدة الأولى: نصب وجزم الفعل المضارع واقتران جواب الشرط بالفاء', position: 1 },
    { id: u51, course_id: course5Id, title: 'كبسولات التذوق الفني: الفروق البلاغية الدقيقة', position: 1 }
  ];

  for (const u of unitsData) {
    await query(`
      INSERT INTO public.units (id, course_id, title, position)
      VALUES ('${u.id}', '${u.course_id}', ${escapeSql(u.title)}, ${u.position})
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, position = EXCLUDED.position;
    `);
  }

  // Detailed Lessons
  const lessonsData = [
    { id: '11111111-1001-4111-8111-111111111111', unit_id: u11, title: 'الدرس 1: همزة القطع وألف الوصل والفروق الإملائية الدقيقة', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },
    { id: '11111111-1002-4111-8111-111111111111', unit_id: u11, title: 'الدرس 2: اللام الشمسية والقمرية وحالات (إلا وإلا) و(ثم وثمة)', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 2 },
    { id: '11111111-1003-4111-8111-111111111111', unit_id: u12, title: 'الدرس 3: إعمال اسم الفاعل وصيغ المبالغة وإعراب المعمول', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },
    { id: '11111111-1004-4111-8111-111111111111', unit_id: u12, title: 'الدرس 4: اسم المفعول واسم التفضيل وحالات المطابقة الأربعة', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 2 },
    { id: '11111111-1005-4111-8111-111111111111', unit_id: u13, title: 'الدرس 5: المبتدأ والخبر وحالات تقديم الخبر وحذف المبتدأ والخبر وجوباً', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },
    { id: '11111111-1006-4111-8111-111111111111', unit_id: u13, title: 'الدرس 6: كاد وأخواتها وأفعال المقاربة والرجاء والشروع', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 2 },
    { id: '11111111-1007-4111-8111-111111111111', unit_id: u14, title: 'الدرس 7: جزم المضارع في جواب الطلب وأدوات الشرط الجازمة وغير الجازمة', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },

    { id: '22222222-1001-4222-8222-222222222222', unit_id: u21, title: 'الدرس 1: التشبيه المفرد والتشبيه التمثيلي والضمني وسر الجمال', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },
    { id: '22222222-1002-4222-8222-222222222222', unit_id: u21, title: 'الدرس 2: الاستعارة التصريحية والمكنية والصورة المركبة والمبتكرة', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 2 },
    { id: '22222222-1003-4222-8222-222222222222', unit_id: u22, title: 'الدرس 3: مدرسة الإحياء والبعث ورائدهم محمود سامي البارودي وتلاميذ شوقي', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },

    { id: '33333333-1001-4333-8333-333333333333', unit_id: u31, title: 'الدرس 1: كيف تعرب أي كلمة في اللغة العربية بسهولة من الصفر؟', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },
    { id: '33333333-1002-4333-8333-333333333333', unit_id: u31, title: 'الدرس 2: المرفوعات الأساسية (الفاعل، نائب الفاعل، المبتدأ، الخبر)', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 2 },
    { id: '33333333-1003-4333-8333-333333333333', unit_id: u32, title: 'الدرس 3: المفاعيل الخمسة (المفعول به، المطلق، لأجله، فيه، ومعه)', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },

    { id: '44444444-1001-4444-8444-444444444444', unit_id: u41, title: 'الدرس 1: أدوات نصب الفعل المضارع وحروف الجزم وتوكيد الفعل', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 },
    { id: '55555555-1001-4555-8555-555555555555', unit_id: u51, title: 'كبسولة 1: سر التفرقة بين الاستعارة التصريحية والمجاز المرسل في دقيقة', video_provider: 'youtube', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', position: 1 }
  ];

  for (const l of lessonsData) {
    await query(`
      INSERT INTO public.lessons (id, unit_id, title, video_provider, video_url, position)
      VALUES ('${l.id}', '${l.unit_id}', ${escapeSql(l.title)}, '${l.video_provider}'::video_provider, '${l.video_url}', ${l.position})
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, video_url = EXCLUDED.video_url;
    `);
  }

  // ==========================================
  // 5. POINTS SYSTEM & THRESHOLDS
  // ==========================================
  console.log('⚙️ 5. Configuring Points System & Thresholds...');
  const pointsConfig = [
    { key: 'lesson_progress', points: 15 },
    { key: 'quiz_passed', points: 50 },
    { key: 'assignment_graded', points: 35 },
    { key: 'course_purchase', points: 100 },
    { key: 'bundle_purchase', points: 250 },
    { key: 'daily_streak', points: 20 },
    { key: 'perfect_quiz', points: 100 }
  ];

  for (const pc of pointsConfig) {
    await query(`
      INSERT INTO public.points_config (event_key, points_value)
      VALUES ('${pc.key}', ${pc.points})
      ON CONFLICT (event_key) DO UPDATE SET points_value = EXCLUDED.points_value;
    `);
  }

  const thresholds = [
    { kind: 'courses', threshold_count: 1, points_value: 100 },
    { kind: 'courses', threshold_count: 2, points_value: 250 },
    { kind: 'courses', threshold_count: 3, points_value: 500 },
    { kind: 'courses', threshold_count: 5, points_value: 1000 },
    { kind: 'bundles', threshold_count: 1, points_value: 150 },
    { kind: 'bundles', threshold_count: 2, points_value: 350 }
  ];

  for (const t of thresholds) {
    await query(`
      INSERT INTO public.points_purchase_thresholds (kind, threshold_count, points_value)
      VALUES ('${t.kind}', ${t.threshold_count}, ${t.points_value})
      ON CONFLICT (kind, threshold_count) DO UPDATE SET points_value = EXCLUDED.points_value;
    `);
  }

  // ==========================================
  // 6. LEVELS (المستويات والرتب)
  // ==========================================
  console.log('🏆 6. Creating Leaderboard Levels (المستويات والرتب)...');
  const levelsData = [
    { id: '10000000-0000-4000-8000-000000000001', name: 'طالب مبتدئ 🥉', min_points: 0, order_index: 1, icon_url: 'https://api.iconify.design/lucide:shield.svg?color=%23cd7f32' },
    { id: '10000000-0000-4000-8000-000000000002', name: 'طالب مجتهد 🥈', min_points: 150, order_index: 2, icon_url: 'https://api.iconify.design/lucide:shield-check.svg?color=%23c0c0c0' },
    { id: '10000000-0000-4000-8000-000000000003', name: 'طالب متميز 🥇', min_points: 400, order_index: 3, icon_url: 'https://api.iconify.design/lucide:award.svg?color=%23ffd700' },
    { id: '10000000-0000-4000-8000-000000000004', name: 'فارس اللغة العربية 💎', min_points: 800, order_index: 4, icon_url: 'https://api.iconify.design/lucide:gem.svg?color=%2300bfff' },
    { id: '10000000-0000-4000-8000-000000000005', name: 'سفير الفصاحة والبيان 👑', min_points: 1500, order_index: 5, icon_url: 'https://api.iconify.design/lucide:crown.svg?color=%23e0a96d' },
    { id: '10000000-0000-4000-8000-000000000006', name: 'أسطورة الساعي 🏆', min_points: 2500, order_index: 6, icon_url: 'https://api.iconify.design/lucide:trophy.svg?color=%23ff4500' }
  ];

  for (const lvl of levelsData) {
    await query(`
      INSERT INTO public.levels (id, name, min_points, order_index, icon_url)
      VALUES ('${lvl.id}', ${escapeSql(lvl.name)}, ${lvl.min_points}, ${lvl.order_index}, '${lvl.icon_url}')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, min_points = EXCLUDED.min_points, order_index = EXCLUDED.order_index;
    `);
  }

  // ==========================================
  // 7. BADGES (الأوسمة والشارات)
  // ==========================================
  console.log('🎖️ 7. Creating Competitive Badges & Conditions (الأوسمة والشارات)...');
  const badge1Id = 'b1000000-0000-4000-8000-000000000001';
  const badge2Id = 'b1000000-0000-4000-8000-000000000002';
  const badge3Id = 'b1000000-0000-4000-8000-000000000003';
  const badge4Id = 'b1000000-0000-4000-8000-000000000004';
  const badge5Id = 'b1000000-0000-4000-8000-000000000005';
  const badge6Id = 'b1000000-0000-4000-8000-000000000006';

  const badges = [
    { id: badge1Id, name: 'وسام الانطلاقة الأولى 🚀', description: 'إتمام أول درس بنجاح على منصة الساعي التعليمية', points: 50, icon: 'https://api.iconify.design/lucide:rocket.svg?color=%233b82f6' },
    { id: badge2Id, name: 'عبقري النحو والإعراب 🧠', description: 'اجتياز 3 اختبارات نحوية بنجاح وبدرجات ممتازة', points: 100, icon: 'https://api.iconify.design/lucide:brain.svg?color=%238b5cf6' },
    { id: badge3Id, name: 'المواظب الذهبي ⚡', description: 'مشاهدة وإتمام 5 دروس تفاعلية في اللغة العربية', points: 150, icon: 'https://api.iconify.design/lucide:zap.svg?color=%23eab308' },
    { id: badge4Id, name: 'فارس البلاغة والأدب 📜', description: 'إتقان دروس البلاغة العربية والصور البيانية', points: 200, icon: 'https://api.iconify.design/lucide:scroll.svg?color=%2310b981' },
    { id: badge5Id, name: 'جامع النقاط الماسي 💎', description: 'تخطي حاجز 500 نقطة في لوحة شرف المنصة', points: 300, icon: 'https://api.iconify.design/lucide:gem.svg?color=%2306b6d4' },
    { id: badge6Id, name: 'صقر الثانوية العامة 🦅', description: 'الاشتراك في كورسات المراجعة الشاملة للثانوية', points: 500, icon: 'https://api.iconify.design/lucide:award.svg?color=%23f97316' }
  ];

  for (const b of badges) {
    await query(`
      INSERT INTO public.badges (id, name, description, points_reward, is_active, icon_url)
      VALUES ('${b.id}', ${escapeSql(b.name)}, ${escapeSql(b.description)}, ${b.points}, true, '${b.icon}')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, points_reward = EXCLUDED.points_reward;
    `);
  }

  // ==========================================
  // 8. PAYMENT GATEWAYS & METHODS
  // ==========================================
  console.log('💳 8. Creating Payment Gateways & Manual Payment Methods...');
  const paymobGwId = 'a1000000-0000-4000-8000-000000000001';
  const fawaterakGwId = 'a1000000-0000-4000-8000-000000000003';

  await query(`
    INSERT INTO public.payment_gateways (id, gateway_key, display_name, is_enabled, type, scope)
    VALUES
      ('${paymobGwId}', 'paymob', 'باي موب (PayMob Egypt)', true, 'automatic', 'courses_and_bundles'),
      ('${fawaterakGwId}', 'fawaterak', 'فواتيرك (Fawaterak)', true, 'automatic', 'courses_and_bundles')
    ON CONFLICT (gateway_key) DO UPDATE SET is_enabled = true;

    INSERT INTO public.manual_payment_methods (method_type, is_enabled, account_number, account_holder_name, support_whatsapp_number)
    VALUES
      ('vodafone_cash', true, '01012345678', 'أكاديمية الساعي للغة العربية', '201012345678'),
      ('instapay', true, 'elsa3i@instapay', 'منصة الساعي التعليمية - إداري', '201012345678')
    ON CONFLICT DO NOTHING;
  `);

  // Get active gateway IDs
  const gwList = await query(`SELECT id, gateway_key FROM public.payment_gateways;`);
  const gwMap = {};
  gwList.forEach(g => gwMap[g.gateway_key] = g.id);
  const activePaymobId = gwMap['paymob'] || paymobGwId;
  const activeKashierId = gwMap['kashier'] || '2495c1c5-970f-4108-ab79-d322bc4a6551';
  const activeFawaterakId = gwMap['fawaterak'] || fawaterakGwId;

  // ==========================================
  // 9. 50 REALISTIC ARABIC STUDENTS
  // ==========================================
  console.log('👥 9. Creating 50 Arabic Student Accounts & Profiles...');

  const arabicFirstNamesMale = [
    'أحمد', 'محمد', 'محمود', 'يوسف', 'عمر', 'علي', 'إبراهيم', 'حسن', 'حسين', 'خالد',
    'طارق', 'كريم', 'زياد', 'عبدالرحمن', 'مصطفى', 'مروان', 'بلال', 'ياسين', 'سيف', 'أنس',
    'حمزة', 'سليم', 'مازن', 'يحيى', 'آدم'
  ];
  const arabicFirstNamesFemale = [
    'سارة', 'مريم', 'فاطمة', 'نور', 'ياسمين', 'آية', 'سلمى', 'هنا', 'ندى', 'ريم',
    'شهد', 'حبيبة', 'ملك', 'روان', 'جنى', 'هاجر', 'فريدة', 'منة', 'إسراء', 'شيماء',
    'رانيا', 'داليا', 'أميرة', 'نوران', 'بسملة'
  ];
  const arabicLastNames = [
    'السيد', 'محمود', 'إبراهيم', 'عبدالله', 'حسن', 'الشريف', 'منصور', 'البدري', 'رمضان', 'عثمان',
    'طه', 'المهدي', 'صالح', 'فاروق', 'النجار', 'راضي', 'فهمي', 'القاضي', 'سالم', 'الجمال',
    'الشناوي', 'حمدي', 'زهران', 'الجندي', 'شاكر', 'عفيفي', 'شحاتة', 'فوزي', 'عوض', 'متولي'
  ];
  const governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية', 'القليوبية',
    'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف',
    'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان'
  ];
  const stagesList = [stage3Id, stage3Id, stage3Id, stage2Id, stage1Id];

  const studentProfiles = [];
  const authUsersInserts = [];
  const profilesInserts = [];

  for (let i = 1; i <= 50; i++) {
    const isMale = i % 2 !== 0;
    const firstName = isMale 
      ? arabicFirstNamesMale[(i - 1) % arabicFirstNamesMale.length]
      : arabicFirstNamesFemale[(i - 1) % arabicFirstNamesFemale.length];
    const lastName1 = arabicLastNames[(i * 3) % arabicLastNames.length];
    const lastName2 = arabicLastNames[(i * 7) % arabicLastNames.length];
    const fullName = `${firstName} ${lastName1} ${lastName2}`;
    const gender = isMale ? 'ذكر' : 'أنثى';
    const gov = governorates[i % governorates.length];
    const stageId = stagesList[i % stagesList.length];

    const studentUuid = `90000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const email = `student${i}@saae-academy.edu.eg`;
    const phone = `010${String(10000000 + i * 137).slice(0, 8)}`;
    const guardianPhone = `011${String(20000000 + i * 251).slice(0, 8)}`;
    const studentCode = `STU-2026-${String(1000 + i)}`;
    const avatarUrl = isMale 
      ? `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80`
      : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`;

    studentProfiles.push({
      id: studentUuid,
      full_name: fullName,
      email,
      phone,
      guardianPhone,
      studentCode,
      gender,
      gov,
      stageId,
      avatarUrl
    });

    authUsersInserts.push(`(
      '${studentUuid}',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      '${email}',
      crypt('StudentPass123!@#', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"${fullName}"}'::jsonb,
      false,
      now(),
      now()
    )`);

    profilesInserts.push(`(
      '${studentUuid}',
      ${escapeSql(fullName)},
      'student'::public.app_role,
      '${avatarUrl}',
      '${phone}',
      '${guardianPhone}',
      '${email}',
      '${email}',
      '${studentCode}',
      ${escapeSql(gov)},
      'online',
      '${gender}',
      '${stageId}',
      false,
      true,
      'طالب شغوف بتعلم أسرار وإعراب اللغة العربية في منصة الساعي التعليمية'
    )`);
  }

  // Insert auth users
  console.log('  -> Inserting 50 auth users in batch...');
  await query(`
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      created_at, updated_at
    )
    VALUES ${authUsersInserts.join(',\n')}
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  `);

  // Insert profiles
  console.log('  -> Inserting 50 student profiles in batch...');
  await query(`
    INSERT INTO public.profiles (
      id, full_name, role, avatar_url, phone_number, guardian_phone,
      email, auth_email, student_id, governorate, registration_type,
      gender, stage_id, is_banned, leaderboard_visible, bio
    )
    VALUES ${profilesInserts.join(',\n')}
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      phone_number = EXCLUDED.phone_number,
      guardian_phone = EXCLUDED.guardian_phone,
      student_id = EXCLUDED.student_id,
      governorate = EXCLUDED.governorate,
      stage_id = EXCLUDED.stage_id;
  `);

  // ==========================================
  // 10. ENROLLMENTS & COURSE PURCHASES
  // ==========================================
  console.log('📝 10. Enrolling Students in Courses & Recording Purchases...');
  const enrollmentsInserts = [];
  const paymentTxnsInserts = [];
  const pointsLedgerInserts = [];
  const watchProgressInserts = [];
  const completedLessonsInserts = [];
  const studentBadgesInserts = [];

  for (let idx = 0; idx < studentProfiles.length; idx++) {
    const s = studentProfiles[idx];
    const sIdx = idx + 1;

    // All students enrolled in Free Course 3 & Free Course 5
    enrollmentsInserts.push(`('${s.id}', '${course3Id}', now() - interval '${sIdx + 5} days')`);
    enrollmentsInserts.push(`('${s.id}', '${course5Id}', now() - interval '${sIdx + 3} days')`);

    // Top 35 students purchased Course 1 (Paid)
    if (sIdx <= 35) {
      enrollmentsInserts.push(`('${s.id}', '${course1Id}', now() - interval '${sIdx + 10} days')`);
      const refCode = `PAY-C1-${sIdx.toString().padStart(4, '0')}`;
      paymentTxnsInserts.push(`(
        '${refCode}',
        '${s.id}',
        '${course1Id}',
        '${activePaymobId}',
        25000,
        'success',
        now() - interval '${sIdx + 10} days',
        'course_purchase',
        35000,
        10000
      )`);
      pointsLedgerInserts.push(`('${s.id}', 'course_purchase', 100, 'course', '${course1Id}', 'شراء كورس النحو الشامل للثانوية العامة')`);
    }

    // Top 20 students purchased Course 2 (Paid)
    if (sIdx <= 20) {
      enrollmentsInserts.push(`('${s.id}', '${course2Id}', now() - interval '${sIdx + 8} days')`);
      const refCode2 = `PAY-C2-${sIdx.toString().padStart(4, '0')}`;
      paymentTxnsInserts.push(`(
        '${refCode2}',
        '${s.id}',
        '${course2Id}',
        '${activeKashierId}',
        20000,
        'success',
        now() - interval '${sIdx + 8} days',
        'course_purchase',
        28000,
        8000
      )`);
      pointsLedgerInserts.push(`('${s.id}', 'course_purchase', 100, 'course', '${course2Id}', 'شراء دورة البلاغة والأدب المكثفة')`);
    }

    // Students 21 to 40 purchased Course 4 (Paid)
    if (sIdx >= 21 && sIdx <= 40) {
      enrollmentsInserts.push(`('${s.id}', '${course4Id}', now() - interval '${sIdx + 4} days')`);
      const refCode4 = `PAY-C4-${sIdx.toString().padStart(4, '0')}`;
      paymentTxnsInserts.push(`(
        '${refCode4}',
        '${s.id}',
        '${course4Id}',
        '${activeFawaterakId}',
        18000,
        'success',
        now() - interval '${sIdx + 4} days',
        'course_purchase',
        22000,
        4000
      )`);
      pointsLedgerInserts.push(`('${s.id}', 'course_purchase', 100, 'course', '${course4Id}', 'شراء دورة الفرسان في اللغة العربية')`);
    }

    // Watch Progress & Completed Lessons
    const lessonsToComplete = sIdx <= 5 ? 7 : sIdx <= 15 ? 5 : sIdx <= 30 ? 3 : 1;

    for (let lIdx = 0; lIdx < lessonsData.length && lIdx < lessonsToComplete; lIdx++) {
      const l = lessonsData[lIdx];
      const courseForLesson = lIdx < 7 ? course1Id : lIdx < 10 ? course2Id : course3Id;
      completedLessonsInserts.push(`('${s.id}', '${l.id}', '${courseForLesson}', now() - interval '${(sIdx + lIdx)} hours')`);
      watchProgressInserts.push(`(
        '${s.id}', '${l.id}', '${courseForLesson}',
        1800, 1800, 1800, 1800, 100.0,
        now() - interval '${(sIdx + lIdx)} hours', now()
      )`);
      pointsLedgerInserts.push(`('${s.id}', 'lesson_progress', 15, 'lesson', '${l.id}', 'إتمام مشاهدة: ${l.title}')`);
    }

    // Quiz Points
    const bonusQuizPoints = sIdx <= 10 ? 350 : sIdx <= 25 ? 150 : 50;
    pointsLedgerInserts.push(`('${s.id}', 'quiz_passed', ${bonusQuizPoints}, 'quiz', NULL, 'تفوق في الامتحانات الدورية النحوية')`);

    // Student Badges
    if (sIdx <= 45) {
      studentBadgesInserts.push(`('${s.id}', '${badge1Id}', now() - interval '10 days')`);
    }
    if (sIdx <= 25) {
      studentBadgesInserts.push(`('${s.id}', '${badge2Id}', now() - interval '7 days')`);
      studentBadgesInserts.push(`('${s.id}', '${badge3Id}', now() - interval '5 days')`);
    }
    if (sIdx <= 10) {
      studentBadgesInserts.push(`('${s.id}', '${badge4Id}', now() - interval '3 days')`);
      studentBadgesInserts.push(`('${s.id}', '${badge5Id}', now() - interval '2 days')`);
    }
    if (sIdx <= 3) {
      studentBadgesInserts.push(`('${s.id}', '${badge6Id}', now() - interval '1 day')`);
    }
  }

  // Enrollments
  console.log(`  -> Inserting ${enrollmentsInserts.length} course enrollments...`);
  await query(`
    INSERT INTO public.enrollments (user_id, course_id, enrolled_at)
    VALUES ${enrollmentsInserts.join(',\n')}
    ON CONFLICT (user_id, course_id) DO NOTHING;
  `);

  // Payment transactions
  console.log(`  -> Inserting ${paymentTxnsInserts.length} payment transactions...`);
  await query(`
    INSERT INTO public.payment_transactions (
      reference_number, user_id, course_id, gateway_id,
      amount_piastres, status, created_at, purpose,
      original_price_piastres, discount_amount_piastres
    )
    VALUES ${paymentTxnsInserts.join(',\n')}
    ON CONFLICT DO NOTHING;
  `);

  // Completed lessons
  console.log(`  -> Inserting ${completedLessonsInserts.length} completed lessons...`);
  await query(`
    INSERT INTO public.lesson_progress (user_id, lesson_id, course_id, completed_at)
    VALUES ${completedLessonsInserts.join(',\n')}
    ON CONFLICT (user_id, lesson_id) DO NOTHING;
  `);

  // Watch progress
  console.log(`  -> Inserting ${watchProgressInserts.length} watch progress records...`);
  await query(`
    INSERT INTO public.lesson_watch_progress (
      user_id, lesson_id, course_id,
      duration_seconds, watched_seconds, furthest_position_seconds,
      last_position_seconds, watch_percentage, created_at, updated_at
    )
    VALUES ${watchProgressInserts.join(',\n')}
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
      watched_seconds = EXCLUDED.watched_seconds,
      watch_percentage = EXCLUDED.watch_percentage;
  `);

  // Points ledger
  console.log(`  -> Inserting ${pointsLedgerInserts.length} points ledger entries...`);
  await query(`
    INSERT INTO public.points_ledger (student_id, event_key, points_delta, source_kind, source_id, notes)
    VALUES ${pointsLedgerInserts.join(',\n')}
    ON CONFLICT DO NOTHING;
  `);

  // Student badges
  console.log(`  -> Inserting ${studentBadgesInserts.length} student badges...`);
  await query(`
    INSERT INTO public.student_badges (student_id, badge_id, awarded_at)
    VALUES ${studentBadgesInserts.join(',\n')}
    ON CONFLICT DO NOTHING;
  `);

  // ==========================================
  // 11. PURCHASE CODES (أكواد الشحن والتفعيل)
  // ==========================================
  console.log('🔑 11. Generating Recharge & Purchase Activation Codes...');
  const codesData = [
    { code: 'SAAE-GRAMMAR-2026', target_type: 'course', target_id: course1Id, max_uses: 100, use_count: 35 },
    { code: 'SAAE-BALAGHA-VIP', target_type: 'course', target_id: course2Id, max_uses: 50, use_count: 20 },
    { code: 'SAAE-SEC2-VIP2026', target_type: 'course', target_id: course4Id, max_uses: 50, use_count: 15 },
    { code: 'DISCOUNT-50-PERCENT', target_type: 'course', target_id: course1Id, max_uses: 200, use_count: 65 },
    { code: 'FREE-EXAM-ACCESS', target_type: 'course', target_id: course3Id, max_uses: 500, use_count: 120 },
    { code: 'TOP-STUDENT-BONUS', target_type: 'course', target_id: course2Id, max_uses: 30, use_count: 8 }
  ];

  for (const c of codesData) {
    await query(`
      INSERT INTO public.purchase_codes (code, target_type, target_id, max_uses, use_count, expires_at)
      VALUES ('${c.code}', '${c.target_type}', '${c.target_id}', ${c.max_uses}, ${c.use_count}, now() + interval '180 days')
      ON CONFLICT DO NOTHING;
    `);
  }

  // ==========================================
  // 12. BRANCHES & TESTIMONIALS
  // ==========================================
  console.log('🏢 12. Adding Branches (السناتر والفروع) & Testimonials (آراء الطلاب)...');
  await query(`
    INSERT INTO public.branches (branch_name, governorate, address_details, is_active, order_index)
    VALUES
      ('فرع المهندسين الرئيسي - سنتر الساعي', 'الجيزة', 'شارع جامعة الدول العربية - بجوار محطة المترو', true, 1),
      ('فرع مدينة نصر - سنتر الأوائل', 'القاهرة', 'شارع عباس العقاد - أمام الحديقة الدولية', true, 2),
      ('فرع الإسكندرية - سنتر الفورسيزون', 'الإسكندرية', 'سموحة - ميدان فيكتور عمانويل', true, 3),
      ('فرع المنصورة - سنتر النخبة', 'الدقهلية', 'شارع المشاية السفلية - أمام نادي النيل', true, 4)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.testimonials (image_url, student_name, order_index, is_visible)
    VALUES
      ('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', 'سارة أحمد محمود (المركز الأول جمهورية - ثانوية عامة)', 1, true),
      ('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80', 'عمر خالد الشريف (الدرجة النهائية في اللغة العربية 80/80)', 2, true),
      ('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', 'مريم إبراهيم القاضي (كلية طب بشري القاهرة)', 3, true),
      ('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', 'يوسف مصطفى النجار (كلية هندسة عين شمس)', 4, true)
    ON CONFLICT DO NOTHING;
  `);

  console.log('\n🎉 ALL ARABIC SEED DATA SUCCESSFULLY INSERTED AND CONNECTED!');
}

seed().catch(console.error);
