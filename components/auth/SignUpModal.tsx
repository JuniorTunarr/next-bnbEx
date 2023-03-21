/* eslint-disable react/jsx-indent */
/* eslint-disable function-paren-newline */
/* eslint-disable quotes */
/* eslint-disable keyword-spacing */
/* eslint-disable space-before-blocks */
/* eslint-disable @typescript-eslint/quotes */
// |Great! How can I assist you today?
// |
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable react/jsx-closing-bracket-location */

import React, {
  ChangeEvent,
  ForwardRefRenderFunction,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import * as Yup from "yup";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "@firebase/auth";
import { useForm } from "react-hook-form";
import WarningIcon from "../../public/static/svg/common/warning.svg";
import CloseXIcon from "../../public/static/svg/modal/modal_colose_x_icon.svg";
import MailIcon from "../../public/static/svg/auth/mail.svg";
import PersonIcon from "../../public/static/svg/auth/person.svg";
import OpenedEyeIcon from "../../public/static/svg/auth/opened_eye.svg";
import ClosedEyeIcon from "../../public/static/svg/auth/closed_eye.svg";
import Input from "../common/Input";
import Selector from "../common/Selector";
import { dayList, genderList, monthList, yearList } from "../../lib/staticData";
import palette from "../../styles/palette";
import Button from "../common/Button";
import { signupAPI } from "../../lib/api/auth";
import { userActions } from "../../store/user";
import useValidateMode from "../../hooks/useValidateMode";
import PasswordWarning from "./PasswordWarning";
import { authActions } from "../../store/auth";
import { db, fbAuth } from "../../firebase";
import axios from "../../lib/api";

const Container = styled.form`
  width: 532px;
  padding: 45px;
  background-color: white;
  z-index: 11;
  .message {
      font-weight: 500;
      font-size: 1rem;
      line-height: 24px;
      letter-spacing: -1px;
      &.success {
        color: #008A05;
      }
      &.error {
        color: #c13515;
        vertical-align: bottom;
      }
    }
  .mordal-close-x-icon {
    cursor: pointer;
    display: block;
    margin: 0 0 15px auto;
  }

  .input-wrapper {
    position: relative;
    margin-bottom: 10px;
    input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
  }
  .sign-up-password-input-wrapper {
    svg {
      cursor: pointer;
    }
  }

  .sign-up-birthdat-label {
    font-size: 16px;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  .sign-up-modal-birthday-info {
    margin-bottom: 10px;
    color: ${palette.charcoal};
  }
  .sign-up-modal-birthday-selectors {
    display: flex;
    margin-bottom: 24px;
    .sign-up-modal-birthday-month-selector {
      margin-right: 16px;
      flex-grow: 1;
    }
    .sign-up-gender-selector {
      flex: 1;
    }
    .sign-up-modal-birthday-day-selector {
      margin-right: 16px;
      width: 25%;
    }
    .sign-up-modal-birthday-year-selector {
      width: 33.3333%;
    }
  }
  .sign-up-modal-submit-button-wrapper {
    margin-bottom: 10px;
    margin-top: 10px;
    padding-bottom: 10px;
    flex: 1;
    display: flex;
    border-bottom: 1px solid ${palette.gray_eb};
    .sign-up-previous-next-button {
      flex:1,
      display:block,
      margin: 10px 20px !important;
    }
  }
  .sign-up-modal-set-login {
    color: ${palette.dark_cyan};
    margin-left: 8px;
    cursor: pointer;
  }
`;

interface IProps {
  closeModal: () => void;
}

//*비밀번호 최수 자리수
const PASSWORD_MIN_LENGTH = 8;
//* 선택할 수 없는 월 option
const disabledMoths = ["월"];
//* 선택할 수 없는 일 option
const disabledDays = ["일"];
//* 선택할 수 없는 년 option
const disabledYears = ["년"];
const disabledGender = ["성별"];

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
// eslint-disable-next-line no-undef
const signUpSchema = Yup.object().shape({
  email: Yup.string()
    .email("@를 포함하여 이메일 형식으로 작성해주세요.")
    .required("이메일을 입력해주세요.")
    .test("uniqueEmail", "이미 등록된 이메일입니다.", async (value) => {
      const q = query(collection(db, "user"), where("email", "==", value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    }),
  name: Yup.string().required("이름을 입력해주세요."),
  nickname: Yup.string()
    .required("Please enter your nickname.")
    .min(2, "닉네임은 최소 2글자로 작성해주세요.")
    .max(6, "닉네임은 최대 6글자로 작성해주세요.")
    .test("uniqueNickname", "이미 사용중인 닉네임입니다.", async (value) => {
      const q = query(collection(db, "user"), where("nickname", "==", value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    }),
  phone: Yup.string().required("Please enter your phone number."),
  password: Yup.string()
    .matches(
      passwordRegex,
      "비밀번호는 영문+숫자를 포함한 8-16자리로 입력해주세요"
    )
    .required("비밀번호를 입력해주세요."),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "비밀번호가 일치하지 않습니다.")
    .required("비밀번호를 다시 입력해주세요."),
});

const SignUpModal: ForwardRefRenderFunction<HTMLInputElement, IProps> = (
  { closeModal },
  ref
) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const [birthYear, setBirthYear] = useState<string | undefined>();
  const [birthDay, setBirthDay] = useState<string | undefined>();
  const [birthMonth, setBirthMonth] = useState<string | undefined>();
  const [gender, setGender] = useState<string | undefined>();

  const [newAccount, setNewAccount] = useState(true);

  const [currentId, setCurrentId] = useState(1);
  const [isValidationReady, setIsValidationReady] = useState(false);

  //오류메시지 상태저장
  const [nameMessage, setNameMessage] = useState<string>("");
  const [emailMessage, setEmailMessage] = useState<string>("");
  const [passwordMessage, setPasswordMessage] = useState<string>("");
  const [passwordConfirmMessage, setPasswordConfirmMessage] =
    useState<string>("");
  const [nicknameMessage, setNicknameMessage] = useState<string>("");
  const [phoneMessage, setPhoneMessage] = useState<string>("");

  // 유효성 검사
  const [isName, setIsName] = useState<boolean>(false);
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const [isPassword, setIsPassword] = useState<boolean>(false);
  const [isPasswordConfirm, setIsPasswordConfirm] = useState<boolean>(false);
  const [isNickname, setIsNickname] = useState<boolean>(false);
  const [isPhone, setIsPhone] = useState<boolean>(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange", resolver: yupResolver(signUpSchema) });
  const dispatch = useDispatch();

  const { setValidateMode } = useValidateMode();
  //*비밀번호 숨김 토글하기
  const toggleHidePassword = useCallback(() => {
    setHidePassword(!hidePassword);
  }, [hidePassword]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //* id가 이메일 형식인지
  const isIdEmailForm = useMemo(() => {
    return (email: string) => emailRegex.test(email);
  }, []);

  //* 이메일 주소 변경시
  const onChangeEmail = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const emailValue = event.target.value;
      const emailRegex =
        /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
      setEmail(emailValue);

      if (!emailRegex.test(emailValue)) {
        setEmailMessage("이메일 형식이 아닙니다. 다시 확인해주세요.");
        setIsEmail(false);
        setIsValidationReady(false);
      } else {
        setEmailMessage("사용가능한 이메일입니다.");
        setIsEmail(true);
        setIsValidationReady(true);
      }
      // Check if email is already registered
      const q = query(collection(db, "user"), where("email", "==", emailValue));
      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            setEmailMessage("이미 등록된 이메일입니다.");
            setIsEmail(false);
            setIsValidationReady(false);
          }
          return querySnapshot;
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    },
    []
  );
  //* 비밀번호 변경시
  const onChangePassword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const passwordValue = event.target.value;
      const passwordRegex =
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
      setPassword(passwordValue);
      if (!passwordRegex.test(passwordValue)) {
        setPasswordMessage(
          "영문+숫자+특수문자 조합으로 8자리 이상으로 입력해주세요."
        );
        setIsPassword(false);
        setIsValidationReady(false);
      } else {
        setPasswordMessage("사용가능한 비밀번호입니다.");
        setIsPassword(true);
        setIsValidationReady(true);
      }
    },
    []
  );
  //* 비밀번호확인 변경시
  const onChangePasswordConfirm = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const passwordConfirmValue = event.target.value;
      setPasswordConfirm(passwordConfirmValue);

      if (password === passwordConfirmValue) {
        setPasswordConfirmMessage("비밀번호와 일치합니다.");
        setIsPasswordConfirm(true);
        setIsValidationReady(true);
      } else {
        setPasswordConfirmMessage(
          "비밀번호와 일치하지 않습니다. 다시 확인해주세요."
        );
        setIsPasswordConfirm(false);
        setIsValidationReady(false);
      }
    },
    [password]
  );

  //* 이름 변경시
  const onChangeName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
      if (event.target.value.length < 2 || event.target.value.length > 6) {
        setNameMessage("2글자 이상 6글자 미만으로 입력해주세요.");
        setIsName(false);
        setIsValidationReady(false);
      } else {
        setNameMessage("");
        setIsName(true);
        setIsValidationReady(true);
      }
    },
    []
  );
  //* 닉네임 변경시
  const onChangeNickname = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(event.target.value);
      if (event.target.value.length < 2 || event.target.value.length > 6) {
        setNicknameMessage("2글자 이상 6글자 미만으로 입력해주세요.");
        setIsNickname(false);
        setIsValidationReady(false);
      } else {
        setNicknameMessage("");
        setIsNickname(true);
        setIsValidationReady(true);
      }
    },
    []
  );
  //* 휴대폰 변경시
  const onChangePhone = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const phoneValue = event.target.value;
      setPhone(phoneValue);
      const phoneRegex = /^01([0|1|6|7|8|9])([0-9]{4})([0-9]{4})$/;

      if (!phoneRegex.test(phoneValue)) {
        setPhoneMessage("전화번호를 다시 확인해주세요.");
        setIsPhone(false);
        setIsValidationReady(false);
      } else {
        setPhoneMessage("사용가능한 번호입니다.");
        setIsPhone(true);
        setIsValidationReady(true);
      }
    },
    []
  );

  //* 생년월일 월 변경시
  const onChangeBirthMonth = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setBirthMonth(event.target.value);
    },
    []
  );

  //* 생년월일 일 변경시
  const onChangeBirthDay = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setBirthDay(event.target.value);
    },
    []
  );

  //* 생년월일 년 변경시
  const onChangeBirthYear = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setBirthYear(event.target.value);
    },
    []
  );

  //* 성별 변경시
  const onChangeGender = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setGender(event.target.value);
    },
    []
  );

  //* 회원가입 폼 입력 값 확인하기
  const validateSignUpForm = () => {
    //* 인풋 값이 없다면
    if (!email || !name || !nickname || !password || !passwordConfirm) {
      return false;
    }
    //* 생년월일 셀렉터 값이 없다면
    if (!birthDay || !birthMonth || !birthYear || !gender) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    setValidateMode(true);
    return () => {
      setValidateMode(false);
    };
  }, []);

  //* 로그인 모달로 변경하기
  const changeToLoginModal = useCallback(() => {
    dispatch(authActions.setAuthMode("login"));
  }, []);

  const handleNextClick = () => {
    setCurrentId(currentId + 1);
    setIsValidationReady(false);
  };

  const handlePrevClick = () => {
    setCurrentId(currentId - 1);
    setIsValidationReady(true);
  };

  //* 회원가입 폼 제출하기
  const onSubmitSignUp = async (data: any) => {
    if (validateSignUpForm()) {
      let userData;
      try {
        const signUpBody = {
          email,
          name,
          nickname,
          phone: String(phone),
          password,
          passwordConfirm,
          birthday: `${birthYear!.replace("년", "")}-${birthMonth!.replace(
            "월",
            ""
          )}-${birthDay!.replace("일", "")}`,
          gender,
        };
        if (newAccount) {
          // create account
          userData = await createUserWithEmailAndPassword(
            fbAuth,
            email,
            password
          );
          alert("회원 가입이 완료되었습니다.");
        } else {
          userData = await signInWithEmailAndPassword(fbAuth, email, password);
          alert("이미 가입된 계정이 있습니다.");
        }
        // const userResponse = await axios.post("/api/auth/signup", signUpBody);
        // const user = userResponse.data;
        // dispatch(userActions.setLoggedUser(user));
        const { data } = await signupAPI(signUpBody);
        dispatch(userActions.setLoggedUser(data));
        closeModal();
      } catch (e) {
        console.log(e);
      }
    }
  };

  // submit 활성화
  useEffect(() => {
    if (!!birthDay && !!birthMonth && !!birthYear && !!gender) {
      setIsValidationReady(true);
    } else {
      setIsValidationReady(false);
    }
  }, [birthDay, birthMonth, birthYear, gender]);

  return (
    <Container onSubmit={handleSubmit(onSubmitSignUp)}>
      <CloseXIcon className="mordal-close-x-icon" onClick={closeModal} />
      <div
        style={{
          display: "flex",
          fontSize: "24px",
          textAlign: "center",
          justifyContent: "center",
          margin: "10px",
        }}>
        이메일로 회원가입
      </div>
      <div
        className="input-wrapper"
        id="1"
        style={{ display: currentId === 1 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">이메일</p>
        <Input
          placeholder="@를 포함하여 입력해주세요."
          type="email"
          icon={<MailIcon />}
          isValid={!!email && isIdEmailForm(email)}
          value={email}
          onChange={onChangeEmail}
          useValidation
        />
        {email.length > 0 && (
          <div>
            {!isEmail ? <WarningIcon /> : ""}
            <span className={`message ${isEmail ? "success" : "error"}`}>
              {emailMessage}
            </span>
          </div>
        )}
      </div>
      <div id="2" style={{ display: currentId === 2 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">비밀번호</p>
        <div className="input-wrapper sign-up-password-input-wrapper">
          <Input
            placeholder="비밀번호: 영문+숫자+특수문자 포함 8자리 이상"
            type={hidePassword ? "password" : "text"}
            icon={
              hidePassword ? (
                <ClosedEyeIcon onClick={toggleHidePassword} />
              ) : (
                <OpenedEyeIcon onClick={toggleHidePassword} />
              )
            }
            value={password}
            onChange={onChangePassword}
            useValidation
            isValid={!!password && isPassword}
          />
        </div>
        {password.length > 0 && (
          <div>
            {!isPassword ? <WarningIcon /> : ""}
            <span className={`message ${isPassword ? "success" : "error"}`}>
              {passwordMessage}
            </span>
          </div>
        )}
        <div
          className="input-wrapper sign-up-password-input-wrapper"
          style={{ marginTop: "10px" }}>
          <p className="sign-up-birthdat-label">비밀번호 확인</p>
          <Input
            placeholder="비밀번호와 일치하는지 확인합니다."
            type={hidePassword ? "password" : "text"}
            icon={
              hidePassword ? (
                <ClosedEyeIcon onClick={toggleHidePassword} />
              ) : (
                <OpenedEyeIcon onClick={toggleHidePassword} />
              )
            }
            value={passwordConfirm}
            onChange={onChangePasswordConfirm}
            useValidation
            isValid={!!passwordConfirm && isPasswordConfirm}
          />
        </div>
        {passwordConfirm.length > 0 && (
          <div>
            {!isPasswordConfirm ? <WarningIcon /> : ""}
            <span
              className={`message ${isPasswordConfirm ? "success" : "error"}`}>
              {passwordConfirmMessage}
            </span>
          </div>
        )}
      </div>

      <div
        className="input-wrapper"
        id="3"
        style={{ display: currentId === 3 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">이름</p>
        <Input
          placeholder="2~5자리로 입력해주세요."
          icon={<PersonIcon />}
          value={name}
          onChange={onChangeName}
          useValidation
          isValid={!!name && isName}
        />
      </div>
      {name.length > 0 && (
        <div>
          {!isName ? <WarningIcon /> : ""}
          <span className={`message ${isName ? "success" : "error"}`}>
            {nameMessage}
          </span>
        </div>
      )}
      <div
        className="input-wrapper"
        id="4"
        style={{ display: currentId === 4 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">닉네임</p>
        <Input
          placeholder="2~6자리로 입력해주세요."
          icon={<PersonIcon />}
          value={nickname}
          onChange={onChangeNickname}
          useValidation
          isValid={!!nickname && isNickname}
        />
        {nickname.length > 0 && (
          <div>
            {!isNickname ? <WarningIcon /> : ""}
            <span className={`message ${isNickname ? "success" : "error"}`}>
              {nicknameMessage}
            </span>
          </div>
        )}
      </div>

      <div
        className="input-wrapper"
        id="5"
        style={{ display: currentId === 5 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">전화번호</p>
        <Input
          placeholder="-를 제외하고 입력해주세요."
          icon={<PersonIcon />}
          value={phone}
          type="number"
          onChange={onChangePhone}
          useValidation
          isValid={!!phone && isPhone}
        />
        {phone.length > 0 && (
          <div>
            {!isPhone ? <WarningIcon /> : ""}
            <span className={`message ${isPhone ? "success" : "error"}`}>
              {phoneMessage}
            </span>
          </div>
        )}
      </div>
      <div id="6" style={{ display: currentId === 6 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">생일</p>
        <p className="sign-up-modal-birthday-info">
          만 18세 이상의 성인만 회원으로 가입할 수 있습니다. 생일은 다른
          퍼퓸투데이 이용자에게 공개되지 않습니다.
        </p>

        <div className="sign-up-modal-birthday-selectors">
          <div className="sign-up-modal-birthday-month-selector">
            <Selector
              options={monthList}
              disabledOptions={disabledMoths}
              defaultValue="월"
              value={birthMonth}
              onChange={onChangeBirthMonth}
              isValid={!!birthMonth}
            />
          </div>
          <div className="sign-up-modal-birthday-day-selector">
            <Selector
              options={dayList}
              disabledOptions={disabledDays}
              defaultValue="일"
              value={birthDay}
              onChange={onChangeBirthDay}
              isValid={!!birthDay}
            />
          </div>
          <div className="sign-up-modal-birthday-year-selector">
            <Selector
              options={yearList}
              disabledOptions={disabledYears}
              defaultValue="년"
              value={birthYear}
              onChange={onChangeBirthYear}
              isValid={!!birthYear}
            />
          </div>
        </div>
        <div className="sign-up-modal-birthday-selectors">
          <div className="sign-up-gender-selector">
            <p className="sign-up-birthdat-label">성별</p>
            <Selector
              options={genderList}
              disabledOptions={disabledGender}
              defaultValue="성별"
              value={gender}
              onChange={onChangeGender}
              isValid={!!gender}
            />
          </div>
        </div>
      </div>

      <div className="sign-up-modal-submit-button-wrapper">
        {currentId > 0 && (
          <Button
            type="button"
            onClick={handlePrevClick}
            className={currentId === 1 ? "disabled" : ""}
            disabled={currentId === 1}>
            이전
          </Button>
        )}

        {currentId < 6 ? (
          <Button
            type="button"
            onClick={handleNextClick}
            disabled={!isValidationReady}
            className="sign-up-previous-next-button"
            style={{
              backgroundColor: isValidationReady ? "skyblue" : "gray",
              color: "white",
            }}>
            다음
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={onSubmitSignUp}
            color="bittersweet"
            disabled={!isValidationReady}
            className="sign-up-previous-next-button"
            style={{
              backgroundColor: isValidationReady ? "#FF385C" : "gray",
              color: "white",
            }}>
            가입 하기
          </Button>
        )}
      </div>
      <p>
        이미 퍼퓸투데이 계정이 있나요?
        <span
          className="sign-up-modal-set-login"
          role="presentation"
          onClick={changeToLoginModal}>
          로그인
        </span>
      </p>
    </Container>
  );
};

export default SignUpModal;
