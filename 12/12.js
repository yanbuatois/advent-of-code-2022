import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const map = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim()
	.split('\n')
	.map((line) =>
		[...line.trim()].map((char) => ({
			height: char >= 'a' ? char.charCodeAt(0) - 'a'.charCodeAt(0) : char === 'S' ? 0 : 26,
			start: char === 'S',
			end: char === 'E',
		}))
	);

const mapGraph = map
	.map((line, i, map) =>
		line.map((point, j, line) => ({
			...point,
			compatibleNeighbours: [
				...(map[i - 1]?.[j]?.height <= point.height + 1 ? [(i - 1) * line.length + j] : []),
				...(line[j - 1]?.height <= point.height + 1 ? [i * line.length + j - 1] : []),
				...(map[i + 1]?.[j]?.height <= point.height + 1 ? [(i + 1) * line.length + j] : []),
				...(line[j + 1]?.height <= point.height + 1 ? [i * line.length + j + 1] : []),
			],
			predecessor: null,
		}))
	)
	.flat();

const findShortestPath = (graph, p = []) => {
	if (p.length === graph.length) {
		return graph;
	}
	const nearestNode = graph
		.filter((elt, i) => !p.includes(i))
		.sort((a, b) => a.currentDistance - b.currentDistance)[0];
	const nearestNodeIndex = graph.indexOf(nearestNode);
	const newP = [...p, nearestNodeIndex];

	const newGraph = graph.map((node, index) => {
		const newPredecessor =
			nearestNode.compatibleNeighbours.includes(index) &&
			!p.includes(index) &&
			node.currentDistance > nearestNode.currentDistance + 1;

		return {
			...node,
			currentDistance: newPredecessor ? nearestNode.currentDistance + 1 : node.currentDistance,
			predecessor: newPredecessor ? nearestNodeIndex : node.predecessor,
		};
	});

	return findShortestPath(newGraph, newP);
};

console.timeEnd('init');
console.time('part 1');

const mapGraphForDijkstra = mapGraph.map((node) => ({
	...node,
	currentDistance: node.start ? 0 : Number.POSITIVE_INFINITY,
}));

const result = findShortestPath(mapGraphForDijkstra);
const endNode = result.find((node) => node.end);
const endNodeDistance = endNode.currentDistance;

console.log(`We need to walk on ${endNodeDistance.toString().yellow} cases before going to the end.`);

// const resultString = result.reduce(
// 	(acc, elt, index) =>
// 		`${acc}${
// 			(elt.start ? 'S' : elt.end ? 'E' : String.fromCharCode('a'.charCodeAt(0) + elt.height))[
// 				elt.currentDistance < Number.POSITIVE_INFINITY ? 'green' : 'red'
// 			]
// 		}${!((index + 1) % map[0].length) ? '\n' : ''}`,
// 	''
// );
// console.log(resultString);

console.timeEnd('part 1');
console.time('part 2');

const mapGraphForDijkstra2 = mapGraph.map((node) => ({
	...node,
	currentDistance: node.height ? Number.POSITIVE_INFINITY : 0,
}));

const result2 = findShortestPath(mapGraphForDijkstra2);
const endNode2 = result2.find((node) => node.end);
const endNodeDistance2 = endNode2.currentDistance;

console.log(`We need to walk on ${endNodeDistance2.toString().green} cases if we go from any 0-height cell.`);

console.timeEnd('part 2');
console.timeEnd('main');
