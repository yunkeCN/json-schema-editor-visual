/* eslint-disable react/no-multi-comp */
import React, { Component, PureComponent, Fragment } from 'react';
import {
  Dropdown,
  Menu,
  Input,
  Row,
  Col,
  Select,
  Checkbox,
  Icon,
  message,
  Tooltip,
} from 'antd';
import './schemaJson.css';
import _ from 'underscore';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE } from '../../utils';
import LocaleProvider from '../LocalProvider/index';

const { Option, OptGroup } = Select;

const mapping = (name, data, showEdit, showAdv, refSchemas, refFunc) => {
  switch (data.type) {
    case 'array':
      return <SchemaArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} refSchemas={refSchemas} refFunc={refFunc} />;
      break;
    case 'object':
      const nameArray = [].concat(name, 'properties');
      return <SchemaObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} refSchemas={refSchemas} refFunc={refFunc} />;
      break;
    default:
      return null;
  }
};

class SchemaArray extends PureComponent {
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

  // 修改数据类型
  handleChangeTypeOrRef = (value) => {
    const isRef = /^ref:/.test(value);

    if (isRef) {
      // eslint-disable-next-line no-param-reassign
      value = value.replace(/^ref:/, '');
    }

    const prefix = this.getPrefix();

    if (isRef) {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value: undefined });
      this.Model.changeValueAction({ key: [].concat(prefix, '$ref'), value });
    } else {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value });
    }
  };

  // 修改备注信息
  handleChangeValue = (e) => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, 'description');
    const { value } = e.target;
    this.Model.changeValueAction({ key, value });
  };

  // 增加子节点
  handleAddChildField = () => {
    const prefix = this.getPrefix();
    const keyArr = [].concat(prefix, 'properties');
    this.Model.addChildFieldAction({ key: keyArr });
    this.Model.setOpenValueAction({ key: keyArr, value: true });
  };

  handleClickIcon = () => {
    const prefix = this.getPrefix();
    // 数据存储在 properties.name.properties下
    const keyArr = [].concat(prefix, 'properties');
    this.Model.setOpenValueAction({ key: keyArr });
  };

  handleShowEdit = () => {
    const prefix = this.getPrefix();
    this.props.showEdit(prefix, 'description', this.props.data.items.description);
  };

  handleShowAdv = () => {
    this.props.showAdv(this.getPrefix(), this.props.data.items);
  };

  render() {
    const {
      data, prefix, showEdit, showAdv, refSchemas, refFunc
    } = this.props;
    const { items } = data;
    const prefixArray = [].concat(prefix, 'items');

    const prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    const showIcon = this.context.getOpenValue([prefixArrayStr]);
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
                  {items.type === 'object' ? (
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
                showSearch
                className="type-select-style"
                onChange={this.handleChangeTypeOrRef}
                value={items.type || `ref:${items.$ref}`}
                filterOption={(input, option) => (
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                )}
              >
                <OptGroup label="Basic">
                  {SCHEMA_TYPE.map(item => (
                    <Option value={item} key={item}>
                      {item}
                    </Option>
                  ))}
                </OptGroup>
                <OptGroup label="Ref">
                  {refSchemas.map(item => (
                    <Option value={`ref:${refFunc(item)}`} key={item}>
                      {item.name}
                    </Option>
                  ))}
                </OptGroup>
              </Select>
            </Col>
            {
              typeof items.$ref === 'undefined' &&
              <Col span={5} className="col-item col-item-desc">
                <Input
                  addonAfter={<Icon type="edit" onClick={this.handleShowEdit} />}
                  placeholder={LocaleProvider('description')}
                  value={items.description}
                  onChange={this.handleChangeValue}
                />
              </Col>
            }
            {
              typeof items.$ref !== 'undefined' &&
              <Col span={5} className="col-item col-item-type" />
            }
            <Col span={3} className="col-item col-item-setting">
              <Tooltip
                placement="top"
                title={LocaleProvider('adv_setting')}
              >
                <Icon onClick={this.handleShowAdv} className="adv-set" type="setting" />
              </Tooltip>
              {
                items.type === 'object' &&
                <Tooltip
                  placement="top"
                  title={LocaleProvider('add_child_node')}
                >
                  <Icon onClick={this.handleAddChildField} type="plus" className="plus" />
                </Tooltip>
              }
            </Col>
          </Row>
          <div className="option-formStyle">{mapping(prefixArray, items, showEdit, showAdv, refSchemas, refFunc)}</div>
        </div>
      )
    );
  }
}

SchemaArray.contextTypes = {
  getOpenValue: PropTypes.func,
  Model: PropTypes.object,
};

class SchemaItem extends PureComponent {
  constructor(props, context) {
    super(props);
    this._tagPaddingLeftStyle = {};
    // this.num = 0
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

  // 修改节点字段名
  handleChangeName = (e) => {
    const { data, prefix, name } = this.props;
    const value = e.target.value;

    if (data.properties[value] && typeof data.properties[value] === 'object') {
      return message.error(`The field "${value}" already exists.`);
    }

    this.Model.changeNameAction({ value, prefix, name });
  };

  // 修改备注信息
  handleChangeDesc = (e) => {
    const prefix = this.getPrefix();
    const key = [].concat(prefix, 'description');
    const { value } = e.target;
    this.Model.changeValueAction({ key, value });
  };

  // 修改数据类型
  handleChangeTypeOrRef = (value) => {
    const isRef = /^ref:/.test(value);

    if (isRef) {
      // eslint-disable-next-line no-param-reassign
      value = value.replace(/^ref:/, '');
    }

    const prefix = this.getPrefix();

    if (isRef) {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value: undefined });
      this.Model.changeValueAction({ key: [].concat(prefix, '$ref'), value });
    } else {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value });
    }
  };

  // 删除节点
  handleDeleteItem = () => {
    const { prefix, name } = this.props;
    const nameArray = this.getPrefix();
    this.Model.deleteItemAction({ key: nameArray });
    this.Model.enableRequireAction({ prefix, name, required: false });
  };

  // 展示备注编辑弹窗
  handleShowEdit = () => {
    const { data, name, showEdit } = this.props;
    showEdit(this.getPrefix(), 'description', data.properties[name].description);
  };

  // 展示高级设置弹窗
  handleShowAdv = () => {
    const { data, name, showAdv } = this.props;
    showAdv(this.getPrefix(), data.properties[name]);
  };

  //  增加子节点
  handleAddField = () => {
    const { prefix, name } = this.props;
    this.Model.addFieldAction({ prefix, name });
  };

  // 控制三角形按钮
  handleClickIcon = () => {
    const prefix = this.getPrefix();
    // 数据存储在 properties.xxx.properties 下
    const keyArr = [].concat(prefix, 'properties');
    this.Model.setOpenValueAction({ key: keyArr });
  };

  // 修改是否必须
  handleEnableRequire = (e) => {
    const { prefix, name } = this.props;
    const required = e.target.checked;
    // this.enableRequire(this.props.prefix, this.props.name, e.target.checked);
    this.Model.enableRequireAction({ prefix, name, required });
  };

  render() {
    const {
      name, data, prefix, showEdit, showAdv, refSchemas, refFunc
    } = this.props;
    const value = data.properties[name];
    const prefixArray = [].concat(prefix, name);
    const prefixStr = prefix.join(JSONPATH_JOIN_CHAR);
    const prefixArrayStr = [].concat(prefixArray, 'properties').join(JSONPATH_JOIN_CHAR);
    const show = this.context.getOpenValue([prefixStr]);
    const showIcon = this.context.getOpenValue([prefixArrayStr]);
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
                {value.type === 'object' ? (
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
                    <Checkbox
                      onChange={this.handleEnableRequire}
                      checked={
                        _.isUndefined(data.required) ? false : data.required.indexOf(name) != -1
                      }
                    />
                  }
                  onChange={this.handleChangeName}
                  value={name}
                />
              </Col>
            </Row>
          </Col>
          <Col span={4} className="col-item col-item-type">
            <Select
              showSearch
              className="type-select-style"
              onChange={this.handleChangeTypeOrRef}
              value={value.type || `ref:${value.$ref}`}
              filterOption={(input, option) => (
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              )}
            >
              <OptGroup label="Basic">
                {SCHEMA_TYPE.map(item => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label="Ref">
                {refSchemas.map(item => (
                  <Option value={`ref:${refFunc(item)}`} key={item}>
                    {item.name}
                  </Option>
                ))}
              </OptGroup>
            </Select>
          </Col>
          {
            typeof value.$ref === 'undefined' &&
            <Col span={5} className="col-item col-item-desc">
              <Input
                addonAfter={<Icon type="edit" onClick={this.handleShowEdit} />}
                placeholder={LocaleProvider('description')}
                value={value.description}
                onChange={this.handleChangeDesc}
              />
            </Col>
          }
          {
            typeof value.$ref !== 'undefined' &&
            <Col span={5} className="col-item col-item-type"/>
          }
          <Col span={3} className="col-item col-item-setting">
            <Icon type="close" className="close delete-item" onClick={this.handleDeleteItem} />
            <Tooltip
              placement="top"
              title={LocaleProvider('adv_setting')}
            >
              <Icon onClick={this.handleShowAdv} className="adv-set" type="setting" />
            </Tooltip>
            {value.type === 'object' ?
              <DropPlus prefix={prefix} name={name} />
              :
              <Tooltip
                placement="top"
                title={LocaleProvider('add_sibling_node')}
              >
                <Icon onClick={this.handleAddField} type="plus" className="plus" />
              </Tooltip>
            }
          </Col>
        </Row>
        <div className="option-formStyle">{mapping(prefixArray, value, showEdit, showAdv, refSchemas, refFunc)}</div>
      </div>
    ) : null;
  }
}

SchemaItem.contextTypes = {
  getOpenValue: PropTypes.func,
  Model: PropTypes.object,
};

class SchemaObjectComponent extends Component {
  shouldComponentUpdate(nextProps) {
    if (
      _.isEqual(nextProps.data, this.props.data) &&
      _.isEqual(nextProps.prefix, this.props.prefix) &&
      _.isEqual(nextProps.open, this.props.open)
    ) {
      return false;
    }
    return true;
  }

  render() {
    const {
      data, prefix, showEdit, showAdv, refSchemas, refFunc
    } = this.props;
    return (
      <div className="object-style1">
        {Object.keys(data.properties).map((name, index) => (
          <SchemaItem
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

const SchemaObject = connect(state => ({
  open: state.schema.open,
}))(SchemaObjectComponent);

const DropPlus = (props, context) => {
  const { prefix, name, add } = props;
  const Model = context.Model.schema;
  const menu = (
    <Menu>
      <Menu.Item>
        <span onClick={() => Model.addFieldAction({ prefix, name })}>
          {LocaleProvider('sibling_node')}
        </span>
      </Menu.Item>
      <Menu.Item>
        <span onClick={() => {
          Model.setOpenValueAction({ key: [].concat(prefix, name, 'properties'), value: true });
          Model.addChildFieldAction({ key: [].concat(prefix, name, 'properties') });
        }
        }
        >
          {LocaleProvider('child_node')}
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip placement="top" title={LocaleProvider('add_node')}>
      <Dropdown overlay={menu}>
        <Icon type="plus" className="plus" />
      </Dropdown>
    </Tooltip>
  );
};

DropPlus.contextTypes = {
  Model: PropTypes.object,
};

const SchemaJson = (props) => {
  const item = mapping([], props.data, props.showEdit, props.showAdv, props.refSchemas, props.refFunc);
  return <div className="schema-content">{item}</div>;
};

export default SchemaJson;
