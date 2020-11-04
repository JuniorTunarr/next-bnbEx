import React from "react";
import styled from "styled-components";
import { wrapper } from "../store";

const Container = styled.div`
  font-size: 21px;
  color: gray;
`;

const index: React.FC = () => {
  return <Container></Container>;
};

export const getServerSideProps = wrapper.getServerSideProps(async () => {
  return { props: { c: "As" } };
});
export default index;
