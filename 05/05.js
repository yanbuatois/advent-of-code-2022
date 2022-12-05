import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const lines = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trimEnd()
	.split('\n');

const originalStacksLines = lines
	.filter((line) => line.includes('['))
	.map((line) =>
		[...line.matchAll(/(\[(?<letter>\D)]|\s{3})\s?/g)].map((matchResult) => matchResult.groups?.letter ?? '')
	);

const originalStacks = originalStacksLines
	.reduce(
		(acc, line, lineIndex) =>
			line.reduce((lineAcc, element, index) => {
				if (element) {
					if (!acc[index]) {
						acc[index] = [];
					}
					acc[index][lineIndex] = element;
				}
				return acc;
			}, acc),
		[]
	)
	.map((reversedStack) => reversedStack.filter((element) => element).reverse());

const moveLines = lines
	.filter((line) => line.includes('move'))
	.map((line) => line.match(/move\s(?<quantity>\d+)\sfrom\s(?<from>\d+)\sto\s(?<to>\d+)/)?.groups)
	.filter((line) => line)
	.map((matchObject) => ({
		from: +matchObject.from,
		to: +matchObject.to,
		quantity: +matchObject.quantity,
	}));

const handleMoveLines = (funMoveLines, stacks, moveFunction) => {
	const stacksCopy = stacks.map((stack) => Array.from(stack));
	if (!funMoveLines.length) {
		return stacksCopy;
	}
	const [{ from, to, quantity }, ...rest] = funMoveLines;

	return handleMoveLines(rest, moveFunction(stacksCopy, from, to, quantity), moveFunction);
};

console.timeEnd('init');
console.time('part 1');

const moveOnStacks = (stacks, from, to, quantity) => {
	const stacksCopy = stacks.map((stack) => [...stack]);

	const removedItem = stacksCopy[from - 1].pop();
	stacksCopy[to - 1].push(removedItem);

	return quantity === 1 ? stacksCopy : moveOnStacks(stacksCopy, from, to, quantity - 1);
};

const finalPart1Stacks = handleMoveLines(moveLines, originalStacks, moveOnStacks);
const p1Result = finalPart1Stacks.reduce((acc, elt) => acc + elt[elt.length - 1], '');

console.log(`The top of each stack is ${p1Result.toString().yellow}`);

console.timeEnd('part 1');
console.time('part 2');

const newMoveOnStacks = (stacks, from, to, quantity) => {
	const stacksCopy = stacks.map((stack) => [...stack]);

	const removedItems = stacksCopy[from - 1].splice(stacksCopy[from - 1].length - quantity);
	stacksCopy[to - 1].push(...removedItems);

	return stacksCopy;
};

const finalPart2Stacks = handleMoveLines(moveLines, originalStacks, newMoveOnStacks);
const p2Result = finalPart2Stacks.reduce((acc, elt) => acc + elt[elt.length - 1], '');

console.log(`The top of each stack with new moving system is ${p2Result.toString().green}`);

console.timeEnd('part 2');
console.timeEnd('main');
