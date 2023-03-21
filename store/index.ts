/* eslint-disable no-else-return */
/* eslint-disable no-undef */
import { HYDRATE, createWrapper, MakeStore } from "next-redux-wrapper";
import {
  configureStore,
  combineReducers,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux";
import user from "./user";
import common from "./common";
import auth from "./auth";
import registerRoom from "./registerRoom";
import searchRoom from "./searchRoom";
import room from "./room";

const rootReducer = combineReducers({
  common: common.reducer,
  user: user.reducer,
  auth: auth.reducer,
  registerRoom: registerRoom.reducer,
  searchRoom: searchRoom.reducer,
  room: room.reducer,
});

//* 스토어의 타입
export type RootState = ReturnType<typeof rootReducer>;

const reducer = (state: RootState | undefined, action: any) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  } else {
    return rootReducer(state, action);
  }
};

//* 타입 지원되는 커스텀 useSelector 만들기
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

const initStore: MakeStore = () => {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools: true,
  });
};

export const wrapper = createWrapper(initStore);
