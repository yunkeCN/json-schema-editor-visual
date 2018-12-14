const JSONPATH_JOIN_CHAR = '.';
exports.JSONPATH_JOIN_CHAR = JSONPATH_JOIN_CHAR;
exports.lang = 'en_US';
exports.format = [
  { name: 'date-time' },
  { name: 'date' },
  { name: 'email' },
  { name: 'hostname' },
  { name: 'ipv4' },
  { name: 'ipv6' },
  { name: 'uri' },
];
const _ = require('underscore');
const SCHEMA_TYPE = ['string', 'number', 'array', 'object', 'boolean', 'integer'];
const Combination_Criteria = ['allOf', 'anyOf', 'oneOf', 'not'];

exports.SCHEMA_TYPE = SCHEMA_TYPE;
exports.Combination_Criteria = Combination_Criteria;
exports.defaultSchema = {
  string: {
    type: 'string',
  },
  number: {
    type: 'number',
  },
  array: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
  object: {
    type: 'object',
    properties: {},
  },
  boolean: {
    type: 'boolean',
  },
  integer: {
    type: 'integer',
  },
  allOf: {
    allOf: [],
  },
  anyOf: {
    anyOf: [],
  },
  oneOf: {
    oneOf: [],
  },
  not: {
    not: [],
  },
};

// 防抖函数，减少高频触发的函数执行的频率
// 请在 constructor 里使用:

// this.func = debounce(this.func, 400);
exports.debounce = (func, wait) => {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
};

function getData(state, keys) {
  let curState = state;
  for (let i = 0; i < keys.length; i++) {
    curState = curState[keys[i]];
  }
  return curState;
}

exports.getData = getData;

exports.setData = function (state, keys, value) {
  let curState = state;
  for (let i = 0; i < keys.length - 1; i++) {
    curState = curState[keys[i]];
  }

  if (SCHEMA_TYPE.indexOf(value.type) === -1) {
    curState[keys[keys.length - 1]] = value;
  } else {
    const { description } = curState[keys[keys.length - 1]] || {};

    curState[keys[keys.length - 1]] = Object.assign({ description }, value);
  }
};

exports.getParentKeys = function (keys) {
  if (keys.length === 1) return [];
  const arr = [].concat(keys);
  arr.splice(keys.length - 1, 1);
  return arr;
};

exports.clearSomeFields = function (keys, data) {
  const newData = Object.assign({}, data);
  keys.forEach((key) => {
    delete newData[key];
  });
  return newData;
};

function getFieldstitle(data) {
  const requiredtitle = [];
  Object.keys(data).map((title) => {
    requiredtitle.push(title);
  });

  return requiredtitle;
}

function handleSchemaRequired(schema, checked) {
  // console.log(schema)
  if (schema.type === 'object') {
    const requiredtitle = getFieldstitle(schema.properties);

    schema.required = checked ? [].concat(requiredtitle) : [];

    // schema.required =
    // schema = Object.assign({},schema, {required})
    handleObject(schema.properties, checked);
  } else if (schema.type === 'array') {
    handleSchemaRequired(schema.items, checked);
  } else {
    return schema;
  }
}

function handleObject(properties, checked) {
  for (const key in properties) {
    if (properties[key].type === 'array' || properties[key].type === 'object') { handleSchemaRequired(properties[key], checked); }
  }
}

exports.handleSchemaRequired = handleSchemaRequired;

function cloneObject(obj) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      const newArr = [];
      obj.forEach((item, index) => {
        newArr[index] = cloneObject(item);
      });
      return newArr;
    }
    const newObj = {};
    for (const key in obj) {
      newObj[key] = cloneObject(obj[key]);
    }
    return newObj;
  }
  return obj;
}

exports.cloneObject = cloneObject;

function isCombinationCriteria(schema) {
  let isCC = false;
  for (let i = 0, len = Combination_Criteria.length; i < len; i++) {
    if (Array.isArray(schema[Combination_Criteria[i]])) {
      isCC = Combination_Criteria[i];
      break;
    }
  }
  return isCC;
}

exports.isCombinationCriteria = isCombinationCriteria;
