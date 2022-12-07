import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const COMMAND_REGEX = /^\$\s(?<command>cd|ls)(\s(?<argument>\S+))?$/;
const DIRENTRY_REGEX = /^(?<entryType>dir|\d+)\s(?<name>\S+)$/;

const lines = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) => {
		const lineResult = line.match(COMMAND_REGEX);
		if (lineResult) {
			return {
				entryType: 'COMMAND',
				command: lineResult.groups.command,
				argument: lineResult.groups.argument,
			};
		} else {
			const entryResult = line.match(DIRENTRY_REGEX);
			if (entryResult.groups.entryType === 'dir') {
				return {
					entryType: 'DIRECTORY',
					name: entryResult.groups.name,
				};
			} else {
				return {
					entryType: 'FILE',
					size: +entryResult.groups.entryType,
					name: entryResult.groups.name,
				};
			}
		}
	});

const setObjectProperty = (object, path, value) => {
	if (path.length === 1) {
		return {
			...object,
			[path[0]]: value,
		};
	} else {
		return {
			...object,
			[path[0]]: setObjectProperty(object[path[0]], path.slice(1), value),
		};
	}
};

const computeTreeSize = (fileTree) =>
	typeof fileTree === 'number'
		? fileTree
		: Object.keys(fileTree).reduce((acc, key) => acc + computeTreeSize(fileTree[key]), 0);

const buildTree = (lines, currentPath = [], fileTree = {}) => {
	if (!lines.length) {
		return fileTree;
	}

	const [firstLine, ...remainingLines] = lines;
	switch (firstLine.entryType) {
		case 'COMMAND':
			if (firstLine.command === 'cd') {
				if (firstLine.argument === '..') {
					return buildTree(remainingLines, currentPath.slice(0, currentPath.length - 1), fileTree);
				} else if (firstLine.argument === '/') {
					return buildTree(remainingLines, [], fileTree);
				} else {
					return buildTree(remainingLines, [...currentPath, firstLine.argument], fileTree);
				}
			}
			return buildTree(remainingLines, currentPath, fileTree);
		case 'DIRECTORY':
			return buildTree(
				remainingLines,
				currentPath,
				setObjectProperty(fileTree, [...currentPath, firstLine.name], {})
			);
		case 'FILE':
			return buildTree(
				remainingLines,
				currentPath,
				setObjectProperty(fileTree, [...currentPath, firstLine.name], firstLine.size)
			);
		default:
			console.warn(`Unhandled line type ${firstLine.entryType}. Ignored.`);
			return buildTree(remainingLines, currentPath, fileTree);
	}
};

const finalTree = buildTree(lines);

console.timeEnd('init');
console.time('part 1');

const listLittleDirectoriesSizes = (fileTree) => {
	if (typeof fileTree === 'number') {
		return [];
	} else {
		const treeSize = computeTreeSize(fileTree);
		return [
			...(treeSize < 100_000 ? [treeSize] : []),
			...Object.values(fileTree).reduce((acc, value) => [...acc, ...listLittleDirectoriesSizes(value)], []),
		];
	}
};
const treeSizeWithLittleDirectories = listLittleDirectoriesSizes(finalTree).reduce((acc, elt) => acc + elt, 0);

console.log(`The size of all little directories is ${treeSizeWithLittleDirectories.toString().yellow}`);

console.timeEnd('part 1');
console.time('part 2');

const treeSize = computeTreeSize(finalTree);
const freeStorage = 70_000_000 - treeSize;
const neededToFree = 30_000_000 - freeStorage;

const listBigDirectories = (fileTree) => {
	if (typeof fileTree === 'number') {
		return [];
	} else {
		const subTreeSize = computeTreeSize(fileTree);
		return [
			...(subTreeSize > neededToFree ? [subTreeSize] : []),
			...Object.values(fileTree).reduce((acc, value) => [...acc, ...listBigDirectories(value)], []),
		];
	}
};

const bigDirectoriesList = listBigDirectories(finalTree);
const littlestBigDirectory = Math.min(...bigDirectoriesList);

console.log(`We need to delete a file with ${littlestBigDirectory.toString().red} size.`);

console.timeEnd('part 2');
console.timeEnd('main');
