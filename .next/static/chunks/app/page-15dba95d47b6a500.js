(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{8423:function(e,n,r){Promise.resolve().then(r.bind(r,9143))},9143:function(e,n,r){"use strict";r.r(n),r.d(n,{default:function(){return W}});var t=r(8038),o=r(1038),i=r(6381),l=r(3082),a=r(719),s=r(6073),c=r(4873),u=r(766),d=r(2272),x=r(8424),h=r(5980),p=r(7626),m=r(1185),f=r(8341),y=r(3613);function Z(e){return(0,y.Z)("MuiLink",e)}let j=(0,f.Z)("MuiLink",["root","underlineNone","underlineHover","underlineAlways","button","focusVisible"]);var b=r(5472),g=r(7564);let v={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"},k=e=>v[e]||e;var C=({theme:e,ownerState:n})=>{let r=k(n.color),t=(0,b.DW)(e,`palette.${r}`,!1)||n.color,o=(0,b.DW)(e,`palette.${r}Channel`);return"vars"in e&&o?`rgba(${o} / 0.4)`:(0,g.Fq)(t,.4)};let w=["className","color","component","onBlur","onFocus","TypographyClasses","underline","variant","sx"],D=e=>{let{classes:n,component:r,focusVisible:t,underline:o}=e,i={root:["root",`underline${(0,u.Z)(o)}`,"button"===r&&"button",t&&"focusVisible"]};return(0,c.Z)(i,Z,n)},S=(0,d.ZP)(m.Z,{name:"MuiLink",slot:"Root",overridesResolver:(e,n)=>{let{ownerState:r}=e;return[n.root,n[`underline${(0,u.Z)(r.underline)}`],"button"===r.component&&n.button]}})(({theme:e,ownerState:n})=>(0,l.Z)({},"none"===n.underline&&{textDecoration:"none"},"hover"===n.underline&&{textDecoration:"none","&:hover":{textDecoration:"underline"}},"always"===n.underline&&(0,l.Z)({textDecoration:"underline"},"inherit"!==n.color&&{textDecorationColor:C({theme:e,ownerState:n})},{"&:hover":{textDecorationColor:"inherit"}}),"button"===n.component&&{position:"relative",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none","&::-moz-focus-inner":{borderStyle:"none"},[`&.${j.focusVisible}`]:{outline:"auto"}})),A=a.forwardRef(function(e,n){let r=(0,x.Z)({props:e,name:"MuiLink"}),{className:o,color:c="primary",component:u="a",onBlur:d,onFocus:m,TypographyClasses:f,underline:y="always",variant:Z="inherit",sx:j}=r,b=(0,i.Z)(r,w),{isFocusVisibleRef:g,onBlur:k,onFocus:C,ref:A}=(0,h.Z)(),[W,z]=a.useState(!1),N=(0,p.Z)(n,A),O=(0,l.Z)({},r,{color:c,component:u,focusVisible:W,underline:y,variant:Z}),E=D(O);return(0,t.jsx)(S,(0,l.Z)({color:c,className:(0,s.Z)(E.root,o),classes:f,component:u,onBlur:e=>{k(e),!1===g.current&&z(!1),d&&d(e)},onFocus:e=>{C(e),!0===g.current&&z(!0),m&&m(e)},ref:N,ownerState:O,variant:Z,sx:[...Object.keys(v).includes(c)?[]:[{color:c}],...Array.isArray(j)?j:[j]]},b))});function W(){return(0,t.jsxs)("div",{style:{overflowX:"hidden"},children:[(0,t.jsx)(o.default,{}),(0,t.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",maxHeight:"100vh",minHeight:"90vh"},children:(0,t.jsx)(A,{href:"https://discord.com/api/oauth2/authorize?client_id=1100859965616427068&permissions=418829953344&scope=bot+applications.commands",style:{color:"white",textDecoration:"none"},children:(0,t.jsx)("h2",{style:{fontFamily:"monospace",fontWeight:700,letterSpacing:".3rem"},children:"Invite the bot to your server"})})})]})}},1038:function(e,n,r){"use strict";r.r(n),r.d(n,{default:function(){return k}});var t=r(8038),o=r(9474),i=r(4836),l=r(6740),a=r(719),s=r(9497),c=r(1185),u=r(4690),d=r(1830),x=r(1969),h=r(7688),p=r(2011),m=r(3146),f=r(3815),y=r(7936),Z=r(2846),j=r.n(Z);function b(e){let{to:n,props:r,children:o}=e;return(0,t.jsx)(j(),{...r,href:n,style:{color:"white",textDecoration:"none"},children:o})}let g=[{name:"Acceuil",href:"/"},{name:"CGU",href:"/cgu"},{name:"Privacy Policy",href:"/privacy"}],v=["In Progress"];function k(){let[e,n]=a.useState(null),[r,Z]=a.useState(null),j=()=>{n(null)},k=()=>{Z(null)};return(0,t.jsx)(o.Z,{position:"static",children:(0,t.jsx)(x.Z,{maxWidth:"xl",children:(0,t.jsxs)(l.Z,{disableGutters:!0,children:[(0,t.jsx)(y.Z,{sx:{display:{xs:"none",md:"flex"},mr:1}}),(0,t.jsx)(c.Z,{variant:"h6",noWrap:!0,component:"a",sx:{mr:2,display:{xs:"none",md:"flex"},fontFamily:"monospace",fontWeight:700,letterSpacing:".3rem",color:"inherit",textDecoration:"none"},children:"KETSUNA"}),(0,t.jsxs)(i.Z,{sx:{flexGrow:1,display:{xs:"flex",md:"none"}},children:[(0,t.jsx)(s.Z,{size:"large","aria-label":"account of current user","aria-controls":"menu-appbar-mobile","aria-haspopup":"true",onClick:e=>{n(e.currentTarget)},color:"inherit",children:(0,t.jsx)(d.Z,{})}),(0,t.jsx)(u.Z,{id:"menu-appbar",anchorEl:e,anchorOrigin:{vertical:"bottom",horizontal:"left"},keepMounted:!0,transformOrigin:{vertical:"top",horizontal:"left"},open:!!e,onClose:j,sx:{display:{xs:"block",md:"none"}},children:g.map(e=>(0,t.jsx)(b,{to:"".concat(e.href),children:(0,t.jsx)(f.Z,{onClick:j,children:(0,t.jsx)(c.Z,{textAlign:"center",children:e.name})})},e.href))})]}),(0,t.jsx)(y.Z,{sx:{display:{xs:"flex",md:"none"},mr:1}}),(0,t.jsx)(c.Z,{variant:"h5",noWrap:!0,component:"a",sx:{mr:2,display:{xs:"flex",md:"none"},flexGrow:1,fontFamily:"monospace",fontWeight:700,letterSpacing:".3rem",color:"inherit",textDecoration:"none"},children:"KETSUNA"}),(0,t.jsx)(i.Z,{sx:{flexGrow:1,display:{xs:"none",md:"flex"}},children:g.map(e=>(0,t.jsx)(b,{to:"".concat(e.href),children:(0,t.jsx)(p.Z,{onClick:j,sx:{my:2,color:"white",display:"block"},children:e.name})},e.href))}),(0,t.jsxs)(i.Z,{sx:{flexGrow:0},children:[(0,t.jsx)(m.Z,{title:"Open settings",children:(0,t.jsx)(s.Z,{onClick:e=>{Z(e.currentTarget)},sx:{p:0},children:(0,t.jsx)(h.Z,{alt:"Ketsuna"})})}),(0,t.jsx)(u.Z,{sx:{mt:"45px"},id:"menu-appbar",anchorEl:r,anchorOrigin:{vertical:"top",horizontal:"right"},keepMounted:!0,transformOrigin:{vertical:"top",horizontal:"right"},open:!!r,onClose:k,children:v.map(e=>(0,t.jsx)(f.Z,{onClick:k,children:(0,t.jsx)(c.Z,{textAlign:"center",children:e})},e))})]})]})})})}}},function(e){e.O(0,[982,230,120,543,744],function(){return e(e.s=8423)}),_N_E=e.O()}]);