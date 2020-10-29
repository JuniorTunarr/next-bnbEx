import reset from "styled-reset";
import { createGlobalStyle, css } from "styled-components";
import pallete from "./palette";

const globalStyle = css`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    font-family: Noto Sans, Noto Sans KR;
    color: ${pallete.black};
  }
`;

const GlobalStyle = createGlobalStyle`
    ${globalStyle};
`;

export default GlobalStyle;
