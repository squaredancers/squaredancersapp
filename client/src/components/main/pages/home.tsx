import styled from "@emotion/styled";

const CenteredText = styled.div`
  display: flex;
  justify-content: center; /* Centers content horizontally */
  align-items: center; /* Centers content vertically */
  height: 500px;
  width: 100%;
  font-size: 25px;
  font-weight: bold;
`;
export const HomePage = () => {
  return (
    <CenteredText>
      <div>Welcome to the Triangle squares application</div>
    </CenteredText>
  );
};
