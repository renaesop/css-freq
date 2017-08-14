import test from 'ava';
import Parser from './parser';

const selectors = [
	'.a.b:not(.c)',
	'p#a:nth-child(3):not(div)',
	'div',
	'*:not([a=")"])',
	'div + .antd *',
	'* +*',
	':not([a=")]"]):not(.a):not(#a):not([class~="])"])'
]

test(t => {
	selectors.forEach(selector => {
		console.log('selector: ', selector);
		const p = new Parser(selector);
		let sel;
		while(sel = p.nextSelector()) {
			console.log(sel)
		}
		console.log('============')
	})
	t.pass();	
});