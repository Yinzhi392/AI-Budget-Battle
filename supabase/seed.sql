insert into public.benchmark_profiles (
  id,
  region,
  currency,
  student_context,
  category,
  range_low,
  range_high,
  label,
  description
)
values
  (
    'benchmark_cn_cny_milk_tea',
    'cn_mainland',
    'CNY',
    '中国大陆学生 / CNY',
    'milk_tea',
    80,
    260,
    '高频奶茶消费组',
    '用于娱乐化消费人格对比，不代表真实校园排名。'
  ),
  (
    'benchmark_cn_cny_food_delivery',
    'cn_mainland',
    'CNY',
    '中国大陆学生 / CNY',
    'food_delivery',
    180,
    680,
    '外卖支出偏高区间',
    '用于估算型战报的学生基准线，不代表真实用户百分位。'
  ),
  (
    'benchmark_study_abroad_usd_food_delivery',
    'study_abroad',
    'USD',
    '留学生 / broad study-abroad profile',
    'food_delivery',
    60,
    240,
    '留学生外卖观察线',
    'Broad study-abroad benchmark for lightweight personality analysis.'
  ),
  (
    'benchmark_study_abroad_usd_transport',
    'study_abroad',
    'USD',
    '留学生 / broad study-abroad profile',
    'transport',
    35,
    180,
    '留学生出行观察线',
    'Broad study-abroad benchmark for non-ranking comparison copy.'
  )
on conflict (id) do update set
  range_low = excluded.range_low,
  range_high = excluded.range_high,
  label = excluded.label,
  description = excluded.description;
