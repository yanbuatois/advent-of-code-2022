import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');
const calories = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) => line.trim())
	.reduce(
		(acc, row) => {
			if (!row) {
				acc.push(0);
			} else {
				acc[acc.length - 1] += +row;
			}
			return acc;
		},
		[0]
	);

console.timeEnd('init');

console.time('part 1');
const maxCalories = Math.max(...calories);

console.log(`The maximum calories is ${maxCalories.toString().red} !`);

console.timeEnd('part 1');
console.time('part 2');
const nbMaxOfArray = (array, number = 3) =>
	array.length <= number
		? Array.from(array)
		: nbMaxOfArray(
				array.filter((elt, index) => index !== array.indexOf(Math.min(...array))),
				number
		  );
const threeMaxCalories = nbMaxOfArray(calories);
const threeMaxCaloriesSum = threeMaxCalories.reduce((acc, value) => acc + value);

console.log(`The sum of the three max calories is ${threeMaxCaloriesSum.toString().green} !`);
console.timeEnd('part 2');
console.timeEnd('main');
