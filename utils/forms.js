import { createElement } from './elements';
import is from './is';

// eslint-disable-next-line import/prefer-default-export
export function createFormSelect(
  id, options, optionPosition, customSelectClass = '') {
  if (!is.array(options)) {
    throw new Error(`Widget: expect options as an array but got ${options}`);
  }

  const select = createElement(
    'select',
    {
      class: customSelectClass,
      id,
      'data-index': optionPosition,
    },
  );

  options.forEach((option, index) => {
    const selectedAttribute = {};
    if (index === 0) {
      selectedAttribute.selected = '';
    }

    const optionElm = createElement(
      'option',
      {
        value: option,
        ...selectedAttribute,
      },
      option,
    );
    select.appendChild(optionElm);
  });

  return select;
}
