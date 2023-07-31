import styled from "styled-components";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const StyledNameCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid black;
  padding: 5px;
`;

const NameList = ({ names }) => {
  return (
    <StyledWrapper>
      {names.map((name) => {
        return <StyledNameCard>{name}</StyledNameCard>;
      })}
    </StyledWrapper>
  );
};

export default NameList;
