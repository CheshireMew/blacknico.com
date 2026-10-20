export const site = {
  name: 'BlackNico',
  author: '柴郡',
  domain: 'https://blacknico.com',
  github: 'https://github.com/CheshireMew',
  x: 'https://x.com/0xCheshire',
  telegram: 'https://t.me/CheshireBTC',
  checkedAt: '2026-10-20',
  description: '柴郡的个人空间。关于 AI、创作、投资，以及把好奇心变成作品的那些尝试。'
};

export const websites = [
  { title: '柴宝养成计划', subtitle: '写下见闻，也记录成长。', domain: 'blog.blacknico.com', url: 'https://blog.blacknico.com/', icon: 'pen', color: 'peach', label: '博客' },
  { title: 'Crypto by BlackNico', subtitle: '交易所、钱包与 Web3 入门。', domain: 'crypto.blacknico.com', url: 'https://crypto.blacknico.com/', icon: 'globe', color: 'blue', label: '学习' },
  { title: 'MyNav 导航', subtitle: '收藏值得再次打开的网站。', domain: 'nav.blacknico.com', url: 'https://nav.blacknico.com/', icon: 'compass', color: 'sage', label: '导航' },
  { title: '柴郡的订阅专栏', subtitle: '在 Substack 继续阅读。', domain: 'read.blacknico.com', url: 'https://read.blacknico.com/', icon: 'book', color: 'yellow', label: '专栏' },
  { title: '在线商城', subtitle: '产品与服务的独立入口。', domain: 'buyai.blacknico.com', url: 'https://buyai.blacknico.com/', icon: 'bag', color: 'lavender', label: '服务' }
];

export const articles = [
  { title: '谁能拒绝一只会陪你写代码的猫娘桌宠？', category: 'AI 与创造', url: 'https://blog.blacknico.com/', source: 'blog.blacknico.com', resolveTitle: true },
  { title: 'AI 时代，个人主页的第一眼印象该怎么设计？（附提示词）', category: '设计与表达', url: 'https://blog.blacknico.com/', source: 'blog.blacknico.com', resolveTitle: true },
  { title: '2142 个 RSS 订阅源整理：从 AI、技术、投资到独立博客、播客与公众号', category: '阅读与发现', url: 'https://blog.blacknico.com/', source: 'blog.blacknico.com', resolveTitle: true }
];

// 比例来自站主提供的邀请信息；不把普通邀请链接误标为已核实的账户权益。
export const referrals = [
  { id: 'binance', group: 'exchange', name: '币安', english: 'BINANCE', benefit: '20%', benefitLabel: '手续费优惠', description: '通过邀请链接注册，并在平台确认邀请关系与适用优惠。', url: 'https://binance.com/join?ref=SRXT5KUM', codes: [{ label: '注册邀请码', value: 'SRXT5KUM' }, { label: '合约邀请码', value: '416378774' }], cta: '前往币安注册', color: 'binance', icon: 'binance' },
  { id: 'okx', group: 'exchange', name: '欧易', english: 'OKX', benefit: '20%', benefitLabel: '手续费优惠', description: '通过专属入口创建账户，完成注册前核对邀请码。', url: 'https://okx.com/join/A999998', codes: [{ label: '注册邀请码', value: 'A999998' }], cta: '前往 OKX 注册', color: 'okx', icon: 'okx' },
  { id: 'okx-wallet', group: 'wallet', name: 'OKX Web3 钱包', english: 'OKX WALLET', benefit: '8 折', benefitLabel: '适用服务费', description: '打开钱包邀请入口，按平台提示绑定邀请码。', url: 'https://web3.okx.com/ul/joindex?ref=1234567', codes: [{ label: '钱包邀请码', value: '1234567' }], cta: '打开 OKX 钱包邀请', color: 'okx-wallet', icon: 'okx' },
  { id: 'binance-wallet', group: 'wallet', name: '币安 Web3 钱包', english: 'BINANCE WALLET', benefit: '9 折', benefitLabel: '适用服务费', description: '进入官方钱包邀请页，核对并绑定专属邀请码。', url: 'https://web3.binance.com/referral?ref=RP3AEJ2M', codes: [{ label: '钱包邀请码', value: 'RP3AEJ2M' }], cta: '打开币安钱包邀请', color: 'binance-wallet', icon: 'binance' }
];
