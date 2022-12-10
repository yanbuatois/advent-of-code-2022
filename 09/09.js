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

console.timeEnd('init');
console.time('part 1');

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

const handleInstruction = (direction, distance, { tail, head }) => {
	const newHead = {
		x: head.x + (direction === 'R' ? 1 : direction === 'L' ? -1 : 0),
		y: head.y + (direction === 'U' ? 1 : direction === 'D' ? -1 : 0),
	};

	const { tail: newTail, visited } = moveTail(newHead, tail);

	const newNode = {
		head: newHead,
		tail: newTail,
	};

	const { visited: nextVisited, newNode: nextNewNode } =
		distance === 1
			? {
					visited: [],
					newNode,
			  }
			: handleInstruction(direction, distance - 1, newNode);

	return {
		newNode: nextNewNode,
		visited: [...visited, ...nextVisited],
	};
};

const listVisitedCells = (
	instructions,
	node = {
		tail: {
			x: 0,
			y: 0,
		},
		head: {
			x: 0,
			y: 0,
		},
	}
) => {
	const [{ direction, distance }, ...remainingInstructions] = instructions;

	const { newNode, visited } = handleInstruction(direction, distance, node);

	return [...visited, ...(remainingInstructions.length ? listVisitedCells(remainingInstructions, newNode) : [])];
};

const visitedCellsWithoutFilter = listVisitedCells(instructions);
const visitedCells = visitedCellsWithoutFilter.filter(
	(cell, index) => index === visitedCellsWithoutFilter.findIndex(({ x, y }) => cell.x === x && cell.y === y)
);
const visitedCellsCount = visitedCells.length;

console.log(`You have visited ${visitedCellsCount.toString().yellow} cells.`);

console.timeEnd('part 1');
console.time('part 2');

console.timeEnd('part 2');
console.timeEnd('main');
