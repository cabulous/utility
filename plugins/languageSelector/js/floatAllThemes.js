import '../../sass/index.scss';

import Selector from "components/selector";

const target = {
    desktop: document.querySelector('body'),
    mobile: document.querySelector('body'),
};

const selector = new Selector(target);
