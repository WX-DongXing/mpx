(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{246:function(t,s,i){},248:function(t,s,i){"use strict";var e={props:{code:{type:String,default:""},title:{type:String,default:""}},data:()=>({isShow:!1,isClick:!1}),methods:{handleEnter(){this.isShow=!0},handleLeave(){this.isShow=!1},handleToggle(){this.isClick=!this.isClick,this.isShow=this.isClick}}},a=(i(249),i(3)),n=Object(a.a)(e,(function(){var t=this,s=t._self._c;return s("div",{staticClass:"popover"},[s("div",{staticClass:"popover__content",on:{click:t.handleToggle,mouseenter:t.handleEnter,mouseleave:t.handleLeave}},[t._t("default")],2),t._v(" "),s("div",{directives:[{name:"show",rawName:"v-show",value:t.isShow,expression:"isShow"}],staticClass:"popover__top"},[s("div",{staticClass:"popover__content"},[s("div",{staticClass:"popover__inner"},[t.code?s("img",{attrs:{width:"110",src:t.code,alt:"code",loading:"lazy"}}):t._e(),t._v(" "),t.title?s("div",[t._v(t._s(t.title))]):t._e()]),t._v(" "),s("div",{staticClass:"popover__arrow"})])])])}),[],!1,null,"29e8ff3e",null);s.a=n.exports},249:function(t,s,i){"use strict";i(246)},265:function(t,s,i){},266:function(t,s,i){},267:function(t,s,i){},268:function(t,s,i){},291:function(t,s,i){"use strict";i(265)},292:function(t,s,i){"use strict";i(266)},293:function(t,s,i){"use strict";i(267)},294:function(t,s,i){"use strict";i(268)},303:function(t,s,i){"use strict";i.r(s);var e={props:{dataList:{type:Array,default:()=>[]}},data:()=>({msg:"",current:0,resut:[],allWidth:0,timer:0,prevCls:"swiper-disable",nextCls:""}),mounted(){this.$nextTick(()=>{const t=this.$refs.list;if(!t.length)return;const s=[];let i=0;for(let e=0;e<t.length;e++){const a=t[e];i+=a.offsetWidth,s.push({width:a.offsetWidth,left:a.offsetLeft})}this.wrapper=this.$refs.wrapper,this.resut=s,this.allWidth=i,this.handleClick(0)})},watch:{current(t){this.prevCls=0===t?"swiper-disable":"",t===this.dataList.length-1?this.nextCls="swiper-disable":this.nextCls=""}},methods:{handlePrev(){this.current-1>-1&&(clearInterval(this.timer),this.handleClick(this.current-1))},handleNext(){this.current+1<this.dataList.length&&(clearInterval(this.timer),this.handleClick(this.current+1))},handleClick(t){this.current=t;const s=this.$refs.list;s.length&&(s.forEach(t=>{t.style.transition="none",t.style.transform="scale(1)"}),s[t].style.transition="transform 0.3s",s[t].style.transform="scale(1.5)",this.$emit("change",t))},handleEnd(){const t=Math.floor(this.resut[this.current].left)-this.wrapper.scrollLeft,s=this.wrapper.scrollLeft,i=Math.floor(this.wrapper.offsetWidth/2)-Math.floor(this.resut[this.current].width/2),e=this.allWidth-this.wrapper.offsetWidth;let a=s+(t-i);a<0&&(a=0),a>e&&(a=e),this.allWidth>this.wrapper.offsetWidth&&s!==a&&this.animationScroll(a)},animationScroll(t){const s=this.allWidth-this.wrapper.offsetWidth,i=this.wrapper.scrollLeft,e=Math.floor(Math.abs((i-t)/200*20));let a=0;clearInterval(this.timer),this.timer=setInterval(()=>{if(a&&this.wrapper.scrollLeft!==a)return clearInterval(this.timer);if(t>i){const i=this.wrapper.scrollLeft+e;i>t||i>=s?(clearInterval(this.timer),this.wrapper.scrollLeft=t):(this.wrapper.scrollLeft=i,a=i)}else{const s=this.wrapper.scrollLeft-e;s<t||s<=0?(clearInterval(this.timer),this.wrapper.scrollLeft=t):(this.wrapper.scrollLeft=s,a=s)}},20)}}},a=(i(291),i(3)),n=Object(a.a)(e,(function(){var t=this,s=t._self._c;return s("div",{staticClass:"swiper-container"},[s("div",{staticClass:"swiper-button"},[s("img",{staticClass:"swiper-img",class:t.prevCls,attrs:{src:"https://dpubstatic.udache.com/static/dpubimg/0cgzDC8Apn/anli_icon_left.png",width:"50",height:"50",alt:"left",loading:"lazy"},on:{click:t.handlePrev}})]),t._v(" "),s("div",{ref:"wrapper",staticClass:"swiper"},t._l(t.dataList,(function(i,e){return s("div",{key:e,ref:"list",refInFor:!0,staticClass:"swiper-list",on:{click:function(s){return t.handleClick(e)},transitionend:t.handleEnd}},[s("div",{staticClass:"swiper-item"},[s("div",[s("div",[s("img",{attrs:{width:"80",height:"80",src:i.img,alt:"二维码",loading:"lazy"}})]),t._v(" "),s("div",[t._v(t._s(i.title))])])])])})),0),t._v(" "),s("div",{staticClass:"swiper-button"},[s("img",{staticClass:"swiper-img",class:t.nextCls,attrs:{src:"https://dpubstatic.udache.com/static/dpubimg/QhD6ulEP7k/anli_icon_right.png",width:"50",height:"50",alt:"right",loading:"lazy"},on:{click:t.handleNext}})])])}),[],!1,null,"e740e78a",null).exports,r={props:{dataList:{type:Array,default:()=>[]},currentIndex:{type:Number,default:0}},data:()=>({translateX:0}),computed:{getStyle(){return{transform:`translate3d(${188*-this.currentIndex}px, 0, 0)`}}},watch:{currentIndex(t){}}},c=(i(292),Object(a.a)(r,(function(){var t=this._self._c;return t("div",{staticClass:"swiper-img"},[t("div",{staticClass:"swiper-img__list",style:this.getStyle},this._l(this.dataList,(function(s,i){return t("div",{key:i,staticClass:"swiper-img__wrap"},[t("img",{attrs:{width:"188",height:"410",src:s.demo,alt:"img",loading:"lazy"}})])})),0)])}),[],!1,null,"5bbe7bd5",null).exports),l={components:{Popover:i(248).a},props:{dataList:{type:Array,default:()=>[]}},data:()=>({current:-1}),methods:{handleEnter(t){this.current=t},handleLeave(){this.current=-1}}},o=(i(293),{data:()=>({currentIndex:0}),computed:{list(){let t=[],s=this.$page.frontmatter.sixSection.details,i=[],e=0;for(;e<s.length;)e%3==0&&(i=[],t.push(i)),i.push(s[e]),e++;return t},dataList(){return this.$page.frontmatter.sevenSection.details},mvcList(){return this.$page.frontmatter.threeSection.list},currentTitle(){return this.dataList[this.currentIndex].title}},components:{Swiper:n,SwiperImg:c,CodeList:Object(a.a)(l,(function(){var t=this._self._c;return t("div",{staticClass:"code-list"},this._l(this.dataList,(function(s,i){return t("div",{key:i,staticClass:"code-list__item"},[t("img",{attrs:{width:"150",height:"170",src:s.code,alt:"code",loading:"lazy"}})])})),0)}),[],!1,null,"1c9577d2",null).exports},methods:{handleChange(t){this.currentIndex=t}}}),d=(i(294),Object(a.a)(o,(function(){var t=this,s=t._self._c;return s("div",{staticStyle:{position:"relative",overflow:"hidden","min-width":"950px",background:"#f5f5f5"}},[s("div",{staticClass:"one-section__img1"}),t._v(" "),s("div",{staticClass:"one-section__img2"}),t._v(" "),s("section",{staticClass:"one-section"},[s("div",{staticClass:"one-section__inner one-section__content"},[s("div",{staticStyle:{display:"inline-block"}},[s("h2",{staticClass:"one-section__title"},[t._v(t._s(t.$page.frontmatter.heroText))]),t._v(" "),s("p",{staticClass:"one-section__desc"},[t._v("\n            "+t._s(t.$page.frontmatter.tagline)+"\n          ")]),t._v(" "),s("button",{staticClass:"one-section__btn one-section__enter"},[s("a",{staticClass:"white-link",attrs:{href:t.$page.frontmatter.actionLink}},[t._v("\n              "+t._s(t.$page.frontmatter.actionText)+"\n            ")])]),t._v(" "),s("button",{staticClass:"one-section__btn one-section__github"},[s("a",{staticClass:"blue-link",attrs:{href:t.$page.frontmatter.githubLink}},[t._v("\n              "+t._s(t.$page.frontmatter.githubText)+"\n            ")])])])]),t._v(" "),s("div",{staticClass:"one-section__inner"})]),t._v(" "),s("section",{staticClass:"two-section"},[s("ul",{staticClass:"row"},t._l(t.$page.frontmatter.features,(function(i,e){return s("li",{key:e,staticClass:"two-section__item"},[s("img",{attrs:{src:i.icon,alt:"svg",loading:"lazy",width:"80",height:"80"}}),t._v(" "),s("p",{staticClass:"two-section__title"},[t._v(t._s(i.title))]),t._v(" "),s("p",{staticClass:"two-section__desc"},[t._v(t._s(i.details))]),t._v(" "),s("div",{staticClass:"two-section__line"})])})),0)]),t._v(" "),s("section",{staticClass:"three-section",style:{backgroundImage:`url(${t.$page.frontmatter.threeSection.bg})`}},[s("div",{staticClass:"three-section__inner"},[t._m(0),t._v(" "),s("div",{staticClass:"three-section__mvc"},[s("div",[s("span",{staticClass:"dot-inner",staticStyle:{background:"#fff",margin:"0 auto"}}),t._v(" "),s("p",{staticClass:"white-text title"},[t._v(t._s(t.$page.frontmatter.threeSection.title))]),t._v(" "),t._m(1)]),t._v(" "),s("code-list",{attrs:{dataList:t.mvcList}})],1)])]),t._v(" "),s("section",{staticClass:"section four-section"},[s("div",{staticClass:"grow four-section__bg",style:{backgroundImage:`url(${t.$page.frontmatter.fourSection.bg})`}}),t._v(" "),s("div",{staticClass:"four-section__inner"},[s("div",{staticClass:"grow",staticStyle:{position:"relative"}},[s("img",{attrs:{width:"412",src:t.$page.frontmatter.fourSection.img,alt:"svg",loading:"lazy"}})]),t._v(" "),s("div",{staticClass:"four-section__text grow"},[s("div",{staticStyle:{"margin-left":"86px"}},[s("div",[s("span",{staticClass:"dot-inner"}),t._v(" "),s("p",{staticClass:"title"},[t._v(t._s(t.$page.frontmatter.fourSection.title))]),t._v(" "),s("p",{staticClass:"desc"},[t._v("\n                "+t._s(t.$page.frontmatter.fourSection.details)+"\n              ")])]),t._v(" "),s("button",{staticClass:"btn"},[s("a",{staticClass:"white-link",attrs:{href:t.$page.frontmatter.fourSection.actionLink}},[t._v("\n                "+t._s(t.$page.frontmatter.fourSection.actionText)+"\n              ")])])])])])]),t._v(" "),s("section",{staticClass:"section five-section"},[s("div",{staticClass:"grow five-section__bg",style:{backgroundImage:`url(${t.$page.frontmatter.fiveSection.bg})`}}),t._v(" "),s("div",{staticClass:"five-section__inner"},[s("div",{staticClass:"five-section__text grow"},[s("div",{staticStyle:{"margin-right":"86px"}},[s("div",[s("span",{staticClass:"dot-inner"}),t._v(" "),s("p",{staticClass:"title"},[t._v(t._s(t.$page.frontmatter.fiveSection.title))]),t._v(" "),s("p",{staticClass:"desc"},[t._v("\n                "+t._s(t.$page.frontmatter.fiveSection.details)+"\n              ")])]),t._v(" "),s("button",{staticClass:"btn"},[s("a",{staticClass:"white-link",attrs:{href:t.$page.frontmatter.fiveSection.actionLink}},[t._v("\n                "+t._s(t.$page.frontmatter.fiveSection.actionText)+"\n              ")])])])]),t._v(" "),s("div",{staticClass:"grow",staticStyle:{position:"relative",display:"flex","justify-content":"flex-end"}},[s("img",{attrs:{width:"412",src:t.$page.frontmatter.fiveSection.img,alt:"svg",loading:"lazy"}})])])]),t._v(" "),s("section",{staticClass:"six-section",style:{backgroundImage:`url(${t.$page.frontmatter.sixSection.bg})`}},[s("div",{staticClass:"six-section__inner"},[t._m(2),t._v(" "),s("p",{staticClass:"title six-section__title"},[t._v(t._s(t.$page.frontmatter.sixSection.title))]),t._v(" "),t._l(t.list,(function(i,e){return s("ul",{key:e,staticClass:"row six-section__row"},t._l(i,(function(i,e){return s("li",{key:e},[s("a",{staticClass:"six-section__item six-section__step",attrs:{href:i.actionLink}},[s("div",{staticClass:"six-section__icon"},[s("img",{attrs:{src:i.icon,alt:"svg",loading:"lazy",width:"50",height:"50"}})]),t._v(" "),s("div",{staticClass:"six-section__list"},[s("div",{staticClass:"six-section__bold"},[t._v(t._s(i.title))]),t._v(" "),s("div",[t._v(t._s(i.details))])])])])})),0)}))],2)]),t._v(" "),s("section",{staticClass:"seven-section"},[s("span",{staticClass:"dot-inner"}),t._v(" "),s("p",{staticClass:"title"},[t._v(t._s(t.$page.frontmatter.sevenSection.title))]),t._v(" "),s("div",{staticClass:"row seven-section__wrap"},[s("div",{staticClass:"grow"},[s("p",{staticClass:"seven-section__title"},[t._v("\n            "+t._s(t.currentTitle)+"\n          ")]),t._v(" "),s("p",{staticClass:"seven-section__desc"})]),t._v(" "),s("div",{staticClass:"grow seven-section__center",style:{backgroundImage:`url(${t.$page.frontmatter.sevenSection.bg})`}},[t._m(3),t._v(" "),s("div",{staticClass:"seven-section__inner"},[s("swiper-img",{attrs:{dataList:t.dataList,currentIndex:t.currentIndex}})],1)]),t._v(" "),s("div",{staticClass:"grow"})]),t._v(" "),s("swiper",{attrs:{dataList:t.dataList},on:{change:t.handleChange}})],1)])}),[function(){var t=this._self._c;return t("div",[t("div",{staticClass:"three-section__todo"},[t("div",{staticClass:"three-section__phone"},[t("img",{attrs:{width:"410",height:"712",src:"https://dpubstatic.udache.com/static/dpubimg/Vx5n_3YCtP/anli_pic_phone.png",alt:"phone",loading:"lazy"}})]),this._v(" "),t("div",{staticClass:"three-section__iframe"},[t("iframe",{attrs:{title:"todo示例",scrolling:"no",width:"325",height:"617",src:"https://dpubstatic.udache.com/static/dpubimg/c3b0d3bc-1bb0-4bee-b6da-4205a2744e21.html",frameborder:"0"}})])])])},function(){var t=this._self._c;return t("p",{staticClass:"white-text desc"},[this._v("\n              扫码体验Mpx版本的\n              "),t("a",{staticClass:"target-link",attrs:{href:"https://github.com/didi/mpx/tree/master/examples/mpx-todoMVC"}},[this._v("todoMVC")]),this._v("\n              在各个小程序平台和web中的一致表现 ，更多示例项目可点击\n              "),t("a",{staticClass:"target-link",attrs:{href:"https://github.com/didi/mpx/tree/master/examples"}},[this._v("这里")]),this._v("\n              进入查看。\n            ")])},function(){var t=this._self._c;return t("div",{staticStyle:{"text-align":"center"}},[t("span",{staticClass:"dot-inner",staticStyle:{background:"#fff",margin:"0 auto"}})])},function(){var t=this._self._c;return t("div",{staticClass:"seven-section_phone"},[t("img",{attrs:{width:"213",height:"433",src:"https://dpubstatic.udache.com/static/dpubimg/Vx5n_3YCtP/anli_pic_phone.png",alt:"phone",loading:"lazy"}})])}],!1,null,"d4a8affa",null));s.default=d.exports}}]);