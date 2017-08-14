/**
 * Created by fed on 2017/8/11.
 */
const postcss = require('postcss');

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

function getUnits(sel) {
  const parser = new Parser(sel);
  const result = [];
  let res;
  while(res = parser.nextSelector()) {
    result.push(res);
  }
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
  return units.reduce((acc, type) => acc + specificityTable[type], 0);
}

module.exports = function (content) {
  const propObj = {};
  const selSet = new Set();
  return processor.process(content).then(res => {
    res.root.walk(node => {
      if (node.type === 'rule') {
        node.selectors.filter(x => x.indexOf('%') === -1).map(x => x.trim()).forEach(x => selSet.add(x));
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
    })).sort((a, b) => a.val - b.val).reverse();
    const result1 = Object.keys(propObj).map(key => ({
      key,
      val: propObj[key],
    })).sort((a, b) => a.val - b.val).reverse()
    return {
      mostFreq: result1.filter(x => x.val === result1[0].val),
      mostWeight: result.filter(x => x.val === result[0].val),
    }
  });
};
