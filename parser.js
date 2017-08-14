/**
 * Created by fed on 2017/8/11.
 */

const nmstart = '[_a-zA-Z]';
const nmchar = '[_a-zA-Z0-9-]';
const identifier = `-?${nmstart}${nmchar}*`;
const namespace_prefix = `(${identifier}|\\*)`;
const element_name =  identifier;
const type_selector = `${namespace_prefix}?${element_name}`;
const class_name = `\\.${identifier}`;
const hash = `#${nmchar}+`;
const functional_pseudo  = `${identifier}\\([^)]+\\)`;
const string = `('([^']|\\\\')*'|"(\\\\"|[^"])*")`;
const attrib = `\\[\\s*${namespace_prefix}?${identifier}\\s*([~!^$*]?=(${string}|${identifier})?)?\\]`;
const pseudo = `::?(${functional_pseudo}|${identifier})`;
const negation = ':not(';
const universal = '*';

const combinators = [
  /^\s*(\+)\s*/,
  /^\s*(~)\s*/,
  /^\s*(>)\s*/,
  /^\s*(\s)\s*/,
];

const simpleSel = {
  class_name,
  hash,
  attrib,
  pseudo,
};
const keys = Object.keys(simpleSel);

const stateList = {
  Start: 0,
  noNameSpace: 1,
};

class Selector {
  constructor(str) {
    this.source = str.trim();
    this.idx = 0;
    this.state = stateList.Start;
    this.inNot = false;
    this.acceptCombinator = false;
    this.afterCombinator = false;
  }
  throws() {
    console.log(this.source)
    this.err = new Error('No selector matched at ' + this.source.slice(this.idx));
    throw this.err;
  }
  nextSelector() {
    if (this.idx >= this.source.length) {
      if (this.afterCombinator) this.throws();
      return null;
    }
    if (this.err) throw this.err;
    const substr = this.source.slice(this.idx);
    if (!this.inNot && this.acceptCombinator) {
      for (let i = 0; i < combinators.length; i++) {
        const key = combinators[i];
        var res = substr.match(key);
        if (res) {
          this.acceptCombinator = false;
          this.afterCombinator = true;
          this.state = stateList.Start;
          this.idx += res[0].length;
          return {
            type: 'combinator',
            val: res[1],
          };
        }
      }
    }
    this.acceptCombinator = true;
    this.afterCombinator = false;
    if (this.state === stateList.Start) {
      this.state = stateList.noNameSpace;
      if (substr[0] === universal) {
        this.idx++;
        return {
          type: 'universal',
          val: '*',
        };
      }
      let res = substr.match(new RegExp('^' + type_selector));
      if (res) {
        this.idx += res[0].length;
        return {
          type: 'type',
          val: res[0],
        }
      }
    }
     if (!this.inNot && substr.indexOf(negation) === 0) {
        this.inNot = true;
        this.idx += negation.length;
        this.state = stateList.Start;
        const sel1 = this.nextSelector();
        this.inNot =false;
        this.state = stateList.noNameSpace;
        const substr1 = this.source.slice(this.idx).trim();
        if (substr1[0] === ')') {
          this.idx ++;
          return {
            type: 'neg',
            val: sel1,
          }
        }
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let res = substr.match(new RegExp('^' + simpleSel[key]));

      if (res) {
        this.idx += res[0].length;
        return {
          type: key,
          val: res[0],
        }
      }
    }
  
    this.throws();
  }
}

module.exports = Selector;
