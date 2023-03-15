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
import { db, fbAuth } from "../../firebase.config";

const Container = styled.form`
  width: 532px;
  padding: 45px;
  background-color: white;
  z-index: 11;

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

const SignUpModal: ForwardRefRenderFunction<HTMLInputElement, IProps> = ({
  closeModal,
}) => {
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
  const [idFocused, setIdFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [newAccount, setNewAccount] = useState(true);

  const [existingEmail, setExistingEmail] = useState("");
  const [existingNickname, setExistingNickname] = useState("");
  const [currentId, setCurrentId] = useState(1);
  const [isValidationReady, setIsValidationReady] = useState(false);
  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onChange", resolver: yupResolver(signUpSchema) });
  const dispatch = useDispatch();
  const { setValidateMode } = useValidateMode();
  //*비밀번호 숨김 토글하기
  const toggleHidePassword = useCallback(() => {
    setHidePassword(!hidePassword);
  }, [hidePassword]);

  //* 아이디 인풋 포커스 되었을때
  const onFocusId = useCallback(() => {
    setIdFocused(true);
  }, [idFocused]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //* id가 이메일 형식인지
  const isIdEmailForm = useMemo(() => {
    return (email: string) => emailRegex.test(email);
  }, []);
  //* 비밀번호 인풋 포커스 되었을때
  const onFocusPassword = useCallback(() => {
    setPasswordFocused(true);
  }, [passwordFocused]);

  //* password가 이름이나 이메일을 포함하는지
  const isPasswordHasNameOrEmail = useMemo(
    () =>
      !password ||
      !name ||
      password.includes(name) ||
      password.includes(email.split("@")[0]),
    [password, name, email]
  );

  //* 비밀번호가 최소 자리수 이상인지
  const isPasswordOverMinLength = useMemo(
    () => password.length >= PASSWORD_MIN_LENGTH,
    [password]
  );

  //* 비밀번호가 숫자나 특수기호를 포함하는지
  const isPasswordHasNumberOrSymbol = useMemo(
    () =>
      !(
        /[{}[\]/?.,;:|)*~`!^\-_+<>@#$%&\\=('"]/g.test(password) ||
        /[0-9]/g.test(password)
      ),
    [password]
  );

  //* 이메일 주소 변경시
  const onChangeEmail = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const email = event.target.value;
      setEmail(email);
    },
    []
  );

  //* 이름 변경시
  const onChangeName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    []
  );
  //* 닉네임 변경시
  const onChangeNickname = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(event.target.value);
    },
    []
  );
  //* 휴대폰 변경시
  const onChangePhone = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPhone(event.target.value);
    },
    []
  );

  //* 비밀번호 변경시
  const onChangePassword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    []
  );
  //* 비밀번호확인 변경시
  const onChangePasswordConfirm = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(event.target.value);
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
    //* 비밀번호가 올바르지 않다면
    if (
      isPasswordHasNameOrEmail ||
      !isPasswordOverMinLength ||
      isPasswordHasNumberOrSymbol
    ) {
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

  // db에서 일치하는 값이 있으면 저장
  useEffect(() => {
    const fetchEmail = async () => {
      const q = query(
        collection(db, "users"),
        where("email", "==", existingEmail)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setExistingEmail(querySnapshot.docs[0].data().email);
      }
    };
    const fetchNickname = async () => {
      const q = query(
        collection(db, "users"),
        where("nickname", "==", existingNickname)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setExistingNickname(querySnapshot.docs[0].data().nickname);
      }
    };
    fetchEmail();
    fetchNickname();
  }, [existingEmail, existingNickname]);

  const handleNextClick = () => {
    setCurrentId(currentId + 1);
  };

  const handlePrevClick = () => {
    setCurrentId(currentId - 1);
  };

  //  yup + onChange 동시에 써보기
  const handleChange = (e: any) => {
    setValue(e.target.name, e.target.value);
  };
  // onchange 핸들러
  const handleEmailChange = (event: any) => {
    onChangeEmail(event);
    handleChange(event);
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
          )}-${birthDay!.replace("일", "")}T00:00:00.000Z`,
          gender,
        };
        if (newAccount) {
          // create account
          userData = await createUserWithEmailAndPassword(
            fbAuth,
            email,
            password
          );
          // firebase에 올릴 양식
          const docRef = await addDoc(collection(db, "user"), {
            email,
            name,
            nickname,
            phone,
            birthday: `${birthYear!.replace("년", "")}-${birthMonth!.replace(
              "월",
              ""
            )}-${birthDay!.replace("일", "")}T00:00:00.000Z`,
            gender,
          });
          alert("회원 가입이 완료되었습니다.");
        } else {
          userData = await signInWithEmailAndPassword(fbAuth, email, password);
          alert("이미 가입된 계정이 있습니다.");
        }
        const { data } = await signupAPI(signUpBody);
        dispatch(userActions.setLoggedUser(data));
        closeModal();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleValidation = async (data: any) => {
    try {
      await signUpSchema.validate(data, { abortEarly: false });
      setIsValidationReady(true);
    } catch (error) {
      setError(error.inner);
    }
  };
  //* firestore에 email 검증
  const validateEmail = async (value: any, setError: any) => {
    const q = query(collection(db, "users"), where("email", "==", value));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setError("email", {
        type: "manual",
        message: "이미 존재하는 이메일입니다",
      });
      return false; // return false to indicate validation failed
    }
    setExistingEmail(value);
    return true; // return true to indicate validation passed
  };

  //* 로그인 모달로 변경하기
  const changeToLoginModal = useCallback(() => {
    dispatch(authActions.setAuthMode("login"));
  }, []);

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
        <Input
          placeholder="이메일"
          type="email"
          icon={<MailIcon />}
          isValid={!!email && !isIdEmailForm(email)}
          value={email}
          onChange={handleEmailChange}
          onFocus={onFocusId}
          onBlur={() => {
            setIdFocused(false);
            handleValidation({ email });
          }}
          useValidation
          errorMessage="이메일이 필요합니다."
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div id="2" style={{ display: currentId === 2 ? "block" : "none" }}>
        <div className="input-wrapper sign-up-password-input-wrapper">
          <Input
            placeholder="비밀번호 설정"
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
            isValid={isPasswordOverMinLength && !isPasswordHasNumberOrSymbol}
            errorMessage="비밀번호가 양식에 맞지 않습니다"
            onFocus={onFocusPassword}
            onBlur={() => setPasswordFocused(false)}
          />
        </div>
        {passwordFocused && (
          <>
            <PasswordWarning
              isValid={!isPasswordOverMinLength}
              text="최소 8자"
            />
            <PasswordWarning
              isValid={isPasswordHasNumberOrSymbol}
              text="숫자나 기호를 포함하세요."
            />
          </>
        )}
        <div className="input-wrapper sign-up-password-input-wrapper">
          <Input
            placeholder="비밀번호 확인"
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
            isValid={!!passwordConfirm && password === passwordConfirm}
            errorMessage="비밀번호가 일치하지 않습니다"
            onFocus={onFocusPassword}
          />
        </div>
      </div>

      <div
        className="input-wrapper"
        id="3"
        style={{ display: currentId === 3 ? "block" : "none" }}>
        <Input
          placeholder="이름"
          icon={<PersonIcon />}
          value={name}
          onChange={onChangeName}
          useValidation
          isValid={!!name}
          errorMessage="이름을 입력해주세요"
        />
      </div>
      <div
        className="input-wrapper"
        id="4"
        style={{ display: currentId === 4 ? "block" : "none" }}>
        <Input
          placeholder="닉네임"
          icon={<PersonIcon />}
          value={nickname}
          onChange={onChangeNickname}
          useValidation
          isValid={!!nickname}
          errorMessage="닉네임을 입력해주세요"
        />
      </div>

      <div
        className="input-wrapper"
        id="5"
        style={{ display: currentId === 5 ? "block" : "none" }}>
        <Input
          placeholder="전화번호"
          icon={<PersonIcon />}
          value={phone}
          type="number"
          onChange={onChangePhone}
          useValidation
          isValid={!!phone}
          errorMessage="전화번호를 입력하세요.(-제외)"
        />
      </div>
      <div id="6" style={{ display: currentId === 6 ? "block" : "none" }}>
        <p className="sign-up-birthdat-label">생일</p>
        <p className="sign-up-modal-birthday-info">
          만 18세 이상의 성인만 회원으로 가입할 수 있습니다. 생일은 다른
          에어비앤비 이용자에게 공개되지 않습니다.
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
            color="bittersweet"
            className="sign-up-previous-next-button">
            가입 하기
          </Button>
        )}
      </div>
      <p>
        이미 에어비앤비 계정이 있나요?
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
