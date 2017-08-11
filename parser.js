/**
 * Created by fed on 2017/8/11.
 */

const nmstart = '[_a-z]';
const nmchar = '[_a-z0-9-]';
const identifier = `-?${nmstart}${nmchar}*`;
const namespace_prefix = `(${identifier}|*)`;
const element_name =  identifier;
const type_selector = `${namespace_prefix}?${element_name}`;
const class_name = `.${identifier}`;
const hash = `#${nmchar}+`;
const string = `('([^']|\\')*'|"([^']|\\")*")`
const attrib = `\\[[^=]+(=(${string}|${identifier})?)?\\]`;
const pseudo = `::?`;
const negation = ``;
const universal = '*';

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
  }
  getAnyType(substr) {
    if (substr[0] === universal) {
      this.idx++;
      return {
        type: 'universal',
        val: '*',
      };
    }
    var res = substr.match(new RegExp(type_selector));
    if (res) {
      this.idx += res[0].length;
      return {
        type: 'type',
        val: res[0],
      }
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      var res = substr.match(new RegExp(simpleSel[key]));
      if (res) {
        this.idx += res[0].length;
        return {
          type: key,
          val: res[0],
        }
      }
    }
  }
  nextSelector() {
    if (this.err) throw this.err;
    if (/\S/.test(this.source[this.idx])) {
      this.state = stateList.Start;
      return this.nextSelector();
    }
    const substr = this.source.slice(this.idx);
    if (this.state === stateList.Start) {
      this.state = stateList.noNameSpace;
      if (substr[0] === universal) {
        this.idx++;
        return {
          type: 'universal',
          val: '*',
        };
      }
      var res = substr.match(new RegExp(type_selector));
      if (res) {
        this.idx += res[0].length;
        return {
          type: 'type',
          val: res[0],
        }
      }
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      var res = substr.match(new RegExp(simpleSel[key]));
      if (res) {
        this.idx += res[0].length;
        return {
          type: key,
          val: res[0],
        }
      }
    }
    var res = substr.match(new RegExp(negation));
    if (res) {
      this.idx += res[0].length;
      const substr1 = res[0].slice(':not('.length, -1).trim();
      return {
        type: 'neg',
        val: this.getAnyType(substr1),
      }
    }
    this.err = new Error('No selector matched at ' + substr);
    throw this.err;
  }
}