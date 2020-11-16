import React, { Fragment } from 'react';
import {
  Input,
  Row,
  Tooltip,
  Col,
  Select,
  Checkbox,
  Button,
  Icon,
  Modal,
  message,
  Tabs,
  Radio,
} from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './index.css';
import AceEditor from './components/AceEditor/AceEditor';
import SchemaJson from './components/SchemaComponents/SchemaJson';
import { SCHEMA_TYPE, Combination_Criteria, isCombinationCriteria, debounce } from './utils';
import handleSchema from './schema';
import CustomItem from './components/SchemaComponents/SchemaOther';
import LocalProvider from './components/LocalProvider/index';

const { Option, OptGroup } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const GenerateSchema = require('generate-schema/src/schemas/json');
const utils = require('./utils');

class jsonSchema extends React.Component {
  constructor(props) {
    super(props);
    this.alterMsg = debounce(this.alterMsg, 500);
    this.state = {
      visible: false,
      show: true,
      editVisible: false,
      description: '',
      descriptionKey: null,
      advVisible: false,
      itemKey: [],
      curItemCustomValue: null,
      checked: false,
      layout: 'form',
    };
    this.Model = this.props.Model.schema;
    this.jsonSchemaData = null;
    this.jsonData = null;
  }


  // json 导入弹窗
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    this.setState({ visible: false });
    if (this.importJsonType !== 'schema') {
      if (!this.jsonData) return;
      const jsonData = GenerateSchema(this.jsonData);
      this.Model.changeEditorSchemaAction({ value: jsonData });
    } else {
      if (!this.jsonSchemaData) return;
      this.Model.changeEditorSchemaAction({ value: this.jsonSchemaData });
    }
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };

  componentWillReceiveProps(nextProps) {
    if (typeof this.props.onChange === 'function' && this.props.schema !== nextProps.schema) {
      const oldData = JSON.stringify(this.props.schema || '');
      const newData = JSON.stringify(nextProps.schema || '');
      if (oldData !== newData) return this.props.onChange(newData);
    }
    if (this.props.data && this.props.data !== nextProps.data) {
      this.Model.changeEditorSchemaAction({ value: JSON.parse(nextProps.data) });
    }
  }

  componentWillMount() {
    let data = this.props.data;
    if (!data) {
      data = `{
        "type": "object",
        "title": "empty object",
        "properties":{}
      }`;
    }
    this.Model.changeEditorSchemaAction({ value: JSON.parse(data) });
  }


  getChildContext() {
    return {
      getOpenValue: keys => utils.getData(this.props.open, keys),
      changeCustomValue: this.changeCustomValue,
      Model: this.props.Model,
      redirectToComponentDetails: this.props.redirectToComponentDetails,
    };
  }

  alterMsg = () => message.error(LocalProvider('valid_json'))

  // AceEditor 中的数据
  handleParams = (e) => {
    if (!e.text) return;
    // 将数据map 到store中
    if (e.format !== true) {
      return this.alterMsg();
    }
    handleSchema(e.jsonData);
    this.Model.changeEditorSchemaAction({
      value: e.jsonData,
    });
  };

  // 修改数据类型
  changeType = (key, value) => {
    this.Model.changeTypeAction({ key: [key], value });
  };

  // 修改数据类型
  handleChangeTypeOrRef = (value) => {
    const isRef = /^ref:/.test(value);

    if (isRef) {
      // eslint-disable-next-line no-param-reassign
      value = value.replace(/^ref:/, '');
    }

    const prefix = [];

    if (isRef) {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value: undefined });
      this.Model.changeValueAction({ key: [].concat(prefix, '$ref'), value });
    }
    else if (Combination_Criteria.indexOf(value) !== -1) {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value: undefined });
      this.Model.changeValueAction({ key: [].concat(prefix, value), value: [] });
    }
    else {
      this.Model.changeTypeAction({ key: [].concat(prefix, 'type'), value });
    }
  };

  handleImportJson = (e) => {
    if (!e.text) {
      return (this.jsonData = null);
    }
    this.jsonData = e.jsonData;
  };

  handleImportJsonSchema = (e) => {
    if (!e.text) {
      return (this.jsonSchemaData = null);
    }
    this.jsonSchemaData = e.jsonData;
  };

  addChildNode = () => {
    let CC = null;
    if (this.props.schema.type === 'object') {
      this.addChildField('properties');
    } else if (CC = isCombinationCriteria(this.props.schema)) {
      this.addChildField(CC);
      this.Model.setOpenValueAction({ key: [CC], value: true });
    }
  }
  // 增加子节点
  addChildField = (key) => {
    this.Model.addChildFieldAction({ key: [key] });
    this.setState({ show: true });
  };

  clickIcon = () => {
    this.setState({ show: !this.state.show });
  };

  // 修改备注信息
  changeValue = (key, value) => {
    this.Model.changeValueAction({ key, value });
  };

  // 备注弹窗
  handleEditOk = () => {
    this.setState({
      editVisible: false,
    });
    this.Model.changeValueAction({ key: this.state.descriptionKey, value: this.state.description });
  };

  handleEditCancel = () => {
    this.setState({
      editVisible: false,
    });
  };
  showEdit = (prefix, name, value) => {
    const descriptionKey = [].concat(prefix, name);

    const description = value;
    this.setState({
      editVisible: true,
      description,
      descriptionKey,
    });
  };

  // 修改备注参数信息
  changeDesc = (e) => {
    this.setState({
      description: e,
    });
  };

  // 高级设置
  handleAdvOk = () => {
    if (this.state.itemKey.length === 0) {
      this.Model.changeEditorSchemaAction({
        value: this.state.curItemCustomValue,
      });
    } else {
      this.Model.changeValueAction({
        key: this.state.itemKey,
        value: this.state.curItemCustomValue,
      });
    }
    this.setState({
      advVisible: false,
    });
  };
  handleAdvCancel = () => {
    this.setState({
      advVisible: false,
    });
  };
  showAdv = (key, value) => {
    this.setState({
      advVisible: true,
      itemKey: key,
      curItemCustomValue: value, // 当前节点的数据信息
    });
  };

  //  修改弹窗中的json-schema 值
  changeCustomValue = (newValue) => {
    this.setState({
      curItemCustomValue: newValue,
    });
  };

  changeCheckBox = (e) => {
    this.setState({ checked: e });
    this.Model.requireAllAction({ required: e, value: this.props.schema });
  };

  handleLayoutChange = (e) => {
    this.setState({ layout: e.target.value });
  };

  handleSelectTypeValue = (schema) => {
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

  showDownStyleOrAddChildNode = (schema) => {
    let show = false;
    if (schema.type === 'object') {
      return true;
    }
    if (show = isCombinationCriteria(schema)) {
      return !!show;
    }
    return show;
  }

  render() {
    const {
      visible,
      editVisible,
      description,
      advVisible,
      checked,
      layout,
    } = this.state;
    const { WrapComponent, schema } = this.props;

    const { type } = schema;
    const selectTypeValue = this.handleSelectTypeValue(schema);
    const disabled = !(type === 'object' || type === 'array');

    return (
      <div className="json-schema-react-editor">
        <WrapComponent>
          <Radio.Group size="small" value={layout} onChange={this.handleLayoutChange}>
            <Radio.Button value="ide">IDE</Radio.Button>
            <Radio.Button value="both">Both</Radio.Button>
            <Radio.Button value="form">Form</Radio.Button>
          </Radio.Group>
          <Button size="small" className="import-json-button" type="primary" onClick={this.showModal}>
            {LocalProvider('import_json')}
          </Button>
        </WrapComponent>
        <Modal
          maskClosable={false}
          visible={visible}
          title={LocalProvider('import_json')}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="json-schema-react-editor-import-modal"
          okText={LocalProvider('ok')}
          cancelText={LocalProvider('cancel')}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              {LocalProvider('cancel')}
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>
              {LocalProvider('ok')}
            </Button>,
          ]}
        >
          <Tabs
            defaultActiveKey="json"
            onChange={(key) => {
              this.importJsonType = key;
            }}
          >
            <TabPane tab="JSON" key="json">
              <AceEditor data="" mode="json" onChange={this.handleImportJson} />
            </TabPane>
            <TabPane tab="JSON-SCHEMA" key="schema">
              <AceEditor data="" mode="json" onChange={this.handleImportJsonSchema} />
            </TabPane>
          </Tabs>
        </Modal>
        <Modal
          title={LocalProvider('default')}
          maskClosable={false}
          visible={editVisible}
          onOk={this.handleEditOk}
          onCancel={this.handleEditCancel}
          okText={LocalProvider('ok')}
          cancelText={LocalProvider('cancel')}
        >
          <TextArea
            value={description}
            placeholder={LocalProvider('default')}
            onChange={e => this.changeDesc(e.target.value)}
            autosize={{ minRows: 6, maxRows: 10 }}
          />
        </Modal>
        <Modal
          title={LocalProvider('adv_setting')}
          maskClosable={false}
          visible={advVisible}
          onOk={this.handleAdvOk}
          onCancel={this.handleAdvCancel}
          okText={LocalProvider('ok')}
          width={780}
          cancelText={LocalProvider('cancel')}
          className="json-schema-react-editor-adv-modal"
        >
          <CustomItem data={JSON.stringify(this.state.curItemCustomValue, null, 2)} extractComponent={this.props.extractComponent} />
        </Modal>
        <Row type="flex">
          {(layout === 'both' || layout === 'ide') && (
            <Col span={layout === 'both' ? 8 : 24}>
              <AceEditor
                className="pretty-editor"
                mode="json"
                data={JSON.stringify(this.props.schema, null, 2)}
                onChange={this.handleParams}
              />
            </Col>
          )}
          {
            (layout === 'both' || layout === 'form') &&
            <Col span={layout === 'both' ? 16 : 24} className="wrapper object-style">
              <Row className="row" type="flex" align="middle">
                <Col span={12} className="col-item name-item col-item-name">
                  <Row type="flex" justify="space-around" align="middle">
                    <Col span={2} className="down-style-col">
                      {this.showDownStyleOrAddChildNode(this.props.schema) ? (
                        <span className="down-style" onClick={this.clickIcon}>
                          {this.state.show ?
                            <Icon
                              className="icon-object"
                              type="caret-down"
                            />
                            :
                            <Icon
                              className="icon-object"
                              type="caret-right"
                            />
                          }
                        </span>
                      ) : null}
                    </Col>
                    <Col span={22}>
                      <Input
                        addonAfter={
                          <Tooltip placement="top" title={LocalProvider('checked_all')}>
                            <Checkbox
                              checked={checked}
                              disabled={disabled}
                              onChange={e => this.changeCheckBox(e.target.checked)}
                            />
                          </Tooltip>

                        }
                        disabled
                        value="root"
                      />
                    </Col>
                  </Row>
                </Col>
                <Col span={4} className="col-item col-item-type">
                  <Select
                    showSearch
                    className="type-select-style"
                    onChange={this.handleChangeTypeOrRef}
                    value={selectTypeValue}
                    filterOption={(input, option) => {
                      const child = option.props.children;
                      if (typeof child === 'string') {
                        return child.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                      }
                      return false;
                    }}
                  >
                    <OptGroup label="Basic">
                      {SCHEMA_TYPE.map(item => (
                        <Option value={item} key={item}>
                          {item}
                        </Option>
                      ))}
                    </OptGroup>
                    <OptGroup label="Combine">
                      {Combination_Criteria.map(item => (
                        <Option value={item} key={item}>
                          {item}
                        </Option>
                      ))}
                    </OptGroup>
                    <OptGroup label="Ref">
                      {this.props.refSchemas.map(item => (
                        <Option value={`ref:${this.props.refFunc(item)}`} key={item}>
                          {item.name}
                        </Option>
                      ))}
                    </OptGroup>
                  </Select>
                </Col>
                {
                  typeof this.props.schema.$ref === 'undefined' &&
                  <Col span={5} className="col-item col-item-desc">
                    <Input
                      addonAfter={
                        <Icon
                          type="edit"
                          onClick={() => this.showEdit([], 'description', this.props.schema.description)}
                        />
                      }
                      placeholder={LocalProvider('description')}
                      value={this.props.schema.description}
                      onChange={e => this.changeValue(['description'], e.target.value)}
                    />
                  </Col>
                }
                {
                  typeof this.props.schema.$ref !== 'undefined' &&
                  <Col span={5} className="col-item col-item-type">
                    <Input
                      type="button"
                      value="跳转至组件"
                      addonAfter={<Icon type="right" />}
                      onClick={() => this.props.redirectToComponentDetails(this.props.schema.$ref)}
                    />
                  </Col>
                }
                <Col span={3} className="col-item col-item-setting">
                  <Tooltip
                    onClick={() => this.showAdv([], this.props.schema)}
                    placement="top"
                    title={LocalProvider('adv_setting')}
                  >
                    <Icon className="adv-set" type="setting" />
                  </Tooltip>
                  {
                    this.showDownStyleOrAddChildNode(this.props.schema) &&
                    <Tooltip
                      onClick={this.addChildNode}
                      placement="top"
                      title={LocalProvider('add_child_node')}
                    >
                      <Icon type="plus" className="plus" />
                    </Tooltip>
                  }
                </Col>
              </Row>
              {this.state.show && (
                <SchemaJson
                  data={this.props.schema}
                  refSchemas={this.props.refSchemas}
                  refFunc={this.props.refFunc}
                  showEdit={this.showEdit}
                  showAdv={this.showAdv}
                />
              )}
            </Col>
          }
        </Row>
      </div>
    );
  }
}

jsonSchema.childContextTypes = {
  getOpenValue: PropTypes.func,
  changeCustomValue: PropTypes.func,
  Model: PropTypes.object,
  redirectToComponentDetails: PropTypes.func,
};

jsonSchema.propTypes = {
  data: PropTypes.string,
  onChange: PropTypes.func,
  showEditor: PropTypes.bool,
  Model: PropTypes.object,
  refSchemas: PropTypes.array,
  refFunc: PropTypes.func,
  redirectToComponentDetails: PropTypes.func,
  schema: PropTypes.object,
  WrapComponent: PropTypes.func,
};

jsonSchema.defaultProps = {
  refFunc: item => `#components/schema/${item.id}`,
  refSchemas: [],
  redirectToComponentDetails: () => { },
};

export default connect(state => ({
  schema: state.schema.data,
  open: state.schema.open,
}))(jsonSchema);
