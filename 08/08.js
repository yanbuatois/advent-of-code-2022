import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const Side = {
	COLUMNS: 0,
	ROWS: 1,
};

const Order = {
	NORMAL: 1,
	REVERSE: -1,
};

const sideOrderCombination = Object.values(Side)
	.map((side) => Object.values(Order).map((order) => [side, order]))
	.flat();

const treeMap = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) => [...line.trim()].map((number) => +number))
	.map((trees, line) =>
		trees.map((height, column) => ({
			height,
			line,
			column,
		}))
	);

console.timeEnd('init');
console.time('part 1');

const checkIfVisibleTreeInDirection = (treeMap, tree, side, order, currentDistance = 0) => {
	const nextColumn =
		tree.column + (side === Side.COLUMNS ? (currentDistance + 1) * order : 0);
	const nextLine = tree.line + (side === Side.ROWS ? (currentDistance + 1) * order : 0);
	const nextHeight = treeMap?.[nextLine]?.[nextColumn];
	if (nextHeight == null) {
		return true;
	} else if (tree.height <= nextHeight.height) {
		return false;
	} else {
		return checkIfVisibleTreeInDirection(treeMap, tree, side, order, currentDistance + 1);
	}
};

const checkIfVisibleTree = (treeMap, tree) =>
	sideOrderCombination.reduce(
		(acc, [side, order]) => acc || checkIfVisibleTreeInDirection(treeMap, tree, side, order),
		false
	);

const visibleTrees = treeMap.flat().filter((tree) => checkIfVisibleTree(treeMap, tree));

const visibleTreesCount = visibleTrees.length;

// const gridString = treeMap.reduce(
// 	(acc, line) =>
// 		acc +
// 		line.reduce(
// 			(lineString, tree) =>
// 				`${lineString}${
// 					filteredVisibleTreesList.some(({ line, column }) => tree.line === line && tree.column === column)
// 						? tree.height.toString().bgGreen
// 						: tree.height.toString().bgRed
// 				}`,
// 			''
// 		) +
// 		'\n',
// 	''
// );
//
// console.log(gridString);

console.log(`There is ${visibleTreesCount.toString().yellow} visible trees.`);

console.timeEnd('part 1');
console.time('part 2');

const getViewDistanceForTree = (treeMap, tree, side, order, currentDistance = 0) => {
	const nextColumn =
		tree.column + (side === Side.COLUMNS ? (currentDistance + 1) * order : 0);
	const nextLine = tree.line + (side === Side.ROWS ? (currentDistance + 1) * order : 0);
	const nextHeight = treeMap?.[nextLine]?.[nextColumn];
	if (nextHeight == null) {
		return currentDistance;
	} else if (tree.height <= nextHeight.height) {
		return currentDistance + 1;
	} else {
		return getViewDistanceForTree(treeMap, tree, side, order, currentDistance + 1);
	}
};

const getScenicScoreForTree = (treeMap, tree) =>
	sideOrderCombination
		.map(([side, order]) => getViewDistanceForTree(treeMap, tree, side, order))
		.reduce((acc, distance) => acc * distance, 1);

const maxScenicScore = Math.max(...treeMap.flat().map((tree) => getScenicScoreForTree(treeMap, tree)));

console.log(`The maximum scenic score is ${maxScenicScore.toString().green}.`);

console.timeEnd('part 2');
console.timeEnd('main');
