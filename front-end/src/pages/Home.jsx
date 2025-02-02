import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/logo1.jpg";
import Robot from "../assets/robot.gif";

function Home() {
  return (
    <Background>
      <Container>
        <Logo src={Robot} alt="Robot" />
        <Title>Welcome to MatchID Chat Box</Title>
        <LinkButton to="/login">Sign Up / Sign In</LinkButton>
      </Container>
    </Background>
  );
}

export default Home;

const Background = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #131324;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  text-align: center;
  color: white;
`;

const Logo = styled.img`
  height: 250px;
  margin-bottom: 20px;
  border-radius: 20rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: rgb(83, 105, 213);
`;

const LinkButton = styled(Link)`
  padding: 10px 20px;
  background-color: #fc802d;
  color: white;
  text-decoration: none;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #fc802d;
  }
`;
