import 'angular';
import 'angular-ui-router';
import 'angular-aria';
import 'angular-animate';
import 'angular-material';
import 'fullcalendar';

import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/draggable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';

var moment = require('moment');
window.moment = moment;

var $ = require('jquery');
window.jQuery = $;
window.$ = $;

require('./vendor.scss');
require('./material-fullcalendar.css');
