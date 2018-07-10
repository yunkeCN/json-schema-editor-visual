import React, { PureComponent } from 'react';
import {
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Checkbox,
  Icon,
  Tooltip,
  Switch,
} from 'antd';
import './schemaJson.css';
import _ from 'underscore';
import PropTypes from 'prop-types';

import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE } from '../../utils';
import AceEditor from '../AceEditor/AceEditor';
import LocalProvider from '../LocalProvider/index';

const { TextArea } = Input;
const { Option } = Select;

const changeOtherValue = (value, name, data, change) => {
  data[name] = value;
  change(data);
};

class SchemaString extends PureComponent {
  constructor(props, context) {
    super(props);
    this.state = {
      checked: !_.isUndefined(props.data.enum),
    };
    this.format = context.Model.__jsonSchemaFormat;
  }

  componentWillReceiveProps(nextprops) {
    if (this.props.data.enum !== nextprops.data.enum) {
      this.setState({
        checked: !_.isUndefined(nextprops.data.enum),
      });
    }
  }

  changeOtherValue = (value, name, data) => {
    data[name] = value;
    this.context.changeCustomValue(data);
  };

  changeEnumOtherValue = (value, data) => {
    const arr = value.split('\n');
    if (arr.length === 0 || (arr.length == 1 && !arr[0])) {

    } else {
      data.enum = arr;
      this.context.changeCustomValue(data);
    }
  };

  onChangeCheckBox = (e) => {
    console.log(e);
    this.setState({
      checked: e.target.checked,
    });
  };

  render() {
    const { data } = this.props;
    return (
      <div>
        <div className="default-setting">{LocalProvider('base_setting')}</div>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            {LocalProvider('default')}：
          </Col>
          <Col span={20}>
            <Input
              value={data.default}
              placeholder={LocalProvider('default')}
              onChange={e => this.changeOtherValue(e.target.value, 'default', data)}
            />
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={8} className="other-label">
                {LocalProvider('minLength')}：
              </Col>
              <Col span={16}>
                <InputNumber
                  value={data.minLength}
                  placeholder="min.length"
                  onChange={e => this.changeOtherValue(e, 'minLength', data)}
                />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row type="flex" align="middle">
              <Col span={8} className="other-label">
                {LocalProvider('maxLength')}：
              </Col>
              <Col span={16}>
                <InputNumber
                  value={data.maxLength}
                  placeholder="max.length"
                  onChange={e => this.changeOtherValue(e, 'maxLength', data)}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>
              Pattern&nbsp;
              <Tooltip title={LocalProvider('pattern')}>
                <Icon type="question-circle-o" style={{ width: '10px' }} />
              </Tooltip>
              &nbsp; :
            </span>
          </Col>
          <Col span={20}>
            <Input
              value={data.pattern}
              placeholder="Pattern"
              onChange={e => this.changeOtherValue(e.target.value, 'pattern', data)}
            />
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>
              {LocalProvider('enum')}
              <Checkbox checked={this.state.checked} onChange={this.onChangeCheckBox} /> :
            </span>
          </Col>
          <Col span={20}>
            <TextArea
              value={data.enum && data.enum.length && data.enum.join('\n')}
              disabled={!this.state.checked}
              placeholder={LocalProvider('enum_msg')}
              autosize={{ minRows: 2, maxRows: 6 }}
              onChange={(e) => {
                this.changeEnumOtherValue(e.target.value, data);
              }}
            />
          </Col>
        </Row>
        <Row className="other-row" type="flex" align="middle">
          <Col span={4} className="other-label">
            <span>format :</span>
          </Col>
          <Col span={20}>
            <Select
              showSearch
              style={{ width: 150 }}
              value={data.format}
              dropdownClassName="json-schema-react-editor-adv-modal-select"
              placeholder="Select a format"
              optionFilterProp="children"
              optionLabelProp="value"
              onChange={e => this.changeOtherValue(e, 'format', data)}
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {this.format.map(item => (
                <Option value={item.name} key={item.name}>
                  {item.name} <span className="format-items-title">{item.title}</span>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
    );
  }
}
SchemaString.contextTypes = {
  changeCustomValue: PropTypes.func,
  Model: PropTypes.object,
};

const SchemaNumber = (props, context) => {
  const { data } = props;

  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" type="flex" align="middle">
        <Col span={4} className="other-label">
          {LocalProvider('default')}：
        </Col>
        <Col span={20}>
          <Input
            value={data.default}
            placeholder={LocalProvider('default')}
            onChange={e =>
              changeOtherValue(e.target.value, 'default', data, context.changeCustomValue)
            }
          />
        </Col>
      </Row>
      <Row className="other-row" type="flex" align="middle">
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={13} className="other-label">
              <span>
                exclusiveMinimum&nbsp;
                <Tooltip title={LocalProvider('exclusiveMinimum')}>
                  <Icon type="question-circle-o" style={{ width: '10px' }} />
                </Tooltip>
                &nbsp; :
              </span>
            </Col>
            <Col span={11}>
              <Switch
                checked={data.exclusiveMinimum}
                placeholder="exclusiveMinimum"
                onChange={e =>
                  changeOtherValue(e, 'exclusiveMinimum', data, context.changeCustomValue)
                }
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={13} className="other-label">
              <span>
                exclusiveMaximum&nbsp;
                <Tooltip title={LocalProvider('exclusiveMaximum')}>
                  <Icon type="question-circle-o" style={{ width: '10px' }} />
                </Tooltip>
                &nbsp; :
              </span>
            </Col>
            <Col span={11}>
              <Switch
                checked={data.exclusiveMaximum}
                placeholder="exclusiveMaximum"
                onChange={e =>
                  changeOtherValue(e, 'exclusiveMaximum', data, context.changeCustomValue)
                }
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="other-row" type="flex" align="middle">
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={8} className="other-label">
              {LocalProvider('minimum')}：
            </Col>
            <Col span={16}>
              <InputNumber
                value={data.minimum}
                placeholder={LocalProvider('minimum')}
                onChange={e => changeOtherValue(e, 'minimum', data, context.changeCustomValue)}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={8} className="other-label">
              {LocalProvider('maximum')}：
            </Col>
            <Col span={16}>
              <InputNumber
                value={data.maximum}
                placeholder={LocalProvider('maximum')}
                onChange={e => changeOtherValue(e, 'maximum', data, context.changeCustomValue)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

SchemaNumber.contextTypes = {
  changeCustomValue: PropTypes.func,
};

const SchemaBoolean = (props, context) => {
  const { data } = props;
  const value = _.isUndefined(data.default) ? '' : data.default ? 'true' : 'false';
  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" type="flex" align="middle">
        <Col span={4} className="other-label">
          {LocalProvider('default')}：
        </Col>
        <Col span={20}>
          <Select
            value={value}
            onChange={e =>
              changeOtherValue(
                e === 'true',
                'default',
                data,
                context.changeCustomValue,
              )
            }
            style={{ width: 200 }}
          >
            <Option value="true">true</Option>
            <Option value="false">false</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

SchemaBoolean.contextTypes = {
  changeCustomValue: PropTypes.func,
};

const SchemaArray = (props, context) => {
  const { data } = props;
  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" type="flex" align="middle">
        <Col span={6} className="other-label">
          <span>
            uniqueItems&nbsp;
            <Tooltip title={LocalProvider('unique_items')}>
              <Icon type="question-circle-o" style={{ width: '10px' }} />
            </Tooltip>
            &nbsp; :
          </span>
        </Col>
        <Col span={18}>
          <Switch
            checked={data.uniqueItems}
            placeholder="uniqueItems"
            onChange={e => changeOtherValue(e, 'uniqueItems', data, context.changeCustomValue)}
          />
        </Col>
      </Row>
      <Row className="other-row" type="flex" align="middle">
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={12} className="other-label">
              {LocalProvider('min_items')}：
            </Col>
            <Col span={12}>
              <InputNumber
                value={data.minItems}
                placeholder="minItems"
                onChange={e => changeOtherValue(e, 'minItems', data, context.changeCustomValue)}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row type="flex" align="middle">
            <Col span={12} className="other-label">
              {LocalProvider('max_items')}：
            </Col>
            <Col span={12}>
              <InputNumber
                value={data.maxItems}
                placeholder="maxItems"
                onChange={e => changeOtherValue(e, 'maxItems', data, context.changeCustomValue)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

SchemaArray.contextTypes = {
  changeCustomValue: PropTypes.func,
};

const mapping = data => ({
  string: <SchemaString data={data} />,
  number: <SchemaNumber data={data} />,
  boolean: <SchemaBoolean data={data} />,
  integer: <SchemaNumber data={data} />,
  array: <SchemaArray data={data} />,
}[data.type]);

const handleInputEditor = (e, change) => {
  if (!e.text) return;
  change(e.jsonData);
};

const CustomItem = (props, context) => {
  const { data } = props;
  const optionForm = mapping(JSON.parse(data));

  return (
    <div>
      <div>{optionForm}</div>
      <div className="default-setting">{LocalProvider('all_setting')}</div>
      <AceEditor
        data={data}
        mode="json"
        onChange={e => handleInputEditor(e, context.changeCustomValue)}
      />
    </div>
  );
};

CustomItem.contextTypes = {
  changeCustomValue: PropTypes.func,
};

export default CustomItem;
