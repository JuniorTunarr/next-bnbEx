import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "../types/user";
import { UserState } from "../types/reduxState";

//* 초기 상태
const initialState: UserState = {
  id: 0,
  email: "",
  name: "",
  phone: 0,
  nickname: "",
  gender: "",
  birthday: "",
  isLogged: false,
  profileImage: "",
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    //* 로그인 한 유저 변경하기
    setLoggedUser(state, action: PayloadAction<UserType>) {
      Object.assign(state, action.payload);
      state.isLogged = true;
    },
    //* 로그인 상태 변경하기
    setLoggedInStatus(state, action: PayloadAction<boolean>) {
      state.isLogged = action.payload;
    },
    //* 유저 초기화 하기
    initUser(state) {
      state = initialState;
      return state;
    },
  },
});

export const userActions = { ...user.actions };

export default user;
