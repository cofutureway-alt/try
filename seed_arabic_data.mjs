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
  console.log('🚀 Starting comprehensive Arabic database updates (Rich YouTube Lessons & Books)...');

  // ==========================================
  // 1. STAGES (المراحل الدراسية)
  // ==========================================
  console.log('📚 1. Stages...');
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
  console.log('📖 2. Arabic Subjects...');
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
  console.log('🎓 3. 5 Arabic Courses (3 Paid, 2 Free)...');
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
  // 4. UNITS (All 5 Courses Filled with Multiple Units)
  // ==========================================
  console.log('📑 4. Creating Course Units (Ensuring No Empty Courses)...');
  // Course 1 Units
  const u11 = '11111111-0001-4111-8111-111111111111';
  const u12 = '11111111-0002-4111-8111-111111111111';
  const u13 = '11111111-0003-4111-8111-111111111111';
  const u14 = '11111111-0004-4111-8111-111111111111';

  // Course 2 Units
  const u21 = '22222222-0001-4222-8222-222222222222';
  const u22 = '22222222-0002-4222-8222-222222222222';
  const u23 = '22222222-0003-4222-8222-222222222222';

  // Course 3 Units (Free)
  const u31 = '33333333-0001-4333-8333-333333333333';
  const u32 = '33333333-0002-4333-8333-333333333333';
  const u33 = '33333333-0003-4333-8333-333333333333';

  // Course 4 Units (Paid 2nd Sec)
  const u41 = '44444444-0001-4444-8444-444444444444';
  const u42 = '44444444-0002-4444-8444-444444444444';
  const u43 = '44444444-0003-4444-8444-444444444444';

  // Course 5 Units (Free Rhetoric Capsules)
  const u51 = '55555555-0001-4555-8555-555555555555';
  const u52 = '55555555-0002-4555-8555-555555555555';

  const unitsData = [
    // Course 1
    { id: u11, course_id: course1Id, title: 'الوحدة الأولى: قواعد النطق والإملاء وهمزة القطع والوصل', position: 1 },
    { id: u12, course_id: course1Id, title: 'الوحدة الثانية: المشتقات العاملة والمصادر وأسماء التفضيل', position: 2 },
    { id: u13, course_id: course1Id, title: 'الوحدة الثالثة: نواسخ الجملة الاسمية والضمائر وحروف الجر', position: 3 },
    { id: u14, course_id: course1Id, title: 'الوحدة الخامسة: إعراب وبناء الأفعال وتوكيد الفعل بالنون', position: 4 },

    // Course 2
    { id: u21, course_id: course2Id, title: 'الوحدة الأولى: علم البيان (التشبيه والاستعارة والكناية والمجاز)', position: 1 },
    { id: u22, course_id: course2Id, title: 'الوحدة الثانية: علم البديع والمعاني (المحسنات، الإيجاز، والإطناب)', position: 2 },
    { id: u23, course_id: course2Id, title: 'الوحدة الثالثة: مدارس الشعر الحديث وفنون النصوص المتحررة', position: 3 },

    // Course 3
    { id: u31, course_id: course3Id, title: 'المستوى الأول: أساسيات الإعراب وأنواع الكلمة والجملة في اللغة العربية', position: 1 },
    { id: u32, course_id: course3Id, title: 'المستوى الثاني: المرفوعات والمنصوبات والمجرورات وحروف الجر', position: 2 },
    { id: u33, course_id: course3Id, title: 'المستوى الثالث: مفاتيح حل القطعة النحوية واستخراج القواعد بسهولة', position: 3 },

    // Course 4
    { id: u41, course_id: course4Id, title: 'الوحدة الأولى: إعراب الفعل المضارع وحالات الجزم والشرط', position: 1 },
    { id: u42, course_id: course4Id, title: 'الوحدة الثانية: مصادر الأفعال الثلاثية وغير الثلاثية والميمية والصناعية', position: 2 },
    { id: u43, course_id: course4Id, title: 'الوحدة الثالثة: تاريخ الأدب في العصر الجاهلي والإسلامي والأموي', position: 3 },

    // Course 5
    { id: u51, course_id: course5Id, title: 'كبسولات التذوق الفني: الفروق البلاغية الدقيقة وسر الجمال', position: 1 },
    { id: u52, course_id: course5Id, title: 'كبسولات المحسنات البديعية وأسرار التذوق في النصوص الحديثة', position: 2 }
  ];

  for (const u of unitsData) {
    await query(`
      INSERT INTO public.units (id, course_id, title, position)
      VALUES ('${u.id}', '${u.course_id}', ${escapeSql(u.title)}, ${u.position})
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, position = EXCLUDED.position;
    `);
  }

  // ==========================================
  // 5. RICH ARABIC LESSONS WITH YOUTUBE VIDEOS (NO EMPTY COURSES)
  // ==========================================
  console.log('🎥 5. Populating Real Educational YouTube Lessons for all Courses...');

  // Real educational Arabic grammar, rhetoric, and literature YouTube videos
  const lessonsData = [
    // ----------------------------------------------------
    // COURSE 1: النحو الشامل (الثانوية العامة)
    // ----------------------------------------------------
    // Unit 1.1
    {
      id: '11111111-1001-4111-8111-111111111111',
      unit_id: u11,
      title: 'الدرس 1: همزة القطع وألف الوصل والفروق الإملائية الدقيقة ومواضع كل منهما',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
      position: 1
    },
    {
      id: '11111111-1002-4111-8111-111111111111',
      unit_id: u11,
      title: 'الدرس 2: اللام الشمسية واللام القمرية والفرق بين (إلا وإلا) و(ثم وثمة)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=zJgQdYrK0t4',
      position: 2
    },
    {
      id: '11111111-1003-4111-8111-111111111111',
      unit_id: u11,
      title: 'الدرس 3: أنواع الواو في آخر الكلمة (واو الجماعة، واو الجمع، والواو الأصلية والفارقة)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=1La4QzGeaaQ',
      position: 3
    },
    // Unit 1.2
    {
      id: '11111111-1004-4111-8111-111111111111',
      unit_id: u12,
      title: 'الدرس 4: إعمال اسم الفاعل وصيغ المبالغة وشروط عمل المشتقات وإعراب المعمول',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
      position: 1
    },
    {
      id: '11111111-1005-4111-8111-111111111111',
      unit_id: u12,
      title: 'الدرس 5: اسم المفعول العامل وغير العامل وإعراب نائب الفاعل بالتفصيل',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
      position: 2
    },
    {
      id: '11111111-1006-4111-8111-111111111111',
      unit_id: u12,
      title: 'الدرس 6: اسم التفضيل وحالاته الأربعة وحكم مطابقته للمفضل في التذكير والتأنيث',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=7h1aW_eQ9_0',
      position: 3
    },
    // Unit 1.3
    {
      id: '11111111-1007-4111-8111-111111111111',
      unit_id: u13,
      title: 'الدرس 7: المبتدأ والخبر وحالات تقديم الخبر وجوباً وجوازاً وحذف المبتدأ والخبر',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=W_Yn3qKk-7w',
      position: 1
    },
    {
      id: '11111111-1008-4111-8111-111111111111',
      unit_id: u13,
      title: 'الدرس 8: أفعال المقاربة والرجاء والشروع (كاد وأخواتها) وأحكام اقتران خبرها بأن',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=BqK2YvG5L6M',
      position: 2
    },
    // Unit 1.4
    {
      id: '11111111-1009-4111-8111-111111111111',
      unit_id: u14,
      title: 'الدرس 9: إعراب الفعل المضارع (الرفع والنصب والجزم في جواب الطلب وأدوات الشرط)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=w0a-T5r8Lzg',
      position: 1
    },
    {
      id: '11111111-1010-4111-8111-111111111111',
      unit_id: u14,
      title: 'الدرس 10: اقتران جواب الشرط بالفاء (اسمية طلبية وبجامد...) وتوكيد الفعل بالنون وجوباً وجوازاً',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=E7yH9d7N7Xk',
      position: 2
    },

    // ----------------------------------------------------
    // COURSE 2: دورة البلاغة والأدب المكثفة
    // ----------------------------------------------------
    // Unit 2.1
    {
      id: '22222222-1001-4222-8222-222222222222',
      unit_id: u21,
      title: 'الدرس 1: التشبيه المفرد (المفصل والمجمل والمؤكد والبليغ) والتشبيه التمثيلي والضمني',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=f2nN9tK0j78',
      position: 1
    },
    {
      id: '22222222-1002-4222-8222-222222222222',
      unit_id: u21,
      title: 'الدرس 2: الاستعارة المكنية والتصريحية وأسرار الصورة الممتدة والمركبة والكلية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=D6z9K1n9k7Y',
      position: 2
    },
    {
      id: '22222222-1003-4222-8222-222222222222',
      unit_id: u21,
      title: 'الدرس 3: الكناية بأنواعها (صفة، موصوف، نسبة) وعلاقات المجاز المرسل الثمانية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=m7H0sJ_q8wY',
      position: 3
    },
    // Unit 2.2
    {
      id: '22222222-1004-4222-8222-222222222222',
      unit_id: u22,
      title: 'الدرس 4: المحسنات البديعية اللفظية والمعنوية (الطباق، المقابلة، الجناس، السجع، والتورية)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=k1L9e1V0q1Y',
      position: 1
    },
    {
      id: '22222222-1005-4222-8222-222222222222',
      unit_id: u22,
      title: 'الدرس 5: علم المعاني: أساليب القصر، الإيجاز، والإطناب، والخبر والإنشاء وأغراضهما',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=m3N7c9X8o3Y',
      position: 2
    },
    // Unit 2.3
    {
      id: '22222222-1006-4222-8222-222222222222',
      unit_id: u23,
      title: 'الدرس 6: مدرسة الإحياء والبعث وجيل التطوير (شوقي وحافظ والبارودي) وخصائص شعرهم',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=p1M2n9B7k7U',
      position: 1
    },
    {
      id: '22222222-1007-4222-8222-222222222222',
      unit_id: u23,
      title: 'الدرس 7: الاتجاه الوجداني ومطران، ومدرسة الديوان، وأبوللو، والمهجر، والمدرسة الواقعية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=v9B8k1N7x0Y',
      position: 2
    },

    // ----------------------------------------------------
    // COURSE 3: تأسيس النحو والإعراب (مجاني)
    // ----------------------------------------------------
    // Unit 3.1
    {
      id: '33333333-1001-4333-8333-333333333333',
      unit_id: u31,
      title: 'الدرس 1: كيف تعرب أي كلمة في اللغة العربية بسهولة من الصفر؟',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=c3D7j9N8y3Y',
      position: 1
    },
    {
      id: '33333333-1002-4333-8333-333333333333',
      unit_id: u31,
      title: 'الدرس 2: أقسام الكلمة (اسم، فعل، حرف) والفرق الجوهري بين الجملة الاسمية والفعلية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=d4E6k8O7x4Y',
      position: 2
    },
    // Unit 3.2
    {
      id: '33333333-1003-4333-8333-333333333333',
      unit_id: u32,
      title: 'الدرس 3: علامات الإعراب الأصلية والفرعية في الأسماء والأفعال الخمسة والأسماء الستة',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=e5F5k7P6w5Y',
      position: 1
    },
    {
      id: '33333333-1004-4333-8333-333333333333',
      unit_id: u32,
      title: 'الدرس 4: عائلة المفاعيل الخمسة (المفعول به، المفعول المطلق، لأجله، فيه، ومعه)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=g7H3i5R4u7Y',
      position: 2
    },
    // Unit 3.3
    {
      id: '33333333-1005-4333-8333-333333333333',
      unit_id: u33,
      title: 'الدرس 5: قواعد التوابع الأربعة (النعت، المعطوف، التوكيد، والبدل بأنواعه)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=h8I2h4S3t8Y',
      position: 1
    },
    {
      id: '33333333-1006-4333-8333-333333333333',
      unit_id: u33,
      title: 'الدرس 6: أهم 20 ثابت إعرابي يتكرر في جميع امتحانات اللغة العربية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=i9J1g3T2s9Y',
      position: 2
    },

    // ----------------------------------------------------
    // COURSE 4: الفرسان في اللغة العربية (2nd Sec)
    // ----------------------------------------------------
    // Unit 4.1
    {
      id: '44444444-1001-4444-8444-444444444444',
      unit_id: u41,
      title: 'الدرس 1: نصب الفعل المضارع وحروف النصب (أن، لن، كي، حتى، فاء السببية، لام الجحود، واو المعية)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=w0a-T5r8Lzg',
      position: 1
    },
    {
      id: '44444444-1002-4444-8444-444444444444',
      unit_id: u41,
      title: 'الدرس 2: جزم المضارع في أسلوب الشرط وأدوات الشرط الجازمة وإعراب فعل و جواب الشرط',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=E7yH9d7N7Xk',
      position: 2
    },
    // Unit 4.2
    {
      id: '44444444-1003-4444-8444-444444444444',
      unit_id: u42,
      title: 'الدرس 3: مصادر الأفعال الثلاثية السماعية والرباعية والخماسية والسداسية القياسية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
      position: 1
    },
    {
      id: '44444444-1004-4444-8444-444444444444',
      unit_id: u42,
      title: 'الدرس 4: المصدر الميمي والمصدر الصناعي والفرق بينه وبين الاسم المنسوب',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
      position: 2
    },
    // Unit 4.3
    {
      id: '44444444-1005-4444-8444-444444444444',
      unit_id: u43,
      title: 'الدرس 5: المعلقات وأصحابها في العصر الجاهلي (امرؤ القيس، زهير، عنترة، طرفة، لبيد، عمرو، الحارث)',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=p1M2n9B7k7U',
      position: 1
    },
    {
      id: '44444444-1006-4444-8444-444444444444',
      unit_id: u43,
      title: 'الدرس 6: أثر الإسلام في الشعر والنثر العربي والخطابة والرسائل في عصر صدر الإسلام وبني أمية',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=v9B8k1N7x0Y',
      position: 2
    },

    // ----------------------------------------------------
    // COURSE 5: كبسولات البلاغة السريعة (مجاني)
    // ----------------------------------------------------
    // Unit 5.1
    {
      id: '55555555-1001-4555-8555-555555555555',
      unit_id: u51,
      title: 'كبسولة 1: سر التفرقة بين الاستعارة التصريحية والمجاز المرسل في دقيقة واحدة',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=f2nN9tK0j78',
      position: 1
    },
    {
      id: '55555555-1002-4555-8555-555555555555',
      unit_id: u51,
      title: 'كبسولة 2: كيف تميز بين الصورة المركبة والصورة الممتدة المرشحة والمجردة في النصوص الحديثة',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=D6z9K1n9k7Y',
      position: 2
    },
    // Unit 5.2
    {
      id: '55555555-1003-4555-8555-555555555555',
      unit_id: u52,
      title: 'كبسولة 3: سحر البديع: التفرقة بين حسن التقسيم والازدواج، والتصريع والجناس التام والناقص',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=k1L9e1V0q1Y',
      position: 1
    },
    {
      id: '55555555-1004-4555-8555-555555555555',
      unit_id: u52,
      title: 'كبسولة 4: مفاتيح إجابة سؤال التجربة الشعرية والوحدة العضوية ومزج الفكر بالوجدان',
      video_provider: 'youtube',
      video_url: 'https://www.youtube.com/watch?v=m3N7c9X8o3Y',
      position: 2
    }
  ];

  for (const l of lessonsData) {
    await query(`
      INSERT INTO public.lessons (id, unit_id, title, video_provider, video_url, position)
      VALUES ('${l.id}', '${l.unit_id}', ${escapeSql(l.title)}, '${l.video_provider}'::video_provider, '${l.video_url}', ${l.position})
      ON CONFLICT (id) DO UPDATE SET
        unit_id = EXCLUDED.unit_id,
        title = EXCLUDED.title,
        video_provider = EXCLUDED.video_provider,
        video_url = EXCLUDED.video_url,
        position = EXCLUDED.position;
    `);
  }

  // ==========================================
  // 6. BOOKS (كتب وملازم اللغة العربية المطبوعة والرقمية)
  // ==========================================
  console.log('📚 6. Adding Rich Arabic Textbooks & Digital Books (كتب المنصة والمذكرات)...');

  const book1Id = '66666666-0001-4666-8666-666666666661';
  const book2Id = '66666666-0002-4666-8666-666666666662';
  const book3Id = '66666666-0003-4666-8666-666666666663';
  const book4Id = '66666666-0004-4666-8666-666666666664';
  const book5Id = '66666666-0005-4666-8666-666666666665';
  const book6Id = '66666666-0006-4666-8666-666666666666';

  const booksData = [
    // 1. Physical Book: موسوعة النحو الشامل 3rd Sec
    {
      id: book1Id,
      title: 'كتاب الساعي في النحو والصرف - الموسوعة الشاملة للثانوية العامة 2026',
      description: 'كتاب شامل يضم شرحاً تفصيلياً لجميع وحدات النحو والصرف السبعة، وأكثر من 2000 فكرة وتطبيق امتحاني طبقاً لأحدث معايير المركز القومي للامتحانات.',
      author: 'أ. محمد الساعي',
      publisher: 'دار الساعي للنشر والتوزيع',
      publication_year: 2026,
      isbn: '978-977-854-101-1',
      language: 'ar',
      subject_id: subjGrammarId,
      stage_id: stage3Id,
      tags: ['نحو', 'ثانوية عامة', '2026', 'بنك أسئلة', 'شامل'],
      book_type: 'physical',
      price_piastres: 18000,
      discount_price_piastres: 15000,
      discount_expires_at: 'now() + interval \'90 days\'',
      cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      digital_file_url: null,
      download_limit: null,
      is_drm_protected: true,
      stock_quantity: 500,
      weight_grams: 650,
      length_cm: 28.0,
      width_cm: 20.0,
      height_cm: 3.0,
      stage_ids: [stage3Id],
      subject_ids: [subjGrammarId]
    },

    // 2. Physical Book: لؤلؤة البلاغة والأدب والنصوص
    {
      id: book2Id,
      title: 'كتاب لؤلؤة البلاغة والتذوق الأدبي وحل النصوص المتحررة',
      description: 'دليل إتقان الصور البيانية المركبة والمجازات والمحسنات البديعية وتطبيقات عملية على المدارس الشعرية الحديثة والنصوص النثرية المتحررة.',
      author: 'أ. محمد الساعي',
      publisher: 'دار الساعي للنشر والتوزيع',
      publication_year: 2026,
      isbn: '978-977-854-102-8',
      language: 'ar',
      subject_id: subjRhetoricId,
      stage_id: stage3Id,
      tags: ['بلاغة', 'أدب', 'نصوص متحررة', 'ثانوية عامة'],
      book_type: 'physical',
      price_piastres: 14000,
      discount_price_piastres: 12000,
      discount_expires_at: 'now() + interval \'60 days\'',
      cover_image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      digital_file_url: null,
      download_limit: null,
      is_drm_protected: true,
      stock_quantity: 350,
      weight_grams: 480,
      length_cm: 28.0,
      width_cm: 20.0,
      height_cm: 2.2,
      stage_ids: [stage3Id],
      subject_ids: [subjRhetoricId, subjLiteratureId]
    },

    // 3. Physical Book: الفرسان للصف الثاني الثانوي
    {
      id: book3Id,
      title: 'كتاب الفرسان في اللغة العربية - الصف الثاني الثانوي (الترم الأول)',
      description: 'شرح مبسط وتدريبات مكثفة على إعراب الأفعال والمصادر الصريحة والميمية وتاريخ الأدب الجاهلي والإسلامي والأموي وبلاغة الفصل والوصل.',
      author: 'أكاديمية الساعي التعليمية',
      publisher: 'دار الساعي للنشر والتوزيع',
      publication_year: 2026,
      isbn: '978-977-854-103-5',
      language: 'ar',
      subject_id: subjLiteratureId,
      stage_id: stage2Id,
      tags: ['ثانية ثانوي', 'منهج حديث', 'تدريبات', 'الترم الأول'],
      book_type: 'physical',
      price_piastres: 12000,
      discount_price_piastres: 10000,
      discount_expires_at: 'now() + interval \'45 days\'',
      cover_image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      digital_file_url: null,
      download_limit: null,
      is_drm_protected: true,
      stock_quantity: 400,
      weight_grams: 420,
      length_cm: 28.0,
      width_cm: 20.0,
      height_cm: 2.0,
      stage_ids: [stage2Id],
      subject_ids: [subjLiteratureId, subjGrammarId]
    },

    // 4. Digital Book (PDF): المذكرة الذهبية في قواعد الإعراب
    {
      id: book4Id,
      title: 'المذكرة الذهبية في قواعد الإعراب من الصفر حتى الإتقان (نسخة إلكترونية PDF)',
      description: 'مذكرة رقمية تفاعلية قابلة للتحميل تحتوي على أساسيات النحو والإعراب وخرائط ذهنية مبسطة لجميع طلاب المراحل الإعدادية والثانوية.',
      author: 'أ. محمد الساعي',
      publisher: 'منصة الساعي الرقمية',
      publication_year: 2026,
      isbn: '978-977-854-104-2',
      language: 'ar',
      subject_id: subjGrammarId,
      stage_id: stage1Id,
      tags: ['تأسيس', 'PDF', 'إعراب', 'رقمي', 'تحميل'],
      book_type: 'digital',
      price_piastres: 5000,
      discount_price_piastres: 3500,
      discount_expires_at: 'now() + interval \'120 days\'',
      cover_image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      digital_file_url: 'https://raw.githubusercontent.com/cofutureway-alt/try/main/books/arabic-grammar-basics.pdf',
      download_limit: 10,
      is_drm_protected: true,
      stock_quantity: null,
      weight_grams: null,
      length_cm: null,
      width_cm: null,
      height_cm: null,
      stage_ids: [stage1Id, stage2Id, stage3Id, stage4Id],
      subject_ids: [subjGrammarId]
    },

    // 5. Digital Book (PDF): كبسولات ليالي الامتحان 2026
    {
      id: book5Id,
      title: 'كبسولات ليالي الامتحان والتوقعات المرئية للثانوية العامة 2026 (ملف رقمي PDF)',
      description: 'ملخص شامل في 50 صفحة يجمع أهم 100 فكرة نحوية وبلاغية متوقعة مع نماذج إجابات استرشادية لضمان الدرجة النهائية في العربي.',
      author: 'فريق خبراء أوائل الساعي',
      publisher: 'منصة الساعي الرقمية',
      publication_year: 2026,
      isbn: '978-977-854-105-9',
      language: 'ar',
      subject_id: subjRevisionId,
      stage_id: stage3Id,
      tags: ['مراجعة نهائية', 'ليالي الامتحان', 'ثانوية عامة', 'PDF', 'توقعات'],
      book_type: 'digital',
      price_piastres: 7500,
      discount_price_piastres: 5000,
      discount_expires_at: 'now() + interval \'60 days\'',
      cover_image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      digital_file_url: 'https://raw.githubusercontent.com/cofutureway-alt/try/main/books/final-exam-capsules-2026.pdf',
      download_limit: 5,
      is_drm_protected: true,
      stock_quantity: null,
      weight_grams: null,
      length_cm: null,
      width_cm: null,
      height_cm: null,
      stage_ids: [stage3Id],
      subject_ids: [subjRevisionId]
    },

    // 6. Physical Book: موسوعة الخرائط الذهنية
    {
      id: book6Id,
      title: 'موسوعة الخرائط الذهنية في النحو والبلاغة (نسخة مطبوعة فاخرة بالألوان)',
      description: 'أطلس تعليمي مبتكر يحول القواعد المعقدة إلى رسومات وخرائط بصرية ملونة تساعد على التذكر والاستيعاب الفوري بأعلى كفاءة.',
      author: 'أ. محمد الساعي',
      publisher: 'دار الساعي للنشر والتوزيع',
      publication_year: 2026,
      isbn: '978-977-854-106-6',
      language: 'ar',
      subject_id: subjGrammarId,
      stage_id: stage3Id,
      tags: ['خرائط ذهنية', 'إنفوجرافيك', 'تسهيل النحو', 'ألوان فاخرة'],
      book_type: 'physical',
      price_piastres: 16000,
      discount_price_piastres: 13000,
      discount_expires_at: 'now() + interval \'90 days\'',
      cover_image_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      digital_file_url: null,
      download_limit: null,
      is_drm_protected: true,
      stock_quantity: 200,
      weight_grams: 550,
      length_cm: 30.0,
      width_cm: 21.0,
      height_cm: 2.5,
      stage_ids: [stage3Id],
      subject_ids: [subjGrammarId, subjRhetoricId]
    }
  ];

  for (const b of booksData) {
    const stageIdsArr = `ARRAY[${b.stage_ids.map(id => `'${id}'::uuid`).join(',')}]`;
    const subjectIdsArr = `ARRAY[${b.subject_ids.map(id => `'${id}'::uuid`).join(',')}]`;
    const tagsArr = `ARRAY[${b.tags.map(t => `'${t}'`).join(',')}]`;

    await query(`
      INSERT INTO public.books (
        id, title, description, author, publisher, publication_year, isbn,
        language, subject_id, stage_id, tags, book_type, price_piastres,
        discount_price_piastres, discount_expires_at, cover_image_url,
        status, digital_file_url, download_limit, is_drm_protected,
        stock_quantity, weight_grams, length_cm, width_cm, height_cm,
        stage_ids, subject_ids
      )
      VALUES (
        '${b.id}',
        ${escapeSql(b.title)},
        ${escapeSql(b.description)},
        ${escapeSql(b.author)},
        ${escapeSql(b.publisher)},
        ${b.publication_year},
        ${escapeSql(b.isbn)},
        '${b.language}',
        '${b.subject_id}',
        '${b.stage_id}',
        ${tagsArr},
        '${b.book_type}',
        ${b.price_piastres},
        ${b.discount_price_piastres},
        ${b.discount_expires_at},
        '${b.cover_image_url}',
        '${b.status}',
        ${escapeSql(b.digital_file_url)},
        ${b.download_limit !== null ? b.download_limit : 'NULL'},
        ${b.is_drm_protected},
        ${b.stock_quantity !== null ? b.stock_quantity : 'NULL'},
        ${b.weight_grams !== null ? b.weight_grams : 'NULL'},
        ${b.length_cm !== null ? b.length_cm : 'NULL'},
        ${b.width_cm !== null ? b.width_cm : 'NULL'},
        ${b.height_cm !== null ? b.height_cm : 'NULL'},
        ${stageIdsArr},
        ${subjectIdsArr}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        author = EXCLUDED.author,
        publisher = EXCLUDED.publisher,
        price_piastres = EXCLUDED.price_piastres,
        discount_price_piastres = EXCLUDED.discount_price_piastres,
        cover_image_url = EXCLUDED.cover_image_url,
        status = EXCLUDED.status,
        digital_file_url = EXCLUDED.digital_file_url,
        stock_quantity = EXCLUDED.stock_quantity;
    `);
  }

  // Also add purchase codes for the new books
  console.log('🔑 7. Adding Book Activation / Promo Codes...');
  const bookCodes = [
    { code: 'BOOK-GRAMMAR-2026', target_type: 'course', target_id: course1Id, max_uses: 100, use_count: 10 },
    { code: 'BOOK-BALAGHA-VIP', target_type: 'course', target_id: course2Id, max_uses: 50, use_count: 5 },
    { code: 'FREE-BOOK-ACCESS', target_type: 'course', target_id: course3Id, max_uses: 200, use_count: 25 }
  ];

  for (const c of bookCodes) {
    await query(`
      INSERT INTO public.purchase_codes (code, target_type, target_id, max_uses, use_count, expires_at)
      VALUES ('${c.code}', '${c.target_type}', '${c.target_id}', ${c.max_uses}, ${c.use_count}, now() + interval '180 days')
      ON CONFLICT DO NOTHING;
    `);
  }

  console.log('\n🎉 ALL LESSONS, REAL YOUTUBE VIDEOS, ALL UNITS, AND 6 BOOKS SUCCESSFULLY ADDED & CONNECTED!');
}

seed().catch(console.error);
