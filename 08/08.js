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
	NORMAL: 0,
	REVERSE: -1,
};

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

const getVisibleTrees = (
	treeMap,
	side,
	order,
	currentTrees = (side === Side.ROWS ? treeMap[0] : treeMap).map(() => -1)
) => {
	if (!treeMap.length || !treeMap[0].length || !currentTrees) {
		return [];
	} else {
		const treesToHandle = side === Side.ROWS ? treeMap.at(order) : treeMap.map((line) => line.at(order));
		const tallTrees = treesToHandle.filter(({ column, line, height }, index) => height > currentTrees[index]);

		const nextTrees =
			side === Side.ROWS
				? treeMap.slice(order === Order.NORMAL ? 1 : 0, treeMap.length + order)
				: treeMap.map((line) => line.slice(order === Order.NORMAL ? 1 : 0, line.length + order));

		return [
			...tallTrees,
			...getVisibleTrees(
				nextTrees,
				side,
				order,
				treesToHandle.map(({ height }, index) => Math.max(height, currentTrees[index]))
			),
		];
	}
};

const visibleTreesListNotFiltered = Object.values(Side)
	.map((side) =>
		Object.values(Order)
			.map((order) => getVisibleTrees(treeMap, side, order))
			.flat()
	)
	.flat();

const filteredVisibleTreesList = visibleTreesListNotFiltered.filter(
	(object, index) => visibleTreesListNotFiltered.indexOf(object) === index
);

const visibleTreesCount = filteredVisibleTreesList.length;

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
		tree.column + (side === Side.COLUMNS ? (currentDistance + 1) * (order === Order.NORMAL ? 1 : -1) : 0);
	const nextLine = tree.line + (side === Side.ROWS ? (currentDistance + 1) * (order === Order.NORMAL ? 1 : -1) : 0);
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
	Object.values(Side)
		.map((side) => Object.values(Order).map((order) => getViewDistanceForTree(treeMap, tree, side, order)))
		.flat()
		.reduce((acc, distance) => acc * distance, 1);

const maxScenicScore = Math.max(...treeMap.flat().map((tree) => getScenicScoreForTree(treeMap, tree)));

console.log(`The maximum scenic score is ${maxScenicScore.toString().green}.`);

console.timeEnd('part 2');
console.timeEnd('main');
