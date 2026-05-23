export type PersonaImage = {
  src: string;
  alt: string;
};

const personaImageByTitle: Record<string, string> = {
  奶茶黑洞人格: "/personas/milk-tea-black-hole.png",
  外卖依赖人格: "/personas/takeout-dependent.png",
  外卖续命人格: "/personas/takeout-dependent.png",
  生存模式人格: "/personas/survival-mode.png",
  卷王燃烧人格: "/personas/grind-burnout.png",
  社交燃烧人格: "/personas/social-burnout.png",
  游戏氪金战神人格: "/personas/game-spending-warrior.png",
  网购拆箱成瘾人格: "/personas/unboxing-addict.png",
  出门即打车人格: "/personas/taxi-everywhere.png",
  假精致人格: "/personas/fake-refined.png",
  焦虑奋斗人格: "/personas/anxious-hustler.png",
};

const personaEmojiByTitle: Record<string, string> = {
  奶茶黑洞人格: "🧋",
  外卖依赖人格: "🥡",
  外卖续命人格: "🥡",
  生存模式人格: "🛟",
  卷王燃烧人格: "🔥",
  社交燃烧人格: "🎉",
  游戏氪金战神人格: "🎮",
  网购拆箱成瘾人格: "📦",
  出门即打车人格: "🚕",
  假精致人格: "💅",
  焦虑奋斗人格: "⚡",
};

const personaImageVersion = "black-bg-20260522-2";

export function getPersonaDisplayTitle(title: string): string {
  const emoji = personaEmojiByTitle[title];

  return emoji ? `${title}${emoji}` : title;
}

export function getPersonaImage(title: string): PersonaImage | undefined {
  const src = personaImageByTitle[title];

  if (!src) {
    return undefined;
  }

  return {
    src: `${src}?v=${personaImageVersion}`,
    alt: `${title}角色图`,
  };
}
