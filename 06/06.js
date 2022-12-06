import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import 'colors';

console.time('main');
console.time('init');

const signal = fs
	.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'input'), {
		encoding: 'utf-8',
	})
	.trim();

const getStartOfPacketMarkerIndex = (signal, wordLength, buffer = [], index = 0) => {
	if (buffer.length === wordLength) {
		return index;
	}

	const [letter, ...newSignal] = signal;
	const oldLetterIndex = buffer.indexOf(letter);
	const newBuffer = [...(oldLetterIndex === -1 ? buffer : buffer.slice(oldLetterIndex + 1)), letter];

	return getStartOfPacketMarkerIndex(newSignal, wordLength, newBuffer, index + 1);
};

console.timeEnd('init');
console.time('part 1');

const subroutine1Result = getStartOfPacketMarkerIndex(signal, 4);

console.log(`The result of the first subroutine is ${subroutine1Result.toString().yellow}`);

console.timeEnd('part 1');
console.time('part 2');

const subroutine2Result = getStartOfPacketMarkerIndex(signal, 14);

console.log(`The result of the second subroutine is ${subroutine2Result.toString().green}`);

console.timeEnd('part 2');
console.timeEnd('main');
