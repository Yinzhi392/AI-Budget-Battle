import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  ChevronRight,
  CodeXml,
  Images,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { HeroVisualMotion, Reveal } from "@/components/landing-motion";

const processSteps = [
  {
    title: "丢进账单",
    description: "月度总结、几张代表性截图，或者手动补几笔都可以。",
    icon: Images,
  },
  {
    title: "确认事实",
    description: "你可以修改分类和金额。未经确认的数据不会进入战报。",
    icon: CheckCheck,
  },
  {
    title: "揭晓人格",
    description: "AI 把消费习惯变成人格、吐槽、分数和分享卡。",
    icon: ScanSearch,
  },
];

const privacyPoints = [
  "原始截图最长保留 24 小时",
  "分享卡默认隐藏商户明细",
  "学生基准不冒充真实校园排名",
];

export function LandingPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#090a0a] text-[#f3f5ef]">
      <div className="site-atmosphere pointer-events-none fixed inset-0" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-7 lg:px-10">
        <header className="flex h-[72px] items-center justify-between border-b border-white/10">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="AI Budget Battle 首页">
            <span className="grid size-10 place-items-center rounded-[14px] bg-[#c8ff54] text-[#10120d] transition-transform duration-300 group-hover:-rotate-3 group-active:scale-[0.96]">
              <Sparkles className="size-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-[-0.02em] sm:text-base">
              AI Budget Battle
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="主要导航">
            <a
              href="#how-it-works"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#b8bdb3] transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            >
              怎么玩
            </a>
            <a
              href="#privacy"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#b8bdb3] transition hover:bg-white/[0.06] hover:text-white md:inline-flex"
            >
              隐私
            </a>
            <a
              href="https://github.com/Yinzhi392/AI-Budget-Battle"
              target="_blank"
              rel="noreferrer"
              className="grid size-10 place-items-center rounded-full text-[#b8bdb3] transition hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
              aria-label="在 GitHub 查看项目"
            >
              <CodeXml className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
            </a>
            <Link
              href="/battle/start"
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-[#c8ff54] px-4 text-sm font-bold text-[#10120d] transition hover:bg-[#d8ff82] active:scale-[0.98] sm:px-5"
            >
              开始战斗
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <section className="grid min-h-[calc(100dvh-72px)] items-center gap-10 py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] md:py-12 lg:gap-16">
          <div className="max-w-[660px]">
            <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8ff54]">
              你的消费人格，正在加载
            </p>
            <h1 className="text-[clamp(3.15rem,7.1vw,7.1rem)] font-black leading-[0.86] tracking-[-0.075em] text-[#f4f6f0]">
              <span className="block">AI Budget</span>
              <span className="mt-2 block text-[#c8ff54]">Battle</span>
            </h1>
            <p className="mt-7 max-w-[540px] text-base leading-7 text-[#b8bdb3] sm:text-lg sm:leading-8">
              不用整理完整账本。上传几张账单，生成一份能分享的消费人格战报。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/battle/start"
                className="inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full bg-[#c8ff54] px-6 text-sm font-extrabold text-[#10120d] transition hover:bg-[#d8ff82] active:scale-[0.98]"
              >
                开始战斗
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </Link>
              <a
                href="#sample-report"
                className="inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full border border-white/14 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                先看战报
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
          </div>

          <HeroVisualMotion>
            <div className="relative mx-auto h-full max-h-[760px] min-h-[430px] w-full max-w-[680px] overflow-hidden rounded-[28px] bg-[#111311] sm:min-h-[560px] md:min-h-[620px]">
              <Image
                src="/editorial/budget-battle-hero.jpg"
                alt="奶茶、耳机、运动鞋和硬币组成的消费主题视觉"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, (min-width: 768px) 48vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0a]/55 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 rounded-[18px] border border-white/12 bg-[#11130f]/82 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div>
                  <p className="text-xs font-semibold text-[#aeb4aa]">本月人格样例</p>
                  <p className="mt-1 text-xl font-black tracking-[-0.03em] text-white sm:text-2xl">奶茶黑洞人格</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[11px] text-[#aeb4aa]">冲动指数</p>
                  <p className="mt-1 text-2xl font-black text-[#c8ff54] sm:text-3xl">82</p>
                </div>
              </div>
            </div>
          </HeroVisualMotion>
        </section>

        <Reveal>
          <section id="how-it-works" className="py-24 sm:py-32">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
                上传少一点，看到多一点
              </h2>
              <p className="mt-5 max-w-[620px] text-base leading-7 text-[#aeb4aa] sm:text-lg">
                AI 负责识别和归类，你只负责确认。整个过程先体验，再决定是否登录。
              </p>
            </div>

            <div className="mt-12 grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
              <div className="relative min-h-[420px] overflow-hidden rounded-[24px] bg-[#111311] sm:min-h-[520px]">
                <Image
                  src="/editorial/budget-battle-process.jpg"
                  alt="账单、硬币与消费结构图组成的桌面静物"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-center">
                {processSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="grid grid-cols-[48px_1fr] gap-4 border-b border-white/10 py-6 first:pt-0 last:border-b-0 last:pb-0 lg:py-8"
                    >
                      <span className="grid size-12 place-items-center rounded-[16px] bg-[#c8ff54]/10 text-[#c8ff54]">
                        <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-mono text-[#777d74]">0{index + 1}</p>
                        <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#aeb4aa]">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="sample-report" className="py-24 sm:py-32">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8ff54]">
              一份战报，不是一张表
            </p>
            <h2 className="mt-5 max-w-[760px] text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
              有点好笑，也有点准
            </h2>

            <div className="mt-12 grid overflow-hidden rounded-[28px] bg-[#c8ff54] text-[#10120d] lg:grid-cols-[1.15fr_0.85fr]">
              <div className="flex min-h-[470px] flex-col justify-between p-6 sm:p-10 lg:p-14">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#10120d]/16 px-3 py-2 text-xs font-bold">
                    <Sparkles className="size-4" strokeWidth={2} aria-hidden="true" />
                    消费人格样例
                  </span>
                  <span className="font-mono text-xs font-semibold">本月</span>
                </div>
                <div>
                  <p className="text-lg font-bold">你的消费人格是</p>
                  <h3 className="mt-3 text-[clamp(3.1rem,7vw,6.8rem)] font-black leading-[0.86] tracking-[-0.07em]">
                    奶茶黑洞
                  </h3>
                  <p className="mt-8 max-w-[560px] text-lg font-semibold leading-8 sm:text-2xl sm:leading-9">
                    你不是在买奶茶，你是在给情绪续命。小额支出不吓人，稳定出现才吓人。
                  </p>
                </div>
              </div>

              <div className="grid content-between gap-10 bg-[#11130f] p-6 text-white sm:p-10 lg:p-12">
                <div>
                  <p className="text-sm font-semibold text-[#9da398]">战斗分数</p>
                  <p className="mt-3 text-[clamp(5rem,10vw,9rem)] font-black leading-none tracking-[-0.08em] text-[#c8ff54]">
                    68
                  </p>
                  <p className="mt-3 max-w-[320px] text-sm leading-6 text-[#aeb4aa]">
                    基于确认后的消费记录生成，仅作娱乐化自我观察。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-white/[0.06] p-4">
                    <p className="text-xs text-[#90968d]">冲动指数</p>
                    <p className="mt-2 text-3xl font-black">82</p>
                  </div>
                  <div className="rounded-[18px] bg-white/[0.06] p-4">
                    <p className="text-xs text-[#90968d]">稳定指数</p>
                    <p className="mt-2 text-3xl font-black">72</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="privacy" className="py-24 sm:py-32">
            <div className="grid gap-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-14">
              <div>
                <span className="grid size-12 place-items-center rounded-[16px] bg-[#c8ff54] text-[#10120d]">
                  <LockKeyhole className="size-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <h2 className="mt-8 text-4xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-5xl">
                  玩得尽兴，数据克制
                </h2>
                <p className="mt-5 max-w-[520px] text-base leading-7 text-[#aeb4aa]">
                  这是一份消费人格战报，不是信用评分，也不是理财建议。
                </p>
              </div>

              <div className="flex flex-col justify-center">
                {privacyPoints.map((point) => (
                  <div key={point} className="flex items-center gap-4 border-b border-white/10 py-6 first:pt-0 last:border-b-0 last:pb-0">
                    <ShieldCheck className="size-5 shrink-0 text-[#c8ff54]" strokeWidth={1.8} aria-hidden="true" />
                    <p className="text-base font-semibold text-[#d8dcd4] sm:text-lg">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="py-24 text-center sm:py-36">
            <h2 className="mx-auto max-w-[900px] text-5xl font-black leading-[0.92] tracking-[-0.065em] text-white sm:text-7xl lg:text-8xl">
              这月的钱，都去哪了？
            </h2>
            <p className="mx-auto mt-6 max-w-[520px] text-base leading-7 text-[#aeb4aa] sm:text-lg">
              三分钟做完一场 Budget Battle，看看 AI 会怎么形容你。
            </p>
            <Link
              href="/battle/start"
              className="mt-8 inline-flex min-h-13 items-center gap-2 whitespace-nowrap rounded-full bg-[#c8ff54] px-7 text-sm font-extrabold text-[#10120d] transition hover:bg-[#d8ff82] active:scale-[0.98]"
            >
              开始战斗
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </section>
        </Reveal>

        <footer className="grid gap-5 border-t border-white/10 py-8 text-sm text-[#858b82] sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-semibold text-[#d5d9d1]">AI Budget Battle</p>
            <p className="mt-1">Developer: Yinzhi</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/history" className="transition hover:text-white">历史战报</Link>
            <a
              href="https://github.com/Yinzhi392/AI-Budget-Battle"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
            <span>仅作娱乐化消费观察</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
