export function linebreak(s) {
	const twoLine = /\n\n/g;
	const oneLine = /\n/g;
	return s.replace(twoLine, '<p></p>').replace(oneLine, '<br>');
}

export function capitalize(s) {
	const firstChar = /\S/;
	return s.replace(firstChar, m => m.toUpperCase());
}

export function removePunctuaction(str) {
	return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
}

export function countWords(string) {
	let s = string.replace(/\n/g, ' '); // newlines to space
	s = s.replace(/(^\s*)|(\s*$)/gi, ''); // remove spaces from start + end
	s = s.replace(/[ ]{2,}/gi, ' '); // 2 or more spaces to 1
	return s.split(' ').length;
}
