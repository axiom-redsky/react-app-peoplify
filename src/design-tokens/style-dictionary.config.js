import StyleDictionary from 'style-dictionary';

// Tailwind v4 @theme 블록 (primitive 토큰용)
StyleDictionary.registerFormat({
  name: 'css/tailwind-v4-theme',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n@theme {\n${vars}\n}\n`;
  },
});

// CSS :root 블록 (시맨틱 라이트용)
StyleDictionary.registerFormat({
  name: 'css/semantic-root',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n:root {\n${vars}\n}\n`;
  },
});

// CSS .dark 블록 (시맨틱 다크용)
StyleDictionary.registerFormat({
  name: 'css/semantic-dark',
  format: ({ dictionary }) => {
    const vars = dictionary.allTokens
      .map(t => `  ${t.name}: ${t.value};`)
      .join('\n');
    return `/* AUTO-GENERATED — do not edit manually */\n.dark {\n${vars}\n}\n`;
  },
});

// token path → CSS 변수명: color.brand.500 → --color-brand-500
StyleDictionary.registerTransform({
  name: 'name/css/kebab',
  type: 'name',
  transform: (token) =>
    '--' + token.path.join('-').toLowerCase().replace(/_/g, '-'),
});

const config = {
  usesDtcg: true,
  platforms: {
    // Primitive: @theme {} 블록
    css_primitive: {
      source: ['src/design-tokens/primitive/**/*.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        {
          destination: 'primitive.css',
          format: 'css/tailwind-v4-theme',
        },
      ],
    },
    // Semantic light: :root {} 블록
    css_light: {
      source: ['src/design-tokens/primitive/**/*.json', 'src/design-tokens/semantic/light.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        {
          destination: 'theme-light.css',
          format: 'css/semantic-root',
          filter: t => t.filePath.includes('semantic/light'),
        },
      ],
    },
    // Semantic dark: .dark {} 블록
    css_dark: {
      source: ['src/design-tokens/primitive/**/*.json', 'src/design-tokens/semantic/dark.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/assets/styles/tokens/',
      files: [
        {
          destination: 'theme-dark.css',
          format: 'css/semantic-dark',
          filter: t => t.filePath.includes('semantic/dark'),
        },
      ],
    },
    // TypeScript 타입 선언 — 소스 JSON과 같은 디렉터리에 배치
    ts: {
      source: ['src/design-tokens/primitive/**/*.json'],
      transforms: ['name/css/kebab'],
      buildPath: 'src/design-tokens/',
      files: [{ destination: 'types.d.ts', format: 'typescript/es6-declarations' }],
    },
  },
};

export default config;
