import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NameList = ({ names }) => {
  return (
    <StyledWrapper>
      {names.map((name) => {
        return <p>{name}</p>;
      })}
    </StyledWrapper>
  );
};

export default NameList;
