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
	.map((line) => line.trim().match(/^(?<direction>[RULD])\s(?<distance>\d+)$/).groups)
	.map(({ direction, distance }) => ({
		direction,
		distance: +distance,
	}));

const moveTail = (head, tail) => {
	if (Math.abs(head.x - tail.x) <= 1 && Math.abs(head.y - tail.y) <= 1) {
		return {
			tail,
			visited: [tail],
		};
	}

	const xDifference = head.x - tail.x;
	const yDifference = head.y - tail.y;

	const newTail = {
		x: tail.x + (xDifference === 0 ? 0 : xDifference > 0 ? 1 : -1),
		y: tail.y + (yDifference === 0 ? 0 : yDifference > 0 ? 1 : -1),
	};

	const { tail: nextNewTail, visited } = moveTail(head, newTail);

	return { tail: nextNewTail, visited: [tail, ...visited] };
};

const moveRope = (head, rope) => {
	const [nextNode, ...remainingRope] = rope;
	const { visited, tail: nextNewNode } = moveTail(head, nextNode);

	const { visited: nextVisited, rope: nextRope } = remainingRope.length
		? moveRope(nextNewNode, remainingRope)
		: {
				visited,
				rope: [],
		  };

	return {
		visited: nextVisited,
		rope: [nextNewNode, ...nextRope],
	};
};

const handleInstruction = (direction, distance, [head, ...rope]) => {
	const newHead = {
		x: head.x + (direction === 'R' ? 1 : direction === 'L' ? -1 : 0),
		y: head.y + (direction === 'U' ? 1 : direction === 'D' ? -1 : 0),
	};

	const { rope: newRope, visited } = moveRope(newHead, rope);

	const nextRope = [newHead, ...newRope];

	const { visited: nextVisited, newRope: nextNewRope } =
		distance === 1
			? {
					visited: [],
					newRope: nextRope,
			  }
			: handleInstruction(direction, distance - 1, nextRope);

	return {
		newRope: nextNewRope,
		visited: [...visited, ...nextVisited],
	};
};

const listVisitedCells = (
	instructions,
	ropeLength = 2,
	rope = new Array(ropeLength).fill({
		x: 0,
		y: 0,
	})
) => {
	const [{ direction, distance }, ...remainingInstructions] = instructions;

	const { newRope, visited } = handleInstruction(direction, distance, rope);

	return [
		...visited,
		...(remainingInstructions.length ? listVisitedCells(remainingInstructions, ropeLength, newRope) : []),
	];
};

console.timeEnd('init');
console.time('part 1');

const visitedCellsWithoutFilter = listVisitedCells(instructions);
const visitedCells = visitedCellsWithoutFilter.filter(
	(cell, index) => index === visitedCellsWithoutFilter.findIndex(({ x, y }) => cell.x === x && cell.y === y)
);
const visitedCellsCount = visitedCells.length;

console.log(`You have visited ${visitedCellsCount.toString().yellow} cells.`);

console.timeEnd('part 1');
console.time('part 2');

const part2VisitedCellsWithoutFilter = listVisitedCells(instructions, 10);
const part2VisitedCells = part2VisitedCellsWithoutFilter.filter(
	(cell, index) => index === part2VisitedCellsWithoutFilter.findIndex(({ x, y }) => cell.x === x && cell.y === y)
);
const part2VisitedCellsCount = part2VisitedCells.length;

console.log(`With the long ropes, you have visited ${part2VisitedCellsCount.toString().green} cells.`);

console.timeEnd('part 2');
console.timeEnd('main');
