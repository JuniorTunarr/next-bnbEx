export type UserType = {
  id: number;
  email: string;
  nickname: string;
  name: string;
  phone: number;
  birthday: string;
  gender: string;
  profileImage: string;
};

//* users.json에 저장된 유저 타입
export type StoredUserType = {
  id: number;
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  nickname: string;
  birthday: string;
  phone: string | number;
  gender: string;
  profileImage: string;
};
