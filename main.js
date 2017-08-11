/**
 * Created by fed on 2017/8/11.
 */
const postcss = require('postcss');
const content = require('fs').readFileSync('./test.css', 'utf8');
const specificityTable = {
  important: -99999,
  attr: 10,
  ele: 1,
  zero: 0,
};

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
  console.log(obj, propObj);
});
function getUnits(sel) {

}

function getSpecificity(sel) {
  const units = getUnits(sel);
  return units.reduce((acc, type) => acc + specificityTable[type], 0);
}