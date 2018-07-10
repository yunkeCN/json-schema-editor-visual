import utils from '../../utils';
import React from 'react';

const langs = {
  en_US: {
    import_json: 'Import JSON',
    base_setting: 'Base Setting',
    all_setting: 'Sourec Code',
    default: 'Default',
    description: 'Description',
    adv_setting: 'Advanced Settings',
    add_child_node: 'Add child node',
    add_sibling_node: 'Add sibling nodes',
    add_node: 'Add sibling/child nodes',
    child_node: 'Child node',
    sibling_node: 'Sibling node',
    ok: 'OK',
    cancel: 'Cancel',
    minLength: 'Min.L',
    maxLength: 'Max.L',
    pattern: 'MUST be a string and SHOULD be a valid regular expression.',
    exclusiveMinimum: 'Value strictly less than',
    exclusiveMaximum: 'Value strictly more than',
    minimum: 'Min',
    maximum: 'Max',
    unique_items: 'Unique Items',
    min_items: 'MinItems',
    max_items: 'MaxItems',
    checked_all: 'Checked All',
    valid_json: 'Not valid json',
    enum: 'Enum',
    enum_msg: 'One value per line',
  },
  zh_CN: {
    import_json: '导入 json',
    base_setting: '基础设置',
    all_setting: '编辑源码',
    default: '默认值',
    description: '备注',
    adv_setting: '高级设置',
    add_child_node: '添加子节点',
    add_sibling_node: '添加兄弟节点',
    add_node: '添加兄弟/子节点',
    child_node: '子节点',
    sibling_node: '兄弟节点',
    ok: '确定',
    cancel: '取消',
    minLength: '最小长度',
    maxLength: '最大长度',
    pattern: '用正则表达式约束字符串',
    exclusiveMinimum: '开启后，数据必须大于最小值',
    exclusiveMaximum: '开启后，数据必须大于最大值',
    minimum: '最小值',
    maximum: '最大值',
    unique_items: '开启后，每个元素都不相同',
    min_items: '最小元素个数',
    max_items: '最大元素个数',
    checked_all: '全选',
    valid_json: '不是合法的json字符串',
    enum: '枚举',
    enum_msg: '每行只能写一个值',
  },
};

export default message => langs[utils.lang][message];


// exports.LocalProvider = (props)=>{
//   console.log(langs[utils.lang][props.message])
//   return <span>{langs[utils.lang][props.message]}</span>
//   // return langs[utils.lang][props.message]
// }
