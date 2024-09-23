"use strict";function asyncGeneratorStep(e,r,t,n,o,a,s){try{var c=e[a](s),i=c.value}catch(e){t(e);return}c.done?r(i):Promise.resolve(i).then(n,o)}function _async_to_generator(e){return function(){var r=this,t=arguments;return new Promise(function(n,o){var a=e.apply(r,t);function s(e){asyncGeneratorStep(a,n,o,s,c,"next",e)}function c(e){asyncGeneratorStep(a,n,o,s,c,"throw",e)}s(void 0)})}}function _object_spread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{},n=Object.keys(t);"function"==typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(t).filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.forEach(function(r){var n;n=t[r],r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n})}return e}function _object_spread_props(e,r){return r=null!=r?r:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):(function(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t.push.apply(t,n)}return t})(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}),e}function _ts_generator(e,r){var t,n,o,a,s={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return a={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function c(a){return function(c){return function(a){if(t)throw TypeError("Generator is already executing.");for(;s;)try{if(t=1,n&&(o=2&a[0]?n.return:a[0]?n.throw||((o=n.return)&&o.call(n),0):n.next)&&!(o=o.call(n,a[1])).done)return o;switch(n=0,o&&(a=[2&a[0],o.value]),a[0]){case 0:case 1:o=a;break;case 4:return s.label++,{value:a[1],done:!1};case 5:s.label++,n=a[1],a=[0];continue;case 7:a=s.ops.pop(),s.trys.pop();continue;default:if(!(o=(o=s.trys).length>0&&o[o.length-1])&&(6===a[0]||2===a[0])){s=0;continue}if(3===a[0]&&(!o||a[1]>o[0]&&a[1]<o[3])){s.label=a[1];break}if(6===a[0]&&s.label<o[1]){s.label=o[1],o=a;break}if(o&&s.label<o[2]){s.label=o[2],s.ops.push(a);break}o[2]&&s.ops.pop(),s.trys.pop();continue}a=r.call(e,s)}catch(e){a=[6,e],n=0}finally{t=o=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,c])}}}function createUser(e,r){return _createUser.apply(this,arguments)}function _createUser(){return(_createUser=_async_to_generator(function(e,r){return _ts_generator(this,function(t){switch(t.label){case 0:return[4,r.users.upsert({where:{id:e.id},include:{horde_config:{include:{loras:!0}}},update:e,create:e})];case 1:return[2,t.sent()]}})})).apply(this,arguments)}function createOrUpdateUserWithConfig(e,r,t){return _createOrUpdateUserWithConfig.apply(this,arguments)}function _createOrUpdateUserWithConfig(){return(_createOrUpdateUserWithConfig=_async_to_generator(function(e,r,t){var n;return _ts_generator(this,function(o){switch(o.label){case 0:return[4,getUser(e,t)];case 1:if((n=o.sent()).horde_config)return[3,3];return[4,t.aIHordeConfig.create({data:_object_spread_props(_object_spread({},r),{user:{connect:{id:e}}})})];case 2:case 4:return[2,o.sent()];case 3:return[4,t.aIHordeConfig.upsert({where:{id:n.horde_config.id},update:r,create:_object_spread_props(_object_spread({},r),{user:{connect:{id:e}}})})]}})})).apply(this,arguments)}function getUser(e,r){return _getUser.apply(this,arguments)}function _getUser(){return(_getUser=_async_to_generator(function(e,r){return _ts_generator(this,function(t){switch(t.label){case 0:return[4,createUser({id:e},r)];case 1:return[2,t.sent()]}})})).apply(this,arguments)}function removeToken(e,r){return _removeToken.apply(this,arguments)}function _removeToken(){return(_removeToken=_async_to_generator(function(e,r){return _ts_generator(this,function(t){switch(t.label){case 0:return[4,r.users.findFirst({where:{id:e}})];case 1:if(!t.sent())return[2,!1];return[4,r.users.update({where:{id:e},data:{horde_token:null}})];case 2:return[2,t.sent()]}})})).apply(this,arguments)}function removeLoras(e,r){return _removeLoras.apply(this,arguments)}function _removeLoras(){return(_removeLoras=_async_to_generator(function(e,r){return _ts_generator(this,function(t){switch(t.label){case 0:return[4,r.loras.deleteMany({where:{aiHordeConfigId:e}})];case 1:return[2,t.sent()]}})})).apply(this,arguments)}function addLoras(e,r,t){return _addLoras.apply(this,arguments)}function _addLoras(){return(_addLoras=_async_to_generator(function(e,r,t){return _ts_generator(this,function(n){switch(n.label){case 0:return[4,t.loras.upsert({create:{loras_id:r,aiHordeConfigId:e},update:{loras_id:r,aiHordeConfigId:e},where:{loras_id:r,aiHordeConfigId:e}})];case 1:return[2,n.sent()]}})})).apply(this,arguments)}Object.defineProperty(exports,"__esModule",{value:!0}),function(e,r){for(var t in r)Object.defineProperty(e,t,{enumerable:!0,get:r[t]})}(exports,{addLoras:function(){return addLoras},createOrUpdateUserWithConfig:function(){return createOrUpdateUserWithConfig},createUser:function(){return createUser},getUser:function(){return getUser},removeLoras:function(){return removeLoras},removeToken:function(){return removeToken}});