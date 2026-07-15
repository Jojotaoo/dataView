// 内置样本表（mock：以 dataSourceId 为键，作为 base 行代替真实 SQL 查库）
export const MOCK_TABLES: Record<string, Record<string, unknown>[]> = {
  'ds-mysql-sales': [
    { product: '手机', region: '华东', amount: 120, qty: 12, date: '2024-01-01' },
    { product: '手机', region: '华北', amount: 90, qty: 9, date: '2024-01-02' },
    { product: '笔记本', region: '华东', amount: 240, qty: 6, date: '2024-01-03' },
    { product: '笔记本', region: '华南', amount: 200, qty: 5, date: '2024-01-04' },
    { product: '平板', region: '华北', amount: 60, qty: 15, date: '2024-01-05' },
    { product: '平板', region: '华南', amount: 75, qty: 18, date: '2024-01-06' },
    { product: '配件', region: '华东', amount: 30, qty: 40, date: '2024-01-07' },
    { product: '配件', region: '华南', amount: 45, qty: 35, date: '2024-01-08' },
  ],
  'ds-pg-user': [
    { username: 'alice', age: 28, city: '上海', vip: 1 },
    { username: 'bob', age: 34, city: '北京', vip: 0 },
    { username: 'carol', age: 22, city: '广州', vip: 1 },
    { username: 'dave', age: 41, city: '上海', vip: 0 },
    { username: 'erin', age: 30, city: '北京', vip: 1 },
  ],
  'ds-ck-traffic': [
    { page: 'home', uv: 12000, pv: 34000, day: '2024-01-01' },
    { page: 'detail', uv: 8000, pv: 21000, day: '2024-01-01' },
    { page: 'cart', uv: 3000, pv: 9000, day: '2024-01-01' },
    { page: 'home', uv: 13200, pv: 36100, day: '2024-01-02' },
    { page: 'detail', uv: 8500, pv: 22300, day: '2024-01-02' },
    { page: 'cart', uv: 3200, pv: 9600, day: '2024-01-02' },
  ],
}
