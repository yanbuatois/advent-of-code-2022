import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const ranges = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) => line.trim())
	.filter((line) => line)
	.map((line) => line.split(',').map((range) => range.split('-').map((id) => +id)));

console.timeEnd('init');
console.time('part 1');

const isLeftOverlappingRight = ([lStart, lEnd], [rStart, rEnd]) => lStart <= rStart && lEnd >= rEnd;

const overlappingCount = ranges.filter(([elf1, elf2]) => isLeftOverlappingRight(elf1, elf2) || isLeftOverlappingRight(elf2, elf1)).length;

console.log(`There is ${overlappingCount.toString().yellow} overlapping ranges.`);

console.timeEnd('part 1');
console.time('part 2');

const isLeftPartlyOverlappingRight = ([lStart, lEnd], [rStart]) => rStart <= lEnd && rStart >= lStart;

const partlyOverlapping = ranges.filter(([elf1, elf2]) => isLeftPartlyOverlappingRight(elf1, elf2) || isLeftPartlyOverlappingRight(elf2, elf1));
const partlyOverlappingCount = partlyOverlapping.length;

console.log(`There is ${partlyOverlappingCount.toString().green} partly overlapping ranges.`);

console.timeEnd('part 2');
console.timeEnd('main');
