import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import moox from 'moox';
import PropTypes from 'prop-types';
import { devToolsEnhancer } from 'redux-devtools-extension';

import App from './App';
import utils from './utils';
import schema from './models/schema';

module.exports = (config = {}) => {
  if (config.lang) utils.lang = config.lang;

  const Model = moox({
    schema,
  },
    // {
    //   enhancer: devToolsEnhancer()
    // }
  );
  if (config.format) {
    Model.__jsonSchemaFormat = config.format;
  } else {
    Model.__jsonSchemaFormat = utils.format;
  }

  const store = Model.getStore();

  const DefaultComponent = (props) => {
    return (
      <div>{props.children}</div>
    );
  };

  class CurrentComponent extends React.Component {
    WrapComponent = this.props.WrapComponent || DefaultComponent;

    render() {
      return (
        <Provider store={store} className="wrapper">
          <App Model={Model} {...this.props} WrapComponent={this.WrapComponent} />
        </Provider>
      );
    }
  }

  CurrentComponent.propTypes = {
    data: PropTypes.string,
    onChange: PropTypes.func,
    showEditor: PropTypes.bool,
    refSchemas: PropTypes.array,
    refFunc: PropTypes.func,
    WrapComponent: PropTypes.func,
  };
  return CurrentComponent;
};

