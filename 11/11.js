import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const monkeys = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trimEnd()
	.split(/(\r?\n){2}/)
	.filter((line) => line.trim())
	.map(
		(monkeyText) =>
			monkeyText.match(
				/^Monkey (?<monkeyNumber>\d+):\r?\n\s*Starting items: (?<startingItems>((\d+)(,\s)?)+)\r?\n\s*Operation: new = ((?<leftOperand>old|(\d+))\s(?<operator>[+*])\s(?<rightOperand>old|(\d+)))\r?\n\s*Test: divisible by (?<divisor>\d+)\r?\n\s*If true: throw to monkey (?<monkeyIfTrue>\d+)\r?\n\s*If false: throw to monkey (?<monkeyIfFalse>\d+)$/
			).groups
	)
	.map(
		({
			monkeyNumber,
			startingItems,
			leftOperand,
			operator,
			rightOperand,
			divisor,
			monkeyIfTrue,
			monkeyIfFalse,
		}) => ({
			number: +monkeyNumber,
			startingItems: startingItems.split(',').map((item) => +item.trim()),
			leftOperand: Number.isNaN(+leftOperand) ? null : +leftOperand,
			operator,
			rightOperand: Number.isNaN(+rightOperand) ? null : +rightOperand,
			divisor: +divisor,
			monkeyIfTrue: +monkeyIfTrue,
			monkeyIfFalse: +monkeyIfFalse,
		})
	);

const monkeysWithMovedCount = monkeys.map((monkey) => ({
	...monkey,
	movedCount: 0,
}));

const playRoundForMonkey = (monkey, customDivider) => {
	const [nextItem, ...remainingItems] = monkey.startingItems;
	if (!nextItem) {
		return [];
	}
	const parsedLeftOperand = monkey.leftOperand ?? nextItem;
	const parsedRightOperand = monkey.rightOperand ?? nextItem;
	const newWorryingLevel = ((leftOperand, operator, rightOperand) => {
		switch (operator) {
			case '+':
				return leftOperand + rightOperand;
			case '*':
				return leftOperand * rightOperand;
			default:
				console.warn(`Unhandled operator ${operator} !`);
				return leftOperand;
		}
	})(parsedLeftOperand, monkey.operator, parsedRightOperand);
	const boredWorryingLevel = customDivider ? newWorryingLevel % customDivider : Math.floor(newWorryingLevel / 3);
	const newMonkey = boredWorryingLevel % monkey.divisor ? monkey.monkeyIfFalse : monkey.monkeyIfTrue;
	const moveToDo = {
		item: boredWorryingLevel,
		monkey: newMonkey,
	};

	return remainingItems.length
		? [
				...playRoundForMonkey(
					{
						...monkey,
						startingItems: remainingItems,
					},
					customDivider
				),
				moveToDo,
		  ]
		: [moveToDo];
};

const playRound = (monkeys, customDivider) =>
	monkeys.reduce(
		(newMonkeys, currentMonkey) => {
			const movesToDo = playRoundForMonkey(
				newMonkeys.find((monkey) => monkey.number === currentMonkey.number),
				customDivider
			);

			return newMonkeys.map((monkey) => ({
				...monkey,
				startingItems:
					currentMonkey.number === monkey.number
						? []
						: [
								...monkey.startingItems,
								...movesToDo
									.filter(({ monkey: newMonkeyNumber }) => newMonkeyNumber === monkey.number)
									.map(({ item }) => item),
						  ],
				movedCount: monkey.movedCount + (currentMonkey.number === monkey.number ? movesToDo.length : 0),
			}));
		},
		monkeys.map((monkey) => ({ ...monkey }))
	);

const playRounds = (monkeys, roundsCount = 20, customDivider = null) =>
	new Array(roundsCount).fill(0).reduce(
		(oldMonkeys) => playRound(oldMonkeys, customDivider),
		monkeys.map((monkey) => ({ ...monkey }))
	);

console.timeEnd('init');
console.time('part 1');

const finalMonkeysPart1 = playRounds(monkeysWithMovedCount);
const bestMonkeysPart1 = Array.from(finalMonkeysPart1)
	.sort(({ movedCount: a }, { movedCount: b }) => b - a)
	.slice(0, 2);
const monkeyBusinessLevelPart1 = bestMonkeysPart1.reduce((acc, { movedCount }) => acc * movedCount, 1);

console.log(`The level of monkey business after 20 rounds is ${monkeyBusinessLevelPart1.toString().yellow}.`);

console.timeEnd('part 1');
console.time('part 2');

const customDivider = monkeysWithMovedCount.reduce((acc, { divisor }) => acc * divisor, 1);

const finalMonkeysPart2 = playRounds(monkeysWithMovedCount, 10_000, customDivider);
const bestMonkeysPart2 = Array.from(finalMonkeysPart2)
	.sort(({ movedCount: a }, { movedCount: b }) => b - a)
	.slice(0, 2);
const monkeyBusinessLevelPart2 = bestMonkeysPart2.reduce((acc, { movedCount }) => acc * movedCount, 1);

console.log(`The level of monkey business after 10 000 rounds is ${monkeyBusinessLevelPart2.toString().green}.`);

console.timeEnd('part 2');
console.timeEnd('main');
