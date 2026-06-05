// 헤비(약 10000줄) TSX 파일 생성 스크립트
// 목적: 한 페이지가 매우 큰 파일일 때의 동작/성능 테스트용 Test.tsx 생성
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/domains/employee/pages/Test.tsx');

const TARGET_LINES = 10000;
const lines = [];
const push = (s = '') => lines.push(s);

// ── 파일 헤더 ──────────────────────────────────────────────
push('/* eslint-disable */');
push('// ⚠ 자동 생성 파일 (scripts/gen-heavy-test.mjs)');
push('// 한 페이지가 헤비한(약 10000줄) 파일일 경우의 테스트용 컴포넌트.');
push('// 직접 편집 금지 — 재생성하려면 `node scripts/gen-heavy-test.mjs` 실행.');
push("import { useState } from 'react';");
push("import { Button, Input } from '@axiom/components/ui';");
push('');
push('interface TSectionRow {');
push('\tid: number;');
push('\tlabel: string;');
push('\tvalue: number;');
push('}');
push('');

// ── 섹션 컴포넌트 본문(약 30줄/개) ──────────────────────────
function section(i) {
	const out = [];
	out.push(`function Section${i}(): React.ReactNode {`);
	out.push(`\tconst [count, setCount] = useState(0);`);
	out.push(`\tconst [text, setText] = useState('');`);
	out.push(`\tconst rows: TSectionRow[] = [`);
	for (let r = 0; r < 6; r++) {
		out.push(`\t\t{ id: ${i * 100 + r}, label: 'row-${i}-${r}', value: ${(i + r) % 97} },`);
	}
	out.push(`\t];`);
	out.push(`\tconst total = rows.reduce((acc, row) => acc + row.value, 0);`);
	out.push('');
	out.push(`\treturn (`);
	out.push(`\t\t<section className="test-section test-section-${i}">`);
	out.push(`\t\t\t<h2>섹션 ${i}</h2>`);
	out.push(`\t\t\t<p className="summary">합계: {total} / 클릭: {count}</p>`);
	out.push(`\t\t\t<div className="controls">`);
	out.push(`\t\t\t\t<Input`);
	out.push(`\t\t\t\t\tplaceholder="섹션 ${i} 입력"`);
	out.push(`\t\t\t\t\tvalue={text}`);
	out.push(`\t\t\t\t\tonChange={(e) => setText(e.target.value)}`);
	out.push(`\t\t\t\t/>`);
	out.push(`\t\t\t\t<Button onClick={() => setCount((c) => c + 1)}>증가</Button>`);
	out.push(`\t\t\t</div>`);
	out.push(`\t\t\t<ul>`);
	out.push(`\t\t\t\t{rows.map((row) => (`);
	out.push(`\t\t\t\t\t<li key={row.id}>`);
	out.push(`\t\t\t\t\t\t{row.label}: {row.value}`);
	out.push(`\t\t\t\t\t</li>`);
	out.push(`\t\t\t\t))}`);
	out.push(`\t\t\t</ul>`);
	out.push(`\t\t</section>`);
	out.push(`\t);`);
	out.push('}');
	out.push('');
	return out;
}

// 목표 줄 수에 도달할 때까지 섹션을 생성한다(메인 페이지 약 10줄 여유 확보)
let i = 0;
while (lines.length < TARGET_LINES - 10) {
	section(i).forEach((l) => push(l));
	i++;
}
const sectionCount = i;

// ── 메인 페이지 컴포넌트 ────────────────────────────────────
push('export default function HeavyTestPage(): React.ReactNode {');
push('\treturn (');
push('\t\t<div className="heavy-test-page">');
push('\t\t\t<header className="page-header">');
push(`\t\t\t\t<h1>헤비 테스트 페이지 (${sectionCount} 섹션)</h1>`);
push('\t\t\t</header>');
for (let s = 0; s < sectionCount; s++) {
	push(`\t\t\t<Section${s} />`);
}
push('\t\t</div>');
push('\t);');
push('}');
push('');

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`생성 완료: ${OUT}`);
console.log(`섹션 수: ${sectionCount}, 총 줄 수: ${lines.length}`);
