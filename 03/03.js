import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const rucksacks = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) => line.trim())
	.filter((line) => line)
	.map((line) => [...line]);

const letterToPriority = (letter) =>
	letter < 'a' ? letter.charCodeAt(0) - 'A'.charCodeAt(0) + 27 : letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

console.timeEnd('init');
console.time('part 1');

const priorities = rucksacks
	.map((line) => [line.slice(0, line.length / 2), line.slice(line.length / 2, line.length)])
	.map(([left, right]) => letterToPriority(left.find((letter) => right.includes(letter))));
const prioritiesSum = priorities.reduce((acc, elt) => acc + elt);

console.log(`The priorities sum is ${prioritiesSum.toString().yellow}`);

console.timeEnd('part 1');
console.time('part 2');

const groups = rucksacks.reduce(
	(acc, rucksack) => {
		const currentGroup = acc[acc.length - 1];
		if (currentGroup.length === 3) {
			acc.push([rucksack]);
		} else {
			currentGroup.push(rucksack);
		}
		return acc;
	},
	[[]]
);
const commonItems = groups.map(
	(group) => group.reduce((acc, rucksack) => acc.filter((toy) => rucksack.includes(toy)))[0]
);
const commonItemsPrioritiesSum = commonItems
	.map((letter) => letterToPriority(letter))
	.reduce((acc, priority) => acc + priority);

console.log(`The badges priority sum is ${commonItemsPrioritiesSum.toString().green}`);

console.timeEnd('part 2');
console.timeEnd('main');
