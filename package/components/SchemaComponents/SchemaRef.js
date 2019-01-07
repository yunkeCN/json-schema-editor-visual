/* eslint-disable react/no-multi-comp */
import React, { Component, PureComponent, Fragment } from 'react';
import {
  Input,
  Row,
  Col,
  Select,
  Checkbox,
  Icon
} from 'antd';
import './schemaJson.css';
import _ from 'underscore';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE, Combination_Criteria, isCombinationCriteria } from '../../utils';
import LocaleProvider from '../LocalProvider/index';

const refMapping = (name, data, showEdit, showAdv, refSchemas, refFunc) => {
  switch (data.type) {
    case 'array':
      return <SchemaRefArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} refSchemas={refSchemas} refFunc={refFunc} />;
    case 'object':
      const nameArray = [].concat(name, 'properties');
      return <SchemaRefObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} refSchemas={refSchemas} refFunc={refFunc} />;
    default:
      let component = null;
      for (let i = 0, len = Combination_Criteria.length; i < len; i++) {
        if (Array.isArray(data[Combination_Criteria[i]])) {
          const nameArray = [].concat(name, Combination_Criteria[i]);
          component = <SchemaRefMixed prefix={nameArray} data={data[Combination_Criteria[i]]} showEdit={showEdit} showAdv={showAdv} refSchemas={refSchemas} refFunc={refFunc} />;
          break;
        }
      }
      return component;
  }
};

const handleSelectTypeValue = (schema) => {
  let value = '';
  if (schema.type !== undefined) {
    return schema.type;
  }
  if (schema.$ref !== undefined) {
    return `ref:${schema.$ref}`;
  }
  if (value = isCombinationCriteria(schema)) {
    return value;
  }
  return value;
}

const showDownStyleOrAddChildNode = (schema) => {
  let show = false;
  if (schema.type === 'object') {
    return true;
  }
  if (schema.$ref !== undefined) {
    return true;
  }
  if (show = isCombinationCriteria(schema)) {
    return !!show;
  }
  return show;
}

class SchemaRefArray extends PureComponent {
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
    this.Model = context.Model.schema;
  }

  componentWillMount() {
    const { prefix } = this.props;
    const length = prefix.filter(name => name != 'properties').length;
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`,
    };
  }

  getPrefix() {
    return [].concat(this.props.prefix, 'items');
  }

  handleClickIcon = () => {
    const { data } = this.props;
    const prefix = this.getPrefix();
    let keyArr = [].concat(prefix, 'properties');
    let isCC = null;
    if (isCC = isCombinationCriteria(data.items)) {
      keyArr = [].concat(prefix, isCC);
    }
    this.Model.setOpenValueAction({ key: keyArr });
  };

  render() {
    const {
      data, prefix, showEdit, showAdv, refSchemas, refFunc,
    } = this.props;
    const { items } = data;
    const itemTypeValue = handleSelectTypeValue(items);
    const isShowDownStyleOrAdd = showDownStyleOrAddChildNode(items);
    const prefixArray = [].concat(prefix, 'items');

    let prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    let isCC = null;
    if (isCC = isCombinationCriteria(items)) {
      prefixArrayStr = [].concat(prefixArray, isCC).join(JSONPATH_JOIN_CHAR);
    }
    const showIcon = this.context.getOpenValue([prefixArrayStr]);

    let subordinate = null;
    if (typeof items.$ref === 'string') {
      let ref = items.$ref.split('/');
      ref = ref[ref.length -1];
      if (ref !== undefined) {
        let refData = null;
        for (let i = 0, len = refSchemas.length; i < len; i++) {
          if (ref === refSchemas[i]._id + '') {
            refData = refSchemas[i].body;
            break;
          }
        }
        let refData2 = {};
        refData2.type = 'object';
        refData2.properties = {};
        refData2.properties.root = refData;
        if (refData) {
          subordinate = refMapping(prefixArray, refData2, showEdit, showAdv, refSchemas, refFunc);
        }
      }
    } else {
      subordinate = refMapping(prefixArray, items, showEdit, showAdv, refSchemas, refFunc);
    }

    return (
      !_.isUndefined(data.items) && (
        <div className="array-type">
          <Row className="row array-item-type" type="flex" justify="space-around" align="middle">
            <Col
              span={12}
              className="col-item name-item col-item-name"
              style={this.__tagPaddingLeftStyle}
            >
              <Row type="flex" justify="space-around" align="middle">
                <Col span={2} className="down-style-col">
                  {isShowDownStyleOrAdd ? (
                    <span className="down-style" onClick={this.handleClickIcon}>
                      {showIcon ? (
                        <Icon className="icon-object" type="caret-down" />
                      ) : (
                        <Icon className="icon-object" type="caret-right" />
                        )}
                    </span>
                  ) : null}
                </Col>
                <Col span={22}>
                  <Input addonAfter={<Checkbox disabled />} disabled value="Items" />
                </Col>
              </Row>
            </Col>
            <Col span={4} className="col-item col-item-type">
              <Select
                className="type-select-style"
                value={itemTypeValue}
                disabled
              >
              </Select>
            </Col>
            {
              typeof items.$ref === 'undefined' &&
              <Col span={5} className="col-item col-item-desc">
                <Input
                  addonAfter={<Icon type="edit" />}
                  placeholder={LocaleProvider('description')}
                  value={items.description}
                  disabled
                />
              </Col>
            }
            {
              typeof items.$ref !== 'undefined' &&
              <Col span={5} className="col-item col-item-type">
                <Input
                  type="button"
                  value="跳转至组件"
                  addonAfter={<Icon type="right" />}
                  onClick={() => this.context.redirectToComponentDetails(items.$ref)}
                />
              </Col>
            }
            <Col span={3} className="col-item col-item-setting"></Col>
          </Row>
          <div className="option-formStyle">{subordinate}</div>
        </div>
      )
    );
  }
}

SchemaRefArray.contextTypes = {
  getOpenValue: PropTypes.func,
  Model: PropTypes.object,
  redirectToComponentDetails: PropTypes.func,
};

class SchemaRefItem extends PureComponent {
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
    this.Model = context.Model.schema;
  }

  componentWillMount() {
    const { prefix } = this.props;
    const length = prefix.filter(name => name != 'properties').length;
    this.__tagPaddingLeftStyle = {
      paddingLeft: `${20 * (length + 1)}px`,
    };
  }

  getPrefix() {
    return [].concat(this.props.prefix, this.props.name);
  }

  // 控制三角形按钮
  handleClickIcon = () => {
    const { prefix, data, name } = this.props;
    const prefixArray = [].concat(prefix, name);
    let isCC = Combination_Criteria.indexOf(prefix[prefix.length -1]) !== -1;
    const value = isCC ? data : data.properties[name];

    if (isCC = isCombinationCriteria(value)) {
      const keyArr = [].concat(prefixArray, isCC);
      this.Model.setOpenValueAction({ key: keyArr });
    } else {
      const keyArr = [].concat(prefixArray, 'properties');
      this.Model.setOpenValueAction({ key: keyArr });
    }
  };

  render() {
    const {
      name, data, prefix, showEdit, showAdv, refSchemas, refFunc,
    } = this.props;
    
    const prefixArray = [].concat(prefix, name);
    const prefixStr = prefix.join(JSONPATH_JOIN_CHAR);
    let prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    const show = this.context.getOpenValue([prefixStr]);
    let showIcon = this.context.getOpenValue([prefixArrayStr]);
    const disabled = Combination_Criteria.indexOf(prefix[prefix.length -1]) !== -1;
    const value = disabled ? data : data.properties[name];
    let isCC = null;
    if (isCC = isCombinationCriteria(value)) {
      prefixArrayStr = [].concat(prefixArray, isCC).join(JSONPATH_JOIN_CHAR);
      showIcon = this.context.getOpenValue([prefixArrayStr]);
    }
    const typeValue = handleSelectTypeValue(value);
    const isShowDownStyleOrAdd = showDownStyleOrAddChildNode(value);

    let subordinate = null;
    if (typeof value.$ref === 'string') {
      let ref = value.$ref.split('/');
      ref = ref[ref.length -1];
      if (ref !== undefined) {
        let refData = null;
        for (let i = 0, len = refSchemas.length; i < len; i++) {
          if (ref === refSchemas[i]._id + '') {
            refData = refSchemas[i].body;
            break;
          }
        }
        let refData2 = {};
        refData2.type = 'object';
        refData2.properties = {};
        refData2.properties.root = refData;
        if (refData) {
          subordinate = refMapping(prefixArray, refData2, showEdit, showAdv, refSchemas, refFunc);
        }
      }
    } else {
      subordinate = refMapping(prefixArray, value, showEdit, showAdv, refSchemas, refFunc);
    }

    return show ? (
      <div>
        <Row className="row" type="flex" justify="space-around" align="middle">
          <Col
            span={12}
            className="col-item name-item col-item-name value"
            style={this.__tagPaddingLeftStyle}
          >
            <Row type="flex" justify="space-around" align="middle">
              <Col span={2} className="down-style-col">
                {isShowDownStyleOrAdd ? (
                  <span className="down-style" onClick={this.handleClickIcon}>
                    {showIcon ? (
                      <Icon className="icon-object" type="caret-down" />
                    ) : (
                      <Icon className="icon-object" type="caret-right" />
                      )}
                  </span>
                ) : null}
              </Col>
              <Col span={22}>
                <Input
                  addonAfter={
                    <Checkbox disabled checked={_.isUndefined(data.required) ? false : data.required.indexOf(name) != -1} />
                  }
                  value={name}
                  disabled
                />
              </Col>
            </Row>
          </Col>
          <Col span={4} className="col-item col-item-type">
            <Select
              className="type-select-style"
              value={typeValue}
              disabled
            >
            </Select>
          </Col>
          {
            typeof value.$ref === 'undefined' &&
            <Col span={5} className="col-item col-item-desc">
              <Input
                addonAfter={<Icon type="edit" />}
                placeholder={LocaleProvider('description')}
                value={value.description}
                disabled
              />
            </Col>
          }
          {
            typeof value.$ref !== 'undefined' &&
            <Col span={5} className="col-item col-item-type">
              <Input
                type="button"
                value="跳转至组件"
                addonAfter={<Icon type="right" />}
                onClick={() => this.context.redirectToComponentDetails(value.$ref)}
              />
            </Col>
          }
          <Col span={3} className="col-item col-item-setting"></Col>
        </Row>
        <div className="option-formStyle">{subordinate}</div>
      </div>
    ) : null;
  }
}

SchemaRefItem.contextTypes = {
  getOpenValue: PropTypes.func,
  Model: PropTypes.object,
  redirectToComponentDetails: PropTypes.func,
};

class SchemaRefObjectComponent extends Component {
  shouldComponentUpdate(nextProps) {
    if (
      _.isEqual(nextProps.data, this.props.data) &&
      _.isEqual(nextProps.prefix, this.props.prefix) &&
      _.isEqual(nextProps.open, this.props.open) &&
      nextProps.refSchemas.length === this.props.refSchemas.length
    ) {
      return false;
    }
    return true;
  }

  render() {
    const {
      data, prefix, showEdit, showAdv, refSchemas, refFunc,
    } = this.props;
    return (
      <div className="object-style1">
        {Object.keys(data.properties).map((name, index) => (
          <SchemaRefItem
            key={index}
            data={data}
            refSchemas={refSchemas}
            refFunc={refFunc}
            name={name}
            prefix={prefix}
            showEdit={showEdit}
            showAdv={showAdv}
          />
        ))}
      </div>
    );
  }
}

const SchemaRefObject = connect(state => ({
  open: state.schema.open,
}))(SchemaRefObjectComponent);

class SchemaRefMixedComponent extends Component {
  shouldComponentUpdate(nextProps) {
    if (
      _.isEqual(nextProps.data, this.props.data) &&
      _.isEqual(nextProps.prefix, this.props.prefix) &&
      _.isEqual(nextProps.open, this.props.open) &&
      nextProps.refSchemas.length === this.props.refSchemas.length
    ) {
      return false;
    }
    return true;
  }

  render() {
    const {
      data, prefix, showEdit, showAdv, refSchemas, refFunc,
    } = this.props;
    return (
      <div className="ref-style1">
        {data.map((currentItem, index) => (
          <SchemaRefItem
            key={index}
            data={currentItem}
            refSchemas={refSchemas}
            refFunc={refFunc}
            name={index}
            prefix={prefix}
            showEdit={showEdit}
            showAdv={showAdv}
          />
        ))}
      </div>
    );
  }
}

const SchemaRefMixed = connect(state => ({
  open: state.schema.open,
}))(SchemaRefMixedComponent);

export default refMapping;
