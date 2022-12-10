import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const instructions = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) => line.trim().match(/^(?<type>addx|noop)(\s(?<value>-?\d+))?$/).groups)
	.map(({ type, value }) => ({
		type,
		value: value ? +value : undefined,
	}));

console.timeEnd('init');
console.time('part 1');

const part1Result = instructions.reduce(
	({ register, sum, count }, { type, value }) => {
		const nextCount = count + (type === 'noop' ? 1 : 2);

		const nextRegister = register + (value ?? 0);

		return {
			sum:
				sum +
				[...Array(nextCount - count).keys()]
					.map((i) => i + count + 1)
					.reduce(
						(acc, cycle) =>
							acc +
							(cycle <= 220 && (cycle - 20) % 40 === 0
								? cycle * (cycle === nextCount ? nextRegister : register)
								: 0),
						0
					),
			register: nextRegister,
			count: nextCount,
		};
	},
	{
		register: 1,
		sum: 0,
		count: 1,
	}
);

console.log(`The sum of strengths is ${part1Result.sum.toString().yellow}.`);

console.timeEnd('part 1');
console.time('part 2');

const part2Result = instructions.reduce(
	({ register, sum, count, draw }, { type, value }) => {
		const nextCount = count + (type === 'noop' ? 1 : 2);

		const nextRegister = register + (value ?? 0);

		const nextDraw = [...Array(nextCount - count).keys()]
			.map((i) => i + count)
			.reduce(
				(nextDraw, cycle) =>
					cycle % 40 <= register + 1 && cycle % 40 >= register - 1
						? [...nextDraw.slice(0, cycle), '#'.bgGreen, ...nextDraw.slice(cycle + 1)]
						: nextDraw,
				[...draw]
			);

		return {
			register: nextRegister,
			count: nextCount,
			draw: nextDraw,
		};
	},
	{
		register: 1,
		count: 0,
		draw: new Array(240).fill('.'),
	}
);

const screen = part2Result.draw.reduce(
	(screen, memory, index) => {
		const newScreen = screen.map((line) => Array.from(line));
		if (!(index % 40)) {
			newScreen.push([]);
		}
		newScreen[newScreen.length - 1].push(memory);

		return newScreen;
	},
	[[]]
);

const screenString = screen.map((line) => line.join('')).join('\n');

console.log(`The CRT display is : \n${screenString}`);

console.timeEnd('part 2');
console.timeEnd('main');
