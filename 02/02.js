import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const Move = {
	ROCK: 0,
	PAPER: 1,
	SCISSORS: 2
};

const letterToMove = (letter) => {
	switch (letter.trim()) {
		case 'A':
		case 'X':
			return Move.ROCK;
		case 'B':
		case 'Y':
			return Move.PAPER;
		case 'C':
		case 'Z':
			return Move.SCISSORS;
		default:
			throw new Error(`Unknown move ${letter}`);
	}
};

const getMoveScore = (move) => move + 1;

const moves = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8'
	})
	.trim()
	.split('\n')
	.map((line) => line.trim().split(' ').filter((line) => line));

const getRoundScore = (left, right) => {
	if (left === right) {
		return 3;
	} else if ((left + 1) % 3 === right) {
		return 6;
	} else {
		return 0;
	}
};

const roundsToScore = (rounds) => rounds.reduce((acc, [left, right]) => acc + getMoveScore(right) + getRoundScore(left, right), 0);

console.timeEnd('init');
console.time('part 1');


const p1Result = roundsToScore(moves.map((line) => line.map(letterToMove)));
console.log(`The result of the tournament with suggested moves is ${p1Result.toString().yellow}`);

console.timeEnd('part 1');
console.time('part 2');

const Result = {
	LOSE: 0,
	DRAW: 1,
	WIN: 2
};

const letterToResult = (letter) => {
	switch (letter) {
		case 'X':
			return Result.LOSE;
		case 'Y':
			return Result.DRAW;
		case 'Z':
			return Result.WIN;
		default:
			throw new Error(`Unknown letter for result ${letter}`)
	}
}

const getNecessaryMoveForResult = (left, result) => {
	switch (result) {
		case Result.DRAW:
			return left;
		case Result.LOSE:
			return left === 0 ? 2 : left - 1
		case Result.WIN:
			return (left + 1) % 3;
		default:
			throw new Error(`Unknown expected result ${result}`);
	}
};

const p2Result = roundsToScore(moves.map(([left, right]) => [letterToMove(left), letterToResult(right)]).map(([left, right]) => [left, getNecessaryMoveForResult(left, right)]));

console.log(`The true result of the tournament is ${p2Result.toString().green}`);

console.timeEnd('part 2');
console.timeEnd('main');
