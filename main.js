/**
 * Created by fed on 2017/8/11.
 */
const postcss = require('postcss');
const content = require('fs').readFileSync('./test.css', 'utf8');

const Parser = require('./parser');

const specificityTable = {
  'pseudo-ele': 1,
  'pseudo-class': 10,
  class_name: 10,
  hash: 100,
  attrib: 10,
  ele: 1,
  universal: 0,
  type: 1,
};
const specialPseudoEle = [
  ':before',
  ':after',
  ':first-line',
  ':first-letter',
];

const processor = postcss();
const selSet = new Set();
const propObj = {};
processor.process(content).then(res => {
  res.root.walk(node => {
    if (node.type === 'rule') {
      const sels = node.selector.split(',').map(x => x.trim()).forEach(x => selSet.add(x));
    }
    if (node.type === 'decl') {
      propObj[node.prop] = (propObj[node.prop] || 0) + 1;
    }
  });
  const  obj = {};
  for (let x of selSet) {
    obj[x] = getSpecificity(x);
  }
  const keys = Object.keys(obj);
  const result = keys.map(key => ({
    key,
    val: obj[key]
  })).sort((a, b) => a.val - b.val).reverse()
  console.log(result);
});
function getUnits(sel) {
   const parser = new Parser(sel);
   const result = [];
   let res;
   while(res = parser.nextSelector()) {
    result.push(res);
   }
   // console.log(sel, result)
   return result
    .filter(item => item.type !== 'combinator')
    .map(item => {
        if (item.type === 'neg') {
          return item.val.type;
        }
        if (item.type === 'pseudo') {
          if (item.val.indexOf('::') === 0 || specialPseudoEle.indexOf(item.val) > -1 ) {
            return 'pseudo-ele'
          }
          return 'pseudo-class'
        }
        return item.type;
    });
}

function getSpecificity(sel) {
  const units = getUnits(sel);
  // console.log(units)
  return units.reduce((acc, type) => acc + specificityTable[type], 0);
}