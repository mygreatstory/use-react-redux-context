import React, { useContext } from "react";
import ReactDOM from "react-dom";
import { Provider as ReactReduxProvider } from "react-redux";
import { combineReducers, createStore, Reducer } from "redux";
import {
  Provider as ContextProvider,
  Scope,
  useBindAction,
  useBindActions
} from "../index";

type Foo = {
  value: number;
};

type Bar = {
  mes: string;
};

export type RootState = {
  foo: Foo;
  bar: Bar;
};

const initialFoo: Foo = { value: 0 };

type IncrementAction = { type: "increment" };
type DecrementAction = { type: "decrement" };

type FooAction = IncrementAction | DecrementAction;
function foo(state: Foo = initialFoo, action: FooAction): Foo {
  console.log("update foo", state);
  switch (action.type) {
    case "increment": {
      return { value: state.value + 1 };
    }
    case "decrement": {
      return { value: state.value - 1 };
    }
    default: {
      return state;
    }
  }
}

function increment(): IncrementAction {
  return { type: "increment" };
}

function decrement(): DecrementAction {
  return { type: "decrement" };
}

const initialBar: Bar = { mes: "hello" };
function bar(state: Bar = initialBar, action: any): Bar {
  console.log("update bar", state);
  switch (action.type) {
    default: {
      return state;
    }
  }
}

const scope = new Scope<RootState>();

const FooContext = scope.createContext(state => {
  return state.foo;
});

const BarContext = scope.createContext((state, dispatch) => {
  const inc = useBindAction(increment, []);
  return { ...state.bar, inc };
});

const BazContext = scope.createContext(_state => {
  const actions = useBindActions({ increment, decrement });
  // alternative: with memoized keys map
  // const actions = useBindActions({ increment, decrement }, { increment: [state.value] });
  return { ...actions };
});

function Foo() {
  console.log("render foo");
  const foo = useContext(FooContext);
  return <div>value: {foo.value}</div>;
}

function Bar() {
  console.log("render bar");
  const bar = useContext(BarContext);
  return (
    <div>
      mes: {bar.mes}
      <button onClick={() => bar.inc()}>incerment:foo</button>
    </div>
  );
}

function Baz() {
  console.log("render baz");
  const baz = useContext(BazContext);
  return (
    <>
      <button onClick={baz.increment}>incerment from baz</button>
      <button onClick={baz.decrement}>decrement from baz</button>
    </>
  );
}

const rootReducer: Reducer<RootState> = combineReducers({ foo, bar });
const store = createStore(rootReducer);

function App() {
  return (
    <ReactReduxProvider store={store}>
      <ContextProvider scope={scope}>
        <Foo />
        <Bar />
        <Baz />
      </ContextProvider>
    </ReactReduxProvider>
  );
}

ReactDOM.render(<App />, document.querySelector(".root") as HTMLDivElement);
