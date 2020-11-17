import utils from '../utils';
import handleSchema from '../schema';

const _ = require('underscore');

let fieldNum = 1;

export default {
  state: {
    message: null,
    data: {
      title: '',
      type: 'object',
      properties: {},
      required: [],
    },
    open: {
      properties: true,
      allOf: true,
      anyOf: true,
      oneOf: true,
      not: true,
    },
  },

  changeEditorSchemaAction(state, action) {
    handleSchema(action.value);
    state.data = action.value;
  },

  changeNameAction(state, action, oldState) {
    const { prefix: keys, name, value } = action;
    const oldData = oldState.data;
    const parentKeys = utils.getParentKeys(keys);
    const parentData = utils.getData(oldData, parentKeys);
    let requiredData = [].concat(parentData.required || []);
    const propertiesData = utils.getData(oldData, keys);
    const newPropertiesData = {};

    const curData = propertiesData[name];
    const openKeys = [].concat(keys, value, 'properties').join(utils.JSONPATH_JOIN_CHAR);
    const oldOpenKeys = [].concat(keys, name, 'properties').join(utils.JSONPATH_JOIN_CHAR);
    if (curData.properties) {
      delete state.open[oldOpenKeys];
      state.open[openKeys] = true;
    }

    if (propertiesData[value] && typeof propertiesData[value] === 'object') {
      return;
    }

    requiredData = requiredData.map((item) => {
      if (item === name) return value;
      return item;
    });

    parentKeys.push('required');
    utils.setData(state.data, parentKeys, requiredData);

    for (const i in propertiesData) {
      if (i === name) {
        newPropertiesData[value] = propertiesData[i];
      } else newPropertiesData[i] = propertiesData[i];
    }

    utils.setData(state.data, keys, newPropertiesData);
  },

  changeValueAction(state, action, oldState) {
    const { key: keys } = action;
    const key = keys[keys.length - 1];

    if (key === '$ref' || utils.Combination_Criteria.indexOf(key) !== -1) {
      const parentKeys = utils.getParentKeys(keys);
      const oldData = oldState.data;
      const parentData = utils.getData(oldData, parentKeys);

      const newParentData = {};
      newParentData[key] = action.value;
      for (let field in parentData) {
        if (utils.Combination_Criteria.indexOf(field) === -1 && field !== '$ref') {
          newParentData[field] = parentData[field];
        }
      }

      const newKeys = [].concat('data', parentKeys);
      utils.setData(state, newKeys, newParentData);
    } else {
      utils.setData(state.data, keys, action.value);
    }
  },

  changeTypeAction(state, action, oldState) {
    const { key: keys, value } = action;

    const parentKeys = utils.getParentKeys(keys);
    const oldData = oldState.data;
    const parentData = utils.getData(oldData, parentKeys);
    if (
      parentData.type === value ||
      (typeof parentData.type === 'undefined' && typeof value === 'undefined')
    ) {
      return;
    }
    const newParentData = utils.defaultSchema[value] || {};
    const newKeys = [].concat('data', parentKeys);
    utils.setData(state, newKeys, newParentData);
  },

  enableRequireAction(state, action, oldState) {
    const { prefix: keys } = action;
    const parentKeys = utils.getParentKeys(keys);
    const oldData = oldState.data;
    const parentData = utils.getData(oldData, parentKeys);
    const requiredData = [].concat(parentData.required || []);
    const index = requiredData.indexOf(action.name);

    if (!action.required && index >= 0) {
      requiredData.splice(index, 1);
      parentKeys.push('required');
      utils.setData(state.data, parentKeys, requiredData);
    } else if (action.required && index === -1) {
      requiredData.push(action.name);
      parentKeys.push('required');
      utils.setData(state.data, parentKeys, requiredData);
    }
  },

  requireAllAction(state, action, oldState) {
    // let oldData = oldState.data;
    const data = utils.cloneObject(action.value);
    utils.handleSchemaRequired(data, action.required);

    state.data = data;
  },

  deleteItemAction(state, action, oldState) {
    const keys = action.key;

    const name = keys[keys.length - 1];
    const oldData = oldState.data;
    const parentKeys = utils.getParentKeys(keys);
    const parentData = utils.getData(oldData, parentKeys);

    if (Array.isArray(parentData)) {
      const newParentData = parentData.slice();
      newParentData.splice(name, 1);
      utils.setData(state.data, parentKeys, newParentData);
    } else {
      const newParentData = {};
      for (const i in parentData) {
        if (i !== name) {
          newParentData[i] = parentData[i];
        }
      }
      utils.setData(state.data, parentKeys, newParentData);
    }
  },

  addFieldAction(state, action, oldState) {
    const { prefix: keys, name } = action;
    const propertiesData = utils.getData(oldState.data, keys);
    const isArray = Array.isArray(propertiesData);
    if (isArray) {
      let newPropertiesData = [];
      if (!name) {
        newPropertiesData = [].concat(propertiesData);
        newPropertiesData.push(utils.defaultSchema.string);
      } else {
        newPropertiesData = [].concat(propertiesData);
        newPropertiesData.splice(name + 1, 0, utils.defaultSchema.string);
      }
      utils.setData(state.data, keys, newPropertiesData);
    } else {
      let newPropertiesData = {};
      if (!name) {
        newPropertiesData = Object.assign({}, propertiesData);
        newPropertiesData[`field_${fieldNum++}`] = utils.defaultSchema.string;
      } else {
        for (const i in propertiesData) {
          newPropertiesData[i] = propertiesData[i];
          if (i === name) {
            newPropertiesData[`field_${fieldNum++}`] = utils.defaultSchema.string;
          }
        }
      }
      utils.setData(state.data, keys, newPropertiesData);
    }
  },
  addChildFieldAction(state, action, oldState) {
    const { key: keys } = action;
    const propertiesData = utils.getData(oldState.data, keys);
    const isArray = Array.isArray(propertiesData);
    if (isArray) {
      let newPropertiesData = [];
      newPropertiesData = [].concat(propertiesData);
      newPropertiesData.push(utils.defaultSchema.string);
      utils.setData(state.data, keys, newPropertiesData);
    } else {
      let newPropertiesData = {};
      newPropertiesData = Object.assign({}, propertiesData);
      newPropertiesData[`field_${fieldNum++}`] = utils.defaultSchema.string;
      utils.setData(state.data, keys, newPropertiesData);
    }
  },

  setOpenValueAction(state, action, oldState) {
    const keys = action.key.join(utils.JSONPATH_JOIN_CHAR);

    let status;
    if (_.isUndefined(action.value)) {
      status = !utils.getData(oldState.open, [keys]);
    } else {
      status = action.value;
    }
    utils.setData(state.open, [keys], status);
  },

};
