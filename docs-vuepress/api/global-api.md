# 全局api

## createApp
> 注册一个小程序，接受一个 Object 类型的参数
- **用法：**
```js
createApp(options)
```

- **参数：**
    - `{Object} options`

        可指定小程序的生命周期回调，以及一些全局变量等


- **示例：**
```js
import mpx, {createApp} from '@mpxjs/core'

mpx.createApp({
  onLaunch () {
    console.log('Launch')
  },
  onShow () {
    console.log('Page show')
  },
  //全局变量 可通过getApp()访问
  globalDataA: 'I am global dataA',
  globalDataB: 'I am global dataB'
})

createApp(options)
```

## createPage
> 类微信小程序（微信、百度、头条等）内部使用[Component的方式创建页面](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html)，所以除了支持页面的生命周期之外还同时支持组件的一切特性。当使用 Component 创建页面时，页面生命周期需要写在 methods 内部（微信小程序原生规则），mpx 进行了统一封装转换，页面生命周期都写在最外层即可

- **用法：**
    ```js
    createPage(options, config?)
    ```
- **参数：**
    - `{Object} options`

         具体形式除了 computed、watch 这类 Mpx 扩展特性之外，其他的属性都参照原生小程序的官方文档即可。
    - `{Object} config`（可选参数）

         如果希望标识一个组件是最纯粹的原生组件，不用数据响应等能力，可通过 config.isNative 传 true 声明。
         如果有需要复写/改写最终调用的创建页面的构造器，可以通过 config 对象的 customCtor 提供。
         **注意:**
         mpx本身是用 component 来创建页面的，如果传page可能在初始化时候生命周期不正常导致取props有一点问题

- **示例：**
```js
import mpx, {createPage} from '@mpxjs/core'

mpx.createPage({
  data: {test: 1},
  computed: {
    test2 () {
      return this.test + 1
    }
  },
  watch: {
    test (val, old) {
      console.log(val, old)
    }
  },
  onShow () {
    this.test++
  }
})

createPage(object)
```
## createComponent
> 创建自定义组件，接受两个Object类型的参数。

- **用法：**
    ```js
    createComponent(options, config?)
    ```
- **参数：**
    - `{Object} options`

        具体形式除了 computed、watch 这类 Mpx 扩展特性之外，其他的属性都参照原生小程序的官方文档即可。
    - `{Object} config`（可选参数）

        如果希望标识一个组件是最纯粹的原生组件，不用数据响应等能力，可通过 config.isNative 传 true 声明。
        如果有需要复写/改写最终调用的创建组件的构造器，可以通过 config 对象的 customCtor 提供。


- **示例：**
```js
import mpx, {createComponent} from '@mpxjs/core'

mpx.createComponent({
  properties: {
    prop: {
      type: Number,
      value: 10
    }
  },
  data: {test: 1},
  computed: {
    test2 () {
      return this.test + this.prop
    }
  },
  watch: {
    test (val, old) {
      console.log(val, old)
    },
    prop: {
      handler (val, old) {
        console.log(val, old)
      },
      immediate: true // 是否首次执行一次
    }
  }
})

createComponent(object)
```

## createStore
> 创建一个全局状态管理容器，实现复杂场景下的组件通信需求
- **用法：**
    ```js
    createStore({ ...options })
    ```
- **参数：**
    - `{Object} options`

        options 可指定以下属性：
        - **state**

            类型：`Object`

            store的根 state 对象。

            [详细介绍](../guide/advance/store.html#state)

        - **mutations**

            类型：`{ [type: string]: Function }`

            在 store 上注册 mutation，处理函数总是接受 state 作为第一个参数（如果定义在模块中，则为模块的局部状态），payload 作为第二个参数（可选）。

            [详细介绍](../guide/advance/store.html#mutation)

        - **actions**

            类型：`{ [type: string]: Function }`

             在 store 上注册 action。处理函数总是接受 context 作为第一个参数，payload 作为第二个参数（可选）。

             context 对象包含以下属性：
             ```js
              {
                state,      // 等同于 `store.state`
                commit,     // 等同于 `store.commit`
                dispatch,   // 等同于 `store.dispatch`
                getters     // 等同于 `store.getters`
              }
             ```
             同时如果有第二个参数 payload 的话也能够接收。

             [详细介绍](../guide/advance/store.html#action)

        - **getters**

            类型：`{[key: string]: Function }`

            在 store 上注册 getter，getter 方法接受以下参数：
            ```js
            state,     // 如果在模块中定义则为模块的局部状态
            getters   // 等同于 store.getters
            ```
            注册的 getter 暴露为 store.getters。

            [详细介绍](../guide/advance/store.html#getter)

        - **modules**

            类型：`Object`

            包含了子模块的对象，会被合并到 store，大概长这样：
            ```js
            {
              key: {
                state,
                mutations,
                actions?,
                getters?,
                modules?
               },
               ...
            }
            ```

            与根模块的选项一样，每个模块也包含 state 和 mutations 选项。模块的状态使用 key 关联到 store 的根状态。模块的 mutation 和 getter 只会接收 module 的局部状态作为第一个参数，而不是根状态，并且模块 action 的 context.state 同样指向局部状态。

            [详细介绍](../guide/advance/store.html#modules)

        - **deps**

            类型：`Object`

            包含了当前store依赖的第三方store：
            ```js
            {
              store1: storeA,
              store2: storeB
            }
            ```
            [详细介绍](../guide/advance/store.html#modules)

- **示例：**

```js
import mpx, {createStore} from '@mpxjs/core'
const store1 = mpx.createStore({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  },
  ...
})
const store2 = createStore({ ...options })
```

- **Store 实例属性**
    - **state**

      - 类型：`Object`

        根状态。

    - **getters**

      - 类型：`Object`

        暴露出注册的 getter。

- **Store 实例方法**

    ```js
    commit(type: string, payload?: any, options?: Object) | commit(mutation: Object, options?: Object)
     ```

     提交 mutation。[详细介绍](../guide/advance/store.html#mutation)

    ```js
    dispatch(type: string, payload?: any, options?: Object) | dispatch(action: Object, options?: Object)
    ```

    分发 action。返回一个Promise。[详细介绍](../guide/advance/store.html#action)
    ```js
    mapState(map: Array<string> | Object): Object
    ```
    为组件创建计算属性以返回 store 中的状态。[详细介绍](../guide/advance/store.html#state)

    ```js
    mapGetters(map: Array<string> | Object): Object
    ```
    为组件创建计算属性以返回 getter 的返回值。[详细介绍](../guide/advance/store.html#getter)

    ```js
    mapActions(map: Array<string> | Object): Object
    ```
    创建组件方法分发 action。[详细介绍](../guide/advance/store.html#action)

    ```js
    mapMutations(map: Array<string> | Object): Object
    ```
    创建组件方法提交 mutation。[详细介绍](../guide/advance/store.html#mutation)


## createStoreWithThis

> createStoreWithThis 为 createStore 的变种方法，主要为了在 `Typescript` 环境中，可以更好地支持 store 中的类型推导。<br>
  其主要变化在于定义 getters， mutations 和 actions 时，
  自身的 state，getters 等属性不再通过参数传入，而是会挂载到函数的执行上下文 this 当中，通过 this.state 或 this.getters 的方式进行访问。
  由于TS的能力限制，getters/mutations/actions 只有使用对象字面量的方式直接传入 createStoreWithThis 时
  才能正确推导出 this 的类型，当需要将 getters/mutations/actions 拆解为对象编写时，需要用户显式地声明 this 类型，无法直接推导得出。
- **用法：**
```js
createStoreWithThis(store)
```

- **参数：**
    - `{Object} store`

        接收一个 store 对象。

- **示例：**
```js

import {createComponent, getMixin, createStoreWithThis} from '@mpxjs/core

const store = createStoreWithThis({
  state: {
    aa: 1,
    bb: 2
  },
  getters: {
    cc() {
      return this.state.aa + this.state.bb
    }
  },
  actions: {
    doSth3() {
      console.log(this.getters.cc)
      return false
    }
  }
})

createComponent({
  data: {
    a: 1,
    b: '2'
  },
  computed: {
    c() {
      return this.b
    },
    d() {
      // data, mixin, computed中定义的数据能够被推导到this中
      return this.a + this.aaa + this.c
    },
    // 从store上map过来的计算属性或者方法同样能够被推导到this中
    ...store.mapState(['aa'])
  },
  mixins: [
    // 使用mixins，需要对每一个mixin子项进行getMixin辅助函数包裹，支持嵌套mixin
    getMixin({
      computed: {
        aaa() {
          return 123
        }
      },
      methods: {
        doSth() {
          console.log(this.aaa)
          return false
        }
      }
    })
  ],
  methods: {
    doSth2() {
      this.a++
      console.log(this.d)
      console.log(this.aa)
      this.doSth3()
    },
    ...store.mapActions(['doSth3'])
  }
})
```

## createStateWithThis

> createStateWithThis 为创建 state 提供了类型推导，对于基本类型可以由 TypeScript 自行推导，使用其他类型时，推荐使用 as 进行约束

- **用法：**
    ```js
    createStateWithThis(state)
    ```
- **参数：**
    - `{Object} state`

        需要定义的 state 对象键值对。

- **示例：**

    ```js
    import { createStateWithThis } from '@mpxjs/core'

    export type StatusType = 'start' | 'running' | 'stop'

    export default createStateWithThis({
      status: 'running' as StatusType
    })
    ```

## createGettersWithThis

- **用法：**
    ```js
    createGettersWithThis(getters, options?)
    ```
- **参数：**
    - `{Object} getters`

        需要定义的 getters 对象。
    - `{Object} options`（可选参数）

        在 options 中可以传入 state，getters，deps。由于 getter 的类型推论需要基于 state，所以导出 getters 时，需要将 state 进行传入。deps 是作为一个扩展存在，getters 可以通过 deps 中传入的其他 store 来获取值，当 store 没有其他需要依赖的 deps 时可以不传。createMutationsWithThis 和 createActionsWithThis 同理。

- **示例：**
    ```js
    import { createGettersWithThis, createStoreWithThis } from '@mpxjs/core'

    export default createGettersWithThis({
      isStart () {
        return this.state.status === 'start'
      },
      getNum () {
        return this.state.base.test + this.getters.base.getTest
      }
    }, {
      state,
      deps: {
        base: createStoreWithThis({
          state: {
            testNum: 0
          },
          getters: {
            getTest () {
              return this.state.testNum * 2
            }
          }
        })
    }})
    ```

## createMutationsWithThis

- **用法：**
    ```js
    createMutationsWithThis(mutations, options?)
    ```
- **参数：**
    - `{Object} mutations`

        需要定义的 mutations 对象。
    - `{Object} options`（可选参数）

        在 options 中可以传入 state，deps。

- **示例：**

    ```js
    import { createMutationsWithThis } from '@mpxjs/core'

    export default createMutationsWithThis({
      setCurrentStatus (payload: StatusType) {
        this.state.status = payload
      }
    }, { state })
    ```


## createActionsWithThis

- **用法：**
    ```js
    createActionsWithThis(actions, options?)
    ```
- **参数：**
    - `{Object} actions`

        需要定义的 actions 对象。
    - `{Object} options`（可选参数）

        由于action 可以同时调用 getters、mutations，所以需要将这些都传入，以便进行类型推导。因此 options 可以传入 state、getters、mutations、deps。

- **示例：**

    ```js
    import { createActionsWithThis } from '@mpxjs/core'
    import state, { StatusType } from './state'
    import getters from './getters'
    import mutations from './mutations'

    export default createActionsWithThis({
      testActions (payload: StatusType) {
        return Promise.resolve(() => {
          this.commit('setCurrentStatus', payload)
        })
      }
    }, {
      state,
      getters,
      mutations
    })
    ```

## mixin
全局注入mixin方法接收两个参数：mpx.mixin(mixins, options)
- 第一个参数是要混入的mixins，接收类型 `MixinObject|MixinObject[]`
- 第二个参数是为全局混入配置，形如`{types:string|string[], stage:number}`，其中`types`用于控制mixin注入的范围，可选值有`'app'|'page'|'component'`；`stage`用于控制注入mixin的插入顺序，当stage为负数时，注入的mixin会被插入到构造函数配置中的`options.mixins`之前，数值越小约靠前，反之当stage为正数时，注入的mixin会被插入到`options.mixins`之后，数值越大越靠后。

> 所有mixin中生命周期的执行均先于构造函数配置中直接声明的生命周期，mixin之间的执行顺序则遵从于其在`options.mixins`数组中的顺序

> options的默认值为`{types: ['app','page','component'], stage: -1}`，不传stage时，全局注入mixin的声明周期默认在`options.mixins`之前执行

**使用**
```js
import mpx from '@mpxjs/core'
// 只在page中混入
mpx.mixin({
  methods: {
    getData: function(){}
  }
}, {
  types:'page'
})

// 默认混入，在app|page|component中都会混入
mpx.mixin([
  {
    methods: {
      getData: function(){}
    }
  },
  {
    methods: {
      setData: function(){}
    }
  }
])

// 只在component中混入，且执行顺序在options.mixins之后
mpx.mixin({
  attached() {
    console.log('com attached')
  }
}, {
  types: 'component',
  stage: 100
})
```
## injectMixins
该方法是 `mpx.mixin` 方法的别名，`mpx.injectMixins({})` 等同于 `mpx.mixin({})`

## toPureObject

- **参数**：
  - `{Object} options`

- **用法**:

由于使用的 mobx 的响应式数据，所以业务拿到的数据可能是 mobx 响应式数据实例（包含了些其他属性），使用`toPureObject`方法可以将响应式的数据转化成纯 js 对象。

```js
import mpx, {toPureObject} from '@mpxjs/core'
// mpx.toPureObject(...)
const pureObject = toPureObject(object)
```

## observable

- **参数**：
  - `{Object} options`

- **用法**:

用于创建响应式数据，属于 mobx 提供的能力。

```js
import mpx, {observable} from '@mpxjs/core'
// mpx.observable(...)
const a = observable(object)
```

## watch

- **参数**：
  - `{Function} expr`
  - `{Function | Object} callback`
  - `{Object} [options]`
    - `{boolean} deep`
    - `{boolean | Function} once`
    - `{boolean} immediate`

- **返回值**：`{Function} unwatch`

- **用法**:

  观察一个函数计算结果的变化。回调函数得到的参数分别为新值和旧值。参数详细说明：
  1. `expr`：是函数类型，返回一个你需要观察的表达式，表达式的运算量需要是响应式数据。
  2. `callback`：响应函数，如果是对象，则 callback.handler 为回调函数，其他参数作为 options。

  返回值详细说明：

  `unwatch`：返回一个函数，用来取消观察，停止触发回调。

- **示例**：

```js
import {watch} from '@mpxjs/core'

let unwatch = watch(() => {
  return this.a + this.b
}, (newVal, oldVal) => {
  // 做点什么
})

// 调用返回值unwatch可以取消观察
unwatch()
```

- **选项**：deep

  为了发现对象内部值的变化，可以在选项参数中指定 deep: true。

  ``` javascript
  import {watch} from '@mpxjs/core'

  watch(() => {
    return this.someObject
  }, () => {
    // 回调函数
  }), {
    deep: true
  })
  this.someObject.nestedValue = 123
  // callback is fired
  ```
- **选项**：once

  在选项参数中指定 `once: true` 该回调方法只会执行一次，后续的改变将不会触发回调；  
  该参数也可以是函数，若函数返回值为 `true` 时，则后续的改变将不会触发回调

  ```JavaScript
  import {watch} from '@mpxjs/core'
  
  watch(() => {
    return this.a
  }, () => {
    // 该回调函数只会执行一次
  }, {
    once: true
  })
  
  // 当 once 是函数时
  watch(() => {
    return this.a
   }, (val, newVal) => {
    // 当 val 等于2时，this.a 的后续改变将不会被监听
   }, {
    once: (val, oldVal) => {
      if (val == 2) {
        return true
      }
    }
  })
  ```

- **选项**：immediate

  在选项参数中指定 `immediate: true` 将立即以表达式的当前值触发回调。

  ``` javascript
  import {watch} from '@mpxjs/core'

  watch(() => {
    return this.a
  }, () => {
    // 回调函数
  }), {
    immediate: true
  })
  // 立即以 `this.a` 的当前值触发回调
  ```
  注意在带有 immediate 选项时，你不能在第一次回调时取消侦听。
  ``` javascript
  import {watch} from '@mpxjs/core'

  var unwatch = watch(() => {
    return this.a
  }, () => {
    unwatch() // 这会导致报错！
  }), {
    immediate: true
  })

  ```
  如果你仍然希望在回调内部调用取消侦听的函数，你应该先检查其可用性。
  ``` javascript
  import {watch} from '@mpxjs/core'

  var unwatch = watch(() => {
    return this.a
  }, () => {
    if (unwatch) { // 请先检查其可用性！
      unwatch()
    }
  }), {
    immediate: true
  })

- **参考**：另外 Mpx 还提供了实例方法 $watch，详见：[$watch](instance-api.html#watch)

## use
>用于安装外部扩展, 支持多参数
方法接收两个参数：mpx.use(plugin, options)
- 第一个参数是要安装的外部扩展
- 第二个参数是对象，如果第二个参数是一个包含（prefix or postfix）的option， 那么将会对插件扩展的属性添加前缀或后缀

**示例：**
```js
import mpx from '@mpxjs/core'
import test from './test'
mpx.use(test)
mpx.use(test, {prefix: 'mpx'}, 'otherparams')
```

## set
用于对一个响应式对象新增属性，会`触发订阅者更新操作`
- **参数**：
  - `{Object | Array} target`
  - `{string | number} propertyName/index`
  - `{any} value`

- **示例：**
```js
mport mpx, {observable} from '@mpxjs/core'
const person = observable({name: 1})
mpx.set(person, 'age', 17) // age 改变后会触发订阅者视图更新
```

## delete
用于对一个响应式对象删除属性，会`触发订阅者更新操作`
- **参数**：
  - `{Object | Array} target`
  - `{string | number} propertyName/index`
- **示例：**
```js
mport mpx, {observable} from '@mpxjs/core'
const person = observable({name: 1})
mpx.delete(person, 'age')
```

## getMixin
专为ts项目提供的反向推导辅助方法，该函数接收类型为 `Object` ,会将传入的嵌套mixins对象拉平成一个扁平的mixin对象

**使用**
```js
import mpx, { createComponent } from '@mpxjs/core'
// 使用mixins，需要对每一个mixin子项进行getMixin辅助函数包裹，支持嵌套mixin
const mixin = mpx.getMixin({
  mixins: [mpx.getMixin({
    data: {
      value1: 2
    },
    lifetimes: {
      attached () {
        console.log(this.value1, 'attached')
      }
    },
    mixins: [mpx.getMixin({
      data: {
        value2: 6
      },
      created () {
        console.log(this.value1 + this.value2 + this.outsideVal)
      }
    })]
  })]
})
/*
mixin值
{
  data: {value2: 6, value1: 2},
  created: ƒ created(),
  attached: ƒ attached()
}
*/
createComponent({
  data: {
    outsideVal: 20
  },
  mixins: [mixin]
})

/*
以上执行输出：
28
2 "attached"
*/
```

## implement

- **参数**：
  - `{String} name`
  - `{Object} options`
    - `{Array} modes`：需要取消的平台
    - `{Boolean} remove`：是否将此能力直接移除
    - `{Function} processor`：设置成功的回调函数


- **用法**:

以微信为 base 将代码转换输出到其他平台时（如支付宝、web 平台等），会存在一些无法进行模拟的跨平台差异，会在运行时进行检测并报错指出，例如微信转支付宝时使用 moved 生命周期等。使用`implement`方法可以取消这种报错。您可以使用 mixin 自行实现跨平台差异，然后使用 implement 取消报错。

```js
import mpx from '@mpxjs/core'

if (__mpx_mode__ === 'web') {
  const processor = () => {
  }
  mpx.implement('onShareAppMessage', {
    modes: ['web'], // 需要取消的平台，可配置多个
    remove: true, // 是否将此能力直接移除
    processor // 设置成功的回调函数
  })
}
```
## config
 Mpx 通过 config 暴露出 webRouteConfig 配置项，在 web 环境可以对路由进行配置

- **用法**:
```js
mpx.config.webRouteConfig = {
  mode: 'history'
}
```
