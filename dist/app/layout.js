"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),function(e,t){for(var a in t)Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}(exports,{default:function(){return RootLayout},metadata:function(){return metadata}});var _react=_interop_require_default(require("react")),_theme=_interop_require_default(require("../components/theme")),_v14appRouter=require("@mui/material-nextjs/v14-appRouter");function _interop_require_default(e){return e&&e.__esModule?e:{default:e}}var metadata={title:{default:"Ketsuna - The AI Discord Bot",template:"%s | Ketsuna"},description:"Ketsuna is a Discord bot that uses AI to generates Images, Texts, and more!",metadataBase:new URL("https://ketsuna.com"),openGraph:{type:"website",locale:"fr_FR",url:"https://ketsuna.com",siteName:"Ketsuna",title:"Ketsuna - The AI Discord Bot",description:"Ketsuna is a Discord bot that uses AI to generates Images, Texts, and more!",emails:["contact@kestsuna.com"],countryName:"France"}};function RootLayout(e){var t=e.children;return _react.default.createElement("html",{lang:"fr"},_react.default.createElement("body",null,_react.default.createElement(_v14appRouter.AppRouterCacheProvider,{options:{enableCssLayer:!0}},_react.default.createElement(_theme.default,null,t))))}